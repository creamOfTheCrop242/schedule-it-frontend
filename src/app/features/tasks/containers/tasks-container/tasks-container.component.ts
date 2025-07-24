import { Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskComponent } from '../../components/task/task.component';

@Component({
  selector: 'app-tasks-container',
  imports: [RouterModule, TaskComponent],
  templateUrl: './tasks-container.component.html',
  styleUrl: './tasks-container.component.scss',
})
export class TasksContainerComponent {
  taskService = inject(TaskService);
  isLoading = this.taskService.tasks.isLoading;
  hasError = this.taskService.tasks.error;
  completedTasks = this.taskService.completedTasks;
  incompleteTasks = this.taskService.incompleteTasks;

  constructor() {}
}
