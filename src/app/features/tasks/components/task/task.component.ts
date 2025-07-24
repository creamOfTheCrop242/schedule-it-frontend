import { Component, inject, input } from '@angular/core';
import { Task } from '../../models/task.model';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { take } from 'rxjs';

@Component({
  selector: 'app-task',
  imports: [CommonModule],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  task = input<Task>();
  expandedTaskId: string | null = null;
  taskService = inject(TaskService);

  toggleDescription(taskId: string): void {
    if (this.expandedTaskId === taskId) {
      this.expandedTaskId = null;
    } else {
      this.expandedTaskId = taskId;
    }
  }

  isExpanded(taskId: string): boolean {
    return this.expandedTaskId === taskId;
  }

  completeTask(boolean: boolean, event?: Event) {
    if (event) {
      event.stopPropagation();

      this.taskService
        .modifyTask({
          id: this.task().id,
          completed: boolean,
        })
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.taskService.tasks.reload();
          },
          error: (error) => {
            console.error(error);
          },
        });
    }
  }
}
