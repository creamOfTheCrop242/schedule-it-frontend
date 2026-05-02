import { HttpErrorResponse } from '@angular/common/http';
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
import { catchError, finalize, map, of, switchMap, take } from 'rxjs';
import { LogComponent } from '../../../logs/components/log/log.component';
import { Log } from '../../../logs/models/log.model';
import { PersonalGoalRow } from '../../models/personal-goal.model';
import { PersonalGoalsService } from '../../services/personal-goals.service';

@Component({
  selector: 'app-personal-goal-detail',
  imports: [CommonModule, RouterLink, LogComponent],
  templateUrl: './personal-goal-detail.component.html',
  styleUrl: './personal-goal-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalGoalDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly personalGoalsService = inject(PersonalGoalsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly goal = signal<PersonalGoalRow | undefined>(undefined);
  readonly linkedLogs = signal<Log[]>([]);
  /** True when goal loaded but the linked-logs request failed (goal still shown). */
  readonly linkedLogsLoadError = signal(false);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);
  readonly deleteConfirmId = signal<string | null>(null);
  readonly actionsMenuOpen = signal(false);

  readonly coachingText = signal<string | null>(null);
  readonly coachingLoading = signal(false);
  readonly coachingError = signal<string | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.loadError.set(true);
            this.isLoading.set(false);
            this.linkedLogs.set([]);
            this.linkedLogsLoadError.set(false);
            return of<{
              goal: PersonalGoalRow | undefined;
              logs: Log[];
              logsError: boolean;
            }>({ goal: undefined, logs: [], logsError: false });
          }
          this.isLoading.set(true);
          this.loadError.set(false);
          return this.personalGoalsService.getOne(id).pipe(
            switchMap((goal) =>
              this.personalGoalsService.getLinkedLogs(id).pipe(
                map((logs) => ({ goal, logs, logsError: false as const })),
                catchError(() =>
                  of({ goal, logs: [] as Log[], logsError: true as const }),
                ),
              ),
            ),
            catchError(() => {
              this.loadError.set(true);
              return of({
                goal: undefined,
                logs: [] as Log[],
                logsError: false,
              });
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ goal, logs, logsError }) => {
        this.actionsMenuOpen.set(false);
        this.deleteConfirmId.set(null);
        this.goal.set(goal);
        this.linkedLogs.set(logs);
        this.linkedLogsLoadError.set(logsError);
        this.coachingText.set(null);
        this.coachingError.set(null);
        this.coachingLoading.set(false);
      });
  }

  requestCoaching(goalId: string): void {
    if (this.coachingLoading()) {
      return;
    }
    this.coachingError.set(null);
    this.coachingLoading.set(true);
    this.personalGoalsService
      .requestCoaching(goalId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ advice }) => {
          this.coachingText.set(advice);
          this.coachingLoading.set(false);
        },
        error: (err: unknown) => {
          this.coachingLoading.set(false);
          this.coachingError.set(
            PersonalGoalDetailComponent.httpErrorMessage(err),
          );
        },
      });
  }

  private static httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | undefined;
      if (body?.message !== undefined) {
        return Array.isArray(body.message)
          ? body.message.join('; ')
          : body.message;
      }
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong.';
  }

  toggleActionsMenu(): void {
    this.actionsMenuOpen.update((open) => !open);
  }

  closeActionsMenu(): void {
    this.actionsMenuOpen.set(false);
  }

  deleteGoal(id: string): void {
    this.actionsMenuOpen.set(false);
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
    this.actionsMenuOpen.set(false);
  }

  confirmDelete(id: string): void {
    this.actionsMenuOpen.set(false);
    this.personalGoalsService.delete(id).pipe(take(1)).subscribe({
      next: () => {
        this.personalGoalsService.personalGoalsOptions.reload();
        this.deleteConfirmId.set(null);
        void this.router.navigate(['/personal-goals']);
      },
    });
  }
}
