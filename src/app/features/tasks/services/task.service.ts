import { HttpClient, httpResource } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { AddTask, Task } from '../models/task.model';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  httpClient = inject(HttpClient);
  selectedDate = signal<string>('');

  constructor() {
    effect(() => {});
  }

  addTask(task: AddTask) {
    return this.httpClient.post<Task>(`${environment.baseUrl}/tasks`, task);
  }

  incompleteTasks = httpResource<Task[]>({
    url: `${environment.baseUrl}/tasks`,
    params: {
      status: 'false',
    },
  });

  completeTasks = httpResource<Task[]>(() => ({
    url: `${environment.baseUrl}/tasks`,
    params: {
      status: 'true',
      completedDate: this.selectedDate(),
      timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    },
  }));

  toggleTaskStatus(task) {
    return this.httpClient.patch(
      `${environment.baseUrl}/tasks/${task.id}/toggle-status`,
      task
    );
  }

  deleteTask(id: string) {
    return this.httpClient.delete(`${environment.baseUrl}/tasks/${id}`);
  }
}
