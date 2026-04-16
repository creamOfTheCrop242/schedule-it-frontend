import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { LogService } from '../../services/log.service';
import { LogComponent } from '../../components/log/log.component';

@Component({
  selector: 'app-logs-container',
  imports: [RouterLink, LogComponent],
  templateUrl: './logs-container.component.html',
  styleUrl: './logs-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsContainerComponent {
  logService = inject(LogService);
  allLogs = this.logService.allLogs;
  isLoading = this.logService.allLogs.isLoading;
  hasLoadError = computed(
    () => this.allLogs.status() === ResourceStatus.Error,
  );

  /** Shown only once the list request has settled without error. */
  logCount = computed(() => {
    if (this.isLoading() || this.hasLoadError()) {
      return undefined;
    }
    return this.allLogs.value()?.length ?? 0;
  });

  /** Human-readable list context; hidden while loading or on error. */
  filterHeadline = computed(() => {
    if (this.isLoading() || this.hasLoadError()) {
      return null;
    }
    const raw = this.logService.selectedDate();
    if (!raw) {
      return 'Showing all logs';
    }
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      return 'Filtered by date';
    }
    const [y, m, d] = parts;
    const localDay = new Date(y, m - 1, d);
    return `Filtered to ${localDay.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })}`;
  });

  /** Shown only when a date filter is active (matches API timeZone param). */
  timezoneHint = computed(() => {
    if (this.isLoading() || this.hasLoadError()) {
      return null;
    }
    if (!this.logService.selectedDate()) {
      return null;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `Dates use your local time zone: ${tz}`;
  });

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.logService.selectedDate.set(input.value || null);
  }

  clearDate() {
    this.logService.selectedDate.set(null);
  }
}
