import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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

  allTasks = httpResource<Task[]>(() => ({
    url: `${environment.baseUrl}/tasks`,
  }));

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
