import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Task } from '../../models/task.model';
import { TaskService } from '../../services/task.service';
import { GoalsService } from '../../../goals/services/goals.service';

@Component({
  selector: 'app-task',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './task.component.html',
  styleUrl: './task.component.scss',
})
export class TaskComponent {
  task = input<Task>();
  expandedTaskId: string | null = null;
  taskService = inject(TaskService);
  goalsService = inject(GoalsService);

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

  deleteTask(id: string) {
    this.taskService.deleteTask(id).subscribe({
      next: (response) => {
        if (this.task().completed) {
          this.taskService.completeTasks.reload();
        } else {
          this.taskService.incompleteTasks.reload();
        }
      },
    });
  }

  completeTask(boolean: boolean, event?: Event) {
    if (event) {
      event.stopPropagation();

      this.taskService
        .toggleTaskStatus({
          id: this.task().id,
          completed: boolean,
        })
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.taskService.incompleteTasks.reload();
            this.taskService.completeTasks.reload();
            this.goalsService.tasksGoalStatus.reload();
          },
          error: (error) => {
            console.error(error);
          },
        });
    }
  }
}
