import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks-container',
  imports: [CommonModule, RouterLink],
  templateUrl: './tasks-container.component.html',
  styleUrl: './tasks-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksContainerComponent {
  readonly tasksService = inject(TasksService);

  readonly allTasks = this.tasksService.allTasks;
  readonly isLoading = this.allTasks.isLoading;
  readonly showInitialLoading = computed(
    () => this.isLoading() && !this.allTasks.hasValue(),
  );
  readonly hasLoadError = computed(
    () => this.allTasks.status() === ResourceStatus.Error,
  );
  readonly tasks = computed(() => this.allTasks.value() ?? []);
  readonly showEmpty = computed(
    () =>
      this.allTasks.status() === ResourceStatus.Resolved &&
      this.tasks().length === 0,
  );
  readonly showList = computed(
    () =>
      this.allTasks.status() === ResourceStatus.Resolved &&
      this.tasks().length > 0,
  );
}
