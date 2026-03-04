import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AddLog, Log } from '../models/log.model';

@Injectable({
  providedIn: 'root',
})
export class LogService {
  httpClient = inject(HttpClient);

  addLog(log: AddLog) {
    return this.httpClient.post<Log>(`${environment.baseUrl}/logs`, log);
  }

  updateLog(log: Log) {
    return this.httpClient.patch<Log>(
      `${environment.baseUrl}/logs/${log.id}`,
      log
    );
  }

  allLogs = httpResource<Log[]>({
    url: `${environment.baseUrl}/logs`,
  });

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
