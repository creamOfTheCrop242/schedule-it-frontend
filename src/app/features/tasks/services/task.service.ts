import { HttpClient, httpResource } from '@angular/common/http';
import { computed, effect, inject, Injectable } from '@angular/core';
import { AddTask, Task } from '../models/task.model';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TaskService {
  httpClient = inject(HttpClient);

  completedTasks = computed(() => {
    const completedTasks = this.tasks?.value();
    return completedTasks
      ? completedTasks.filter((task) => task.completed)
      : null;
  });

  incompleteTasks = computed(() => {
    const incompleteTasks = this.tasks?.value();
    return incompleteTasks
      ? incompleteTasks.filter((task) => !task.completed)
      : null;
  });

  constructor() {
    effect(() => {
      console.log(this.completedTasks());
    });
  }

  addTask(task: AddTask) {
    return this.httpClient.post<Task>(`${environment.baseUrl}/tasks`, task);
  }

  tasks = httpResource<Task[]>({
    url: `${environment.baseUrl}/tasks`,
  });

  modifyTask(task) {
    return this.httpClient.patch(`${environment.baseUrl}/tasks`, task);
  }
}
