import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  CreateTaskPayload,
  Task,
  UpdateTaskPayload,
} from '../models/task.model';

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

  private listQueryParams(): HttpParams {
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

  allTasks = httpResource<Task[]>(() => ({
    url: `${environment.baseUrl}/tasks`,
    params: this.listQueryParams(),
  }));

  clearCompletionAndSearch(): void {
    this.filterCompletion.set(null);
    this.searchQuery.set('');
  }

  getTask(id: string): Observable<Task> {
    return this.httpClient.get<Task>(`${environment.baseUrl}/tasks/${id}`);
  }

  create(payload: CreateTaskPayload): Observable<Task> {
    return this.httpClient.post<Task>(`${environment.baseUrl}/tasks`, payload);
  }

  updateTask(id: string, payload: UpdateTaskPayload): Observable<Task> {
    return this.httpClient.patch<Task>(
      `${environment.baseUrl}/tasks/${id}`,
      payload,
    );
  }

  deleteTask(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${environment.baseUrl}/tasks/${id}`);
  }

  completeTask(id: string): Observable<Task> {
    return this.httpClient.post<Task>(
      `${environment.baseUrl}/tasks/${id}/complete`,
      {},
    );
  }

  reopenTask(id: string): Observable<Task> {
    return this.httpClient.post<Task>(
      `${environment.baseUrl}/tasks/${id}/reopen`,
      {},
    );
  }
}
