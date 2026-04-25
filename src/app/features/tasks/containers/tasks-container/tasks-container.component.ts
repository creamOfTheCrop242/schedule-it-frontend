import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks-container',
  imports: [RouterLink],
  templateUrl: './tasks-container.component.html',
  styleUrl: './tasks-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksContainerComponent {
  private readonly tasksService = inject(TasksService);

  readonly allTasks = this.tasksService.allTasks;
  readonly isLoading = this.allTasks.isLoading;
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
