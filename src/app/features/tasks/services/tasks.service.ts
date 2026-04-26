import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTaskPayload,
  Task,
  UpdateTaskPayload,
} from '../models/task.model';

/** Page size for GET /tasks (must match default backend limit). */
export const TASKS_PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class TasksService {
  private readonly httpClient = inject(HttpClient);

  /** Local calendar day (`yyyy-MM-dd`) for list filter; mirrors logs. */
  selectedDate = signal<string | null>(null);
  /** `open` | `done` | null (all). */
  filterCompletion = signal<'open' | 'done' | null>(null);
  /** Substring on title and description (server-side). */
  searchQuery = signal('');

  readonly tasksList = signal<Task[]>([]);
  readonly tasksListLoading = signal(false);
  readonly tasksListLoadingMore = signal(false);
  readonly tasksListError = signal(false);
  readonly tasksHasMore = signal(true);

  private listRequestSeq = 0;
  private activeListSub: Subscription | null = null;

  private filterParams(): HttpParams {
    let params = new HttpParams();
    const date = this.selectedDate();
    if (date) {
      params = params
        .set('completedDate', date)
        .set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    const completion = this.filterCompletion();
    if (completion) {
      params = params.set('completion', completion);
    }
    const search = this.searchQuery().trim();
    if (search) {
      params = params.set('search', search);
    }
    return params;
  }

  private listParamsWithPagination(offset: number): HttpParams {
    return this.filterParams()
      .set('limit', String(TASKS_PAGE_SIZE))
      .set('offset', String(offset));
  }

  loadTasksPage(reset: boolean): void {
    const seq = ++this.listRequestSeq;
    const offset = reset ? 0 : this.tasksList().length;

    if (reset) {
      this.tasksListLoading.set(true);
      this.tasksListError.set(false);
      this.tasksHasMore.set(true);
    } else {
      if (
        !this.tasksHasMore() ||
        this.tasksListLoadingMore() ||
        this.tasksListLoading()
      ) {
        return;
      }
      this.tasksListLoadingMore.set(true);
    }

    this.activeListSub?.unsubscribe();
    const params = this.listParamsWithPagination(offset);
    this.activeListSub = this.httpClient
      .get<Task[]>(`${environment.baseUrl}/tasks`, { params })
      .subscribe({
        next: (rows) => {
          if (seq !== this.listRequestSeq) {
            return;
          }
          if (reset) {
            this.tasksList.set(rows);
          } else {
            this.tasksList.update((prev) => [...prev, ...rows]);
          }
          this.tasksHasMore.set(rows.length === TASKS_PAGE_SIZE);
          this.tasksListLoading.set(false);
          this.tasksListLoadingMore.set(false);
          this.activeListSub = null;
        },
        error: () => {
          if (seq !== this.listRequestSeq) {
            return;
          }
          this.tasksListError.set(true);
          this.tasksListLoading.set(false);
          this.tasksListLoadingMore.set(false);
          this.activeListSub = null;
        },
      });
  }

  reloadTasksList(): void {
    this.loadTasksPage(true);
  }

  clearCompletionAndSearch(): void {
    this.filterCompletion.set(null);
    this.searchQuery.set('');
  }

  getTask(id: string) {
    return this.httpClient.get<Task>(`${environment.baseUrl}/tasks/${id}`);
  }

  create(payload: CreateTaskPayload) {
    return this.httpClient.post<Task>(
      `${environment.baseUrl}/tasks`,
      payload,
    );
  }

  updateTask(id: string, payload: UpdateTaskPayload) {
    return this.httpClient.patch<Task>(
      `${environment.baseUrl}/tasks/${id}`,
      payload,
    );
  }

  deleteTask(id: string) {
    return this.httpClient.delete<void>(`${environment.baseUrl}/tasks/${id}`);
  }

  completeTask(id: string) {
    return this.httpClient.post<Task>(
      `${environment.baseUrl}/tasks/${id}/complete`,
      {},
    );
  }

  reopenTask(id: string) {
    return this.httpClient.post<Task>(
      `${environment.baseUrl}/tasks/${id}/reopen`,
      {},
    );
  }
}
