import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  effect,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AccountService } from '../../../account/services/account.service';
import {
  LogService,
  type StoredPeriodSummaryDto,
  type StoredPeriodType,
} from '../../services/log.service';
import { logSummaryHttpErrorMessage } from '../../utils/log-summary-http-error';

function localTodayYmd(): string {
  const n = new Date();
  const y = n.getFullYear();
  const m = String(n.getMonth() + 1).padStart(2, '0');
  const day = String(n.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function isStoredPeriodType(v: string | null): v is StoredPeriodType {
  return v === 'day' || v === 'week' || v === 'month' || v === 'year';
}

@Component({
  selector: 'app-log-summaries-page',
  imports: [RouterLink, FormsModule],
  templateUrl: './log-summaries-page.component.html',
  styleUrl: './log-summaries-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogSummariesPageComponent {
  private readonly logService = inject(LogService);
  private readonly accountService = inject(AccountService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly periodSummaryTab = signal<StoredPeriodType>('day');
  readonly anchorYmd = signal<string>(localTodayYmd());
  readonly storedPeriodSummary = signal<StoredPeriodSummaryDto | null>(null);
  readonly storedPeriodSummaryLoading = signal(false);
  readonly storedPeriodSummaryError = signal<string | null>(null);
  private summaryTimeZoneSeeded = false;

  readonly periodTabOptions: { id: StoredPeriodType; label: string }[] = [
    { id: 'day', label: 'Day' },
    { id: 'week', label: 'Week' },
    { id: 'month', label: 'Month' },
    { id: 'year', label: 'Year' },
  ];

  constructor() {
    const q = this.route.snapshot.queryParamMap;
    const d = q.get('completedDate');
    if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
      this.anchorYmd.set(d);
    }
    const p = q.get('period');
    if (isStoredPeriodType(p)) {
      this.periodSummaryTab.set(p);
    }

    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        completedDate: this.anchorYmd(),
        period: this.periodSummaryTab(),
      },
      replaceUrl: true,
    });

    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      const d = q.get('completedDate');
      if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
        untracked(() => {
          if (d !== this.anchorYmd()) {
            this.anchorYmd.set(d);
          }
        });
      }
      const per = q.get('period');
      if (isStoredPeriodType(per)) {
        untracked(() => {
          if (per !== this.periodSummaryTab()) {
            this.periodSummaryTab.set(per);
          }
        });
      }
    });

    effect((onCleanup) => {
      if (this.summaryTimeZoneSeeded) {
        return;
      }
      const cur = this.accountService.currentUser;
      if (cur.status() !== ResourceStatus.Resolved) {
        return;
      }
      const user = cur.value();
      if (!user) {
        return;
      }
      if (user.summaryTimeZone) {
        this.summaryTimeZoneSeeded = true;
        return;
      }
      this.summaryTimeZoneSeeded = true;
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const sub = this.accountService.updateAccount({ summaryTimeZone: tz }).subscribe({
        next: () => {
          void this.accountService.currentUser.reload();
        },
        error: () => {
          this.summaryTimeZoneSeeded = false;
        },
      });
      onCleanup(() => sub.unsubscribe());
    });

    effect((onCleanup) => {
      const tab = this.periodSummaryTab();
      const anchor = this.anchorYmd();
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      this.storedPeriodSummaryLoading.set(true);
      this.storedPeriodSummaryError.set(null);
      const sub = this.logService.getStoredPeriodSummary(tab, anchor, tz).subscribe({
        next: (row) => {
          this.storedPeriodSummary.set(row);
          this.storedPeriodSummaryLoading.set(false);
        },
        error: (err: unknown) => {
          this.storedPeriodSummaryLoading.set(false);
          this.storedPeriodSummary.set(null);
          this.storedPeriodSummaryError.set(logSummaryHttpErrorMessage(err));
        },
      });
      onCleanup(() => sub.unsubscribe());
    });
  }

  setPeriodSummaryTab(tab: StoredPeriodType): void {
    this.periodSummaryTab.set(tab);
    this.syncSummariesQueryToUrl();
  }

  onAnchorYmdChange(value: string): void {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      this.anchorYmd.set(value);
      this.syncSummariesQueryToUrl();
    }
  }

  syncSummariesQueryToUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        completedDate: this.anchorYmd(),
        period: this.periodSummaryTab(),
      },
      replaceUrl: true,
    });
  }
}
