import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, take } from 'rxjs';
import { GoalsService } from '../../../goals/services/goals.service';
import { LogService } from '../../../logs/services/log.service';
import { Task } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  private readonly logService = inject(LogService);
  private readonly goalsService = inject(GoalsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly task = signal<Task | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);
  readonly deleteConfirmId = signal<string | null>(null);
  /** Edit / Complete / Re open / Delete overflow menu. */
  readonly actionsMenuOpen = signal(false);
  readonly actionError = signal<string | null>(null);
  /** True while Complete / Re open HTTP request is in flight; menu stays open until it finishes. */
  readonly completeReopenInProgress = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.loadError.set(true);
            this.isLoading.set(false);
            return of(undefined);
          }
          this.isLoading.set(true);
          this.loadError.set(false);
          return this.tasksService.getTask(id).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of(undefined);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((t) => {
        this.actionsMenuOpen.set(false);
        this.completeReopenInProgress.set(false);
        this.deleteConfirmId.set(null);
        this.actionError.set(null);
        this.task.set(t);
      });
  }

  toggleActionsMenu(): void {
    if (this.actionsMenuOpen() && this.completeReopenInProgress()) return;
    this.actionsMenuOpen.update((open) => !open);
  }

  closeActionsMenu(): void {
    if (this.completeReopenInProgress()) return;
    this.actionsMenuOpen.set(false);
  }

  deleteTask(id: string): void {
    if (this.completeReopenInProgress()) return;
    this.actionsMenuOpen.set(false);
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
    this.actionsMenuOpen.set(false);
  }

  confirmDelete(id: string): void {
    this.actionsMenuOpen.set(false);
    this.tasksService.deleteTask(id).pipe(take(1)).subscribe({
      next: () => {
        this.tasksService.reloadTasksList();
        this.deleteConfirmId.set(null);
        void this.router.navigate(['/tasks']);
      },
    });
  }

  onCompleteOrReopen(taskId: string): void {
    if (this.completeReopenInProgress()) return;
    this.actionError.set(null);
    const current = this.task();
    this.completeReopenInProgress.set(true);

    const op = current?.completedDate
      ? this.tasksService.reopenTask(taskId)
      : this.tasksService.completeTask(taskId);

    op.pipe(
      take(1),
      finalize(() => {
        this.completeReopenInProgress.set(false);
        this.actionsMenuOpen.set(false);
      }),
    ).subscribe({
      next: (updated) => {
        this.task.set(updated);
        this.tasksService.reloadTasksList();
        this.goalsService.logsGoalStatus.reload();
        if (updated.completedDate) {
          this.logService.reloadLogsList();
        }
      },
      error: () =>
        this.actionError.set(
          'Could not update task status. Please try again.',
        ),
    });
  }
}
