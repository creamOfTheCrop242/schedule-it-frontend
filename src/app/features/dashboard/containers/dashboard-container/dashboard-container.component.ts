import { CommonModule } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  ResourceStatus,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of, take } from 'rxjs';
import { OnboardingStateService } from '../../../onboarding/onboarding-state.service';
import { environment } from '../../../../../environments/environment';
import { HabitsService } from '../../../habits/services/habits.service';
import { HabitRow } from '../../../habits/models/habit.model';
import { Log } from '../../../logs/models/log.model';
import { GoalsService } from '../../../goals/services/goals.service';
import { Task } from '../../../tasks/models/task.model';
import { LogProgressCardComponent } from '../../components/log-progress-card/log-progress-card.component';

@Component({
  selector: 'app-dashboard-container',
  imports: [CommonModule, RouterLink, LogProgressCardComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardContainerComponent implements OnInit {
  private readonly http = inject(HttpClient);
  readonly goalsService = inject(GoalsService);
  private readonly habitsService = inject(HabitsService);
  readonly onboardingState = inject(OnboardingStateService);

  protected readonly ResourceStatus = ResourceStatus;

  readonly headerDate = signal('');
  readonly openTasks = signal<Task[]>([]);
  readonly recentLogs = signal<Log[]>([]);
  readonly tasksLoading = signal(true);
  readonly logsLoading = signal(true);
  readonly tasksError = signal(false);
  readonly logsError = signal(false);

  readonly habitsPreview = computed((): HabitRow[] => {
    const res = this.habitsService.habitsOptions;
    if (res.status() !== ResourceStatus.Resolved || !res.value()) {
      return [];
    }
    return res.value()!.slice(0, 3);
  });

  readonly habitsLoading = computed(
    () => this.habitsService.habitsOptions.status() === ResourceStatus.Loading,
  );

  readonly habitsError = computed(
    () => this.habitsService.habitsOptions.status() === ResourceStatus.Error,
  );

  readonly firstLogBannerDismissedLocal = signal(false);

  readonly showFirstLogBanner = computed(() => {
    if (this.firstLogBannerDismissedLocal()) {
      return false;
    }
    if (
      !this.onboardingState.isSkipped() ||
      this.onboardingState.isCompleted() ||
      this.onboardingState.isFirstLogBannerDismissed()
    ) {
      return false;
    }
    if (this.logsLoading() || this.logsError()) {
      return false;
    }
    return this.recentLogs().length === 0;
  });

  dismissFirstLogBanner(): void {
    this.onboardingState.dismissFirstLogBanner();
    this.firstLogBannerDismissedLocal.set(true);
  }

  ngOnInit(): void {
    this.headerDate.set(
      new Intl.DateTimeFormat(undefined, {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      }).format(new Date()),
    );

    this.habitsService.habitsOptions.reload();
    this.goalsService.reloadAllGoalStatus();

    const taskParams = new HttpParams()
      .set('completion', 'open')
      .set('limit', '3')
      .set('offset', '0');

    this.http
      .get<Task[]>(`${environment.baseUrl}/tasks`, { params: taskParams })
      .pipe(
        take(1),
        catchError(() => {
          this.tasksError.set(true);
          return of([] as Task[]);
        }),
        finalize(() => this.tasksLoading.set(false)),
      )
      .subscribe((rows) => this.openTasks.set(rows));

    const logParams = new HttpParams().set('limit', '3').set('offset', '0');

    this.http
      .get<Log[]>(`${environment.baseUrl}/logs`, { params: logParams })
      .pipe(
        take(1),
        catchError(() => {
          this.logsError.set(true);
          return of([] as Log[]);
        }),
        finalize(() => this.logsLoading.set(false)),
      )
      .subscribe((rows) => this.recentLogs.set(rows));
  }

  logPrimaryDate(log: Log): string | null {
    const raw = log.completedDate ?? log.startTime ?? log.endTime;
    if (raw === undefined || raw === null) {
      return null;
    }
    const d = typeof raw === 'string' ? new Date(raw) : raw;
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
}
