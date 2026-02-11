import { HttpClient, httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AddLog, Log } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  httpClient = inject(HttpClient);
  selectedDate = signal<string>('');

  constructor() {
    effect(() => {});
  }

  addLog(log: AddLog) {
    return this.httpClient.post<Log>(`${environment.baseUrl}/logs`, log);
  }

  updateLog(log: Log) {
    return this.httpClient.patch<Log>(
      `${environment.baseUrl}/logs/${log.id}`,
      log
    );
  }

  incompleteLogs = httpResource<Log[]>({
    url: `${environment.baseUrl}/logs`,
    params: {
      status: 'false',
    },
  });

  completeLogs = httpResource<Log[]>(() => ({
    url: `${environment.baseUrl}/logs`,
    params: {
      status: 'true',
      completedDate: this.selectedDate(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }));

  toggleLogStatus(log: { id: string; completed: boolean }) {
    return this.httpClient.patch(
      `${environment.baseUrl}/logs/${log.id}/toggle-status`,
      log
    );
  }

  deleteLog(id: string) {
    return this.httpClient.delete(`${environment.baseUrl}/logs/${id}`);
  }
}
