import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AddLog, Log } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  httpClient = inject(HttpClient);

  selectedDate = signal<string | null>(null);
  /** Exact mood match for GET /logs; null = all moods. */
  filterMood = signal<string | null>(null);
  /** Substring search on log title and surroundings (server-side). */
  searchQuery = signal('');

  private listQueryParams(): HttpParams {
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

  private moodOptionsQueryParams(): HttpParams {
    let params = new HttpParams();
    const date = this.selectedDate();
    if (date) {
      params = params
        .set('completedDate', date)
        .set('timeZone', Intl.DateTimeFormat().resolvedOptions().timeZone);
    }
    const search = this.searchQuery().trim();
    if (search) {
      params = params.set('search', search);
    }
    return params;
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

  allLogs = httpResource<Log[]>(() => ({
    url: `${environment.baseUrl}/logs`,
    params: this.listQueryParams(),
  }));

  /** Distinct moods for the current date + search slice (no mood param). */
  moodOptions = httpResource<string[]>(() => ({
    url: `${environment.baseUrl}/logs/mood-options`,
    params: this.moodOptionsQueryParams(),
  }));

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
