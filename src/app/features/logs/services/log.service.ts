import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { AddLog, Log } from '../models/log.model';

/** Page size for GET /logs (must match default backend limit). */
export const LOGS_PAGE_SIZE = 10;

@Injectable({
  providedIn: 'root',
})
export class LogService {
  private readonly httpClient = inject(HttpClient);

  selectedDate = signal<string | null>(null);
  /** Exact mood match for GET /logs; null = all moods. */
  filterMood = signal<string | null>(null);
  /** Substring search on log title and surroundings (server-side). */
  searchQuery = signal('');

  /** Accumulated rows for the logs list (infinite scroll). */
  readonly logsList = signal<Log[]>([]);
  /** True while loading the first page or replacing after filter change. */
  readonly logsListLoading = signal(false);
  /** True while appending the next page. */
  readonly logsListLoadingMore = signal(false);
  readonly logsListError = signal(false);
  /** False when the last page returned fewer than `LOGS_PAGE_SIZE` items. */
  readonly logsHasMore = signal(true);

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
    const mood = this.filterMood();
    if (mood) {
      params = params.set('mood', mood);
    }
    const search = this.searchQuery().trim();
    if (search) {
      params = params.set('search', search);
    }
    return params;
  }

  private listParamsWithPagination(offset: number): HttpParams {
    return this.filterParams()
      .set('limit', String(LOGS_PAGE_SIZE))
      .set('offset', String(offset));
  }

  private moodOptionsQueryParams(): HttpParams {
    return this.filterParams();
  }

  addLog(log: AddLog) {
    return this.httpClient.post<Log>(`${environment.baseUrl}/logs`, log);
  }

  updateLog(log: AddLog & { id: string }) {
    const { id, ...body } = log;
    return this.httpClient.patch<Log>(
      `${environment.baseUrl}/logs/${id}`,
      body,
    );
  }

  /** Distinct moods for the current date + search slice (no mood param). */
  moodOptions = httpResource<string[]>(() => ({
    url: `${environment.baseUrl}/logs/mood-options`,
    params: this.moodOptionsQueryParams(),
  }));

  /**
   * Load one page: `reset` replaces from offset 0; otherwise appends using current list length as offset.
   */
  loadLogsPage(reset: boolean): void {
    const seq = ++this.listRequestSeq;
    const offset = reset ? 0 : this.logsList().length;

    if (reset) {
      this.logsListLoading.set(true);
      this.logsListError.set(false);
      this.logsHasMore.set(true);
    } else {
      if (
        !this.logsHasMore() ||
        this.logsListLoadingMore() ||
        this.logsListLoading()
      ) {
        return;
      }
      this.logsListLoadingMore.set(true);
    }

    this.activeListSub?.unsubscribe();
    const params = this.listParamsWithPagination(offset);
    this.activeListSub = this.httpClient
      .get<Log[]>(`${environment.baseUrl}/logs`, { params })
      .subscribe({
        next: (rows) => {
          if (seq !== this.listRequestSeq) {
            return;
          }
          if (reset) {
            this.logsList.set(rows);
          } else {
            this.logsList.update((prev) => [...prev, ...rows]);
          }
          this.logsHasMore.set(rows.length === LOGS_PAGE_SIZE);
          this.logsListLoading.set(false);
          this.logsListLoadingMore.set(false);
          this.activeListSub = null;
        },
        error: () => {
          if (seq !== this.listRequestSeq) {
            return;
          }
          this.logsListError.set(true);
          this.logsListLoading.set(false);
          this.logsListLoadingMore.set(false);
          this.activeListSub = null;
        },
      });
  }

  /** Reset list and fetch the first page (call after filter changes or mutations). */
  reloadLogsList(): void {
    this.loadLogsPage(true);
  }

  deleteLog(id: string) {
    return this.httpClient.delete(`${environment.baseUrl}/logs/${id}`);
  }

  getLog(id: string) {
    return this.httpClient.get<Log>(`${environment.baseUrl}/logs/${id}`);
  }

  clearMoodAndSearch() {
    this.filterMood.set(null);
    this.searchQuery.set('');
  }
}
