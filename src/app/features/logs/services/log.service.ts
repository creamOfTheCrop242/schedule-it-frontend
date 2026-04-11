import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AddLog, Log } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  httpClient = inject(HttpClient);

  selectedDate = signal<string | null>(null);

  addLog(log: AddLog) {
    return this.httpClient.post<Log>(`${environment.baseUrl}/logs`, log);
  }

  updateLog(log: Log) {
    const { id, ...body } = log;
    return this.httpClient.patch<Log>(
      `${environment.baseUrl}/logs/${id}`,
      body
    );
  }

  allLogs = httpResource<Log[]>(() => {
    const date = this.selectedDate();
    const url = `${environment.baseUrl}/logs`;
    if (!date) {
      return { url };
    }
    return {
      url,
      params: {
        completedDate: date,
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      },
    };
  });

  deleteLog(id: string) {
    return this.httpClient.delete(`${environment.baseUrl}/logs/${id}`);
  }

  getLog(id: string) {
    return this.httpClient.get<Log>(`${environment.baseUrl}/logs/${id}`);
  }
}
