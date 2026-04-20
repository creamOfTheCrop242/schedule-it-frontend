import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MOOD_PRESETS } from '../../models/log.model';
import { LogService } from '../../services/log.service';
import { LogComponent } from '../../components/log/log.component';

@Component({
  selector: 'app-logs-container',
  imports: [RouterLink, LogComponent, FormsModule],
  templateUrl: './logs-container.component.html',
  styleUrl: './logs-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsContainerComponent {
  logService = inject(LogService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private searchUrlDebounce?: ReturnType<typeof setTimeout>;
  /**
   * Apply query params before `allLogs` runs its first GET; the constructor subscription runs too late.
   */
  private readonly _hydrateListFiltersFromUrl = (() => {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    const log = inject(LogService);
    const d = q.get('completedDate');
    log.selectedDate.set(d && d.length > 0 ? d : null);
    const m = q.get('mood');
    log.filterMood.set(m && m.length > 0 ? m : null);
    log.searchQuery.set(q.get('search') ?? '');
    return undefined;
  })();
  /** When false, filter controls (date, mood, search) are collapsed. */
  filtersExpanded = signal(false);

  allLogs = this.logService.allLogs;
  isLoading = this.logService.allLogs.isLoading;
  hasLoadError = computed(
    () => this.allLogs.status() === ResourceStatus.Error,
  );

  /** Preset moods plus distinct moods from the server for the current date/search slice. */
  moodMenuOptions = computed(() => {
    const presetList = [...MOOD_PRESETS];
    const presetSet = new Set<string>(presetList);
    const extras = new Set<string>();
    const moodRes = this.logService.moodOptions;
    if (moodRes.status() === ResourceStatus.Resolved && moodRes.value()) {
      for (const m of moodRes.value() ?? []) {
        if (m && !presetSet.has(m)) {
          extras.add(m);
        }
      }
    }
    const extraSorted = [...extras].sort((a, b) => a.localeCompare(b));
    return [...presetList, ...extraSorted];
  });

  hasClientFiltersActive = computed(
    () =>
      this.logService.filterMood() !== null ||
      this.logService.searchQuery().trim().length > 0,
  );

  /** Date or mood/search filters that affect the list request. */
  hasAnyListFilter = computed(
    () =>
      this.logService.selectedDate() !== null || this.hasClientFiltersActive(),
  );

  /** Header badge: count returned from the server for the active filters. */
  headerBadgeText = computed(() => {
    if (this.isLoading() || this.hasLoadError()) {
      return undefined;
    }
    return String(this.allLogs.value()?.length ?? 0);
  });

  /** One-line summary for the combined filters toggle (date · mood · search). */
  filtersPanelSummary = computed(() => {
    const mood = this.logService.filterMood();
    const q = this.logService.searchQuery().trim();
    const moodPart = mood ?? 'All moods';
    const searchPart =
      q.length === 0
        ? 'No search'
        : q.length > 20
          ? `${q.slice(0, 20)}…`
          : q;
    const searchSegment = q.length === 0 ? 'No search' : `"${searchPart}"`;
    return `${this.dateFilterSummary()} · ${moodPart} · ${searchSegment}`;
  });

  /** Extra context when mood or search filters are active; shown under date headline. */
  clientFilterLine = computed(() => {
    if (this.isLoading() || this.hasLoadError()) {
      return null;
    }
    if (!this.hasClientFiltersActive()) {
      return null;
    }
    const parts: string[] = [];
    const mood = this.logService.filterMood();
    if (mood) {
      parts.push(`Mood: ${mood}`);
    }
    const q = this.logService.searchQuery().trim();
    if (q) {
      parts.push(`Search matches title or surroundings`);
    }
    return parts.join(' · ');
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

  /** Date segment of the filters summary (also used in the combined line). */
  dateFilterSummary = computed(() => {
    const raw = this.logService.selectedDate();
    if (!raw) {
      return 'All dates';
    }
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      return 'Date selected';
    }
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
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
    this.syncListQueryToUrl();
  }

  clearDate() {
    this.logService.selectedDate.set(null);
    this.syncListQueryToUrl();
  }

  toggleFilters() {
    this.filtersExpanded.update((v) => !v);
  }

  constructor() {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed())
      .subscribe((q) => {
        const d = q.get('completedDate');
        this.logService.selectedDate.set(d && d.length > 0 ? d : null);
        const m = q.get('mood');
        this.logService.filterMood.set(m && m.length > 0 ? m : null);
        this.logService.searchQuery.set(q.get('search') ?? '');
      });
  }

  /** Keeps the address bar aligned with what GET /logs sends (httpResource uses signals, not the URL). */
  private syncListQueryToUrl(): void {
    const date = this.logService.selectedDate();
    const mood = this.logService.filterMood();
    const search = this.logService.searchQuery().trim();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        completedDate: date ?? undefined,
        timeZone: date ? tz : undefined,
        mood: mood ?? undefined,
        search: search || undefined,
      },
    });
  }

  onMoodModelChange(value: string) {
    this.logService.filterMood.set(value || null);
    this.syncListQueryToUrl();
  }

  onSearchInput(event: Event) {
    this.logService.searchQuery.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchUrlDebounce);
    this.searchUrlDebounce = setTimeout(() => this.syncListQueryToUrl(), 300);
  }

  clearClientFilters() {
    this.logService.clearMoodAndSearch();
    this.syncListQueryToUrl();
  }
}
