import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ResourceStatus,
  computed,
  effect,
  inject,
  signal,
  untracked,
  OnDestroy,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CATEGORY_PRESETS } from '../../../shared/models/category.model';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
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
export class LogsContainerComponent implements OnDestroy {
  logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly categoryOptionsService = inject(CategoryOptionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private searchUrlDebounce?: ReturnType<typeof setTimeout>;
  private scrollObserver: IntersectionObserver | null = null;

  /**
   * Apply query params before the first list fetch; the constructor subscription runs too late.
   */
  private readonly _hydrateListFiltersFromUrl = (() => {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    const log = inject(LogService);
    const d = q.get('completedDate');
    log.selectedDate.set(d && d.length > 0 ? d : null);
    const m = q.get('mood');
    log.filterMood.set(m && m.length > 0 ? m : null);
    const cat = q.get('category');
    log.filterCategory.set(cat && cat.length > 0 ? cat : null);
    log.searchQuery.set(q.get('search') ?? '');
    return undefined;
  })();

  /** When false, filter controls (date, mood, search) are collapsed. */
  filtersExpanded = signal(false);

  readonly aiSummary = signal<string | null>(null);
  readonly aiSummaryLoading = signal(false);
  readonly aiSummaryError = signal<string | null>(null);
  /** After a successful summary only; cleared on any request error so retries are allowed. */
  readonly aiSummaryCooldownActive = signal(false);
  private aiSummaryCooldownTimeoutId: ReturnType<typeof setTimeout> | null = null;

  private static readonly AI_SUMMARY_COOLDOWN_MS = 5 * 60 * 1000;

  /** True during first full load (no rows yet). */
  readonly initialListLoading = computed(
    () => this.logService.logsListLoading() && this.logService.logsList().length === 0,
  );

  readonly hasLoadError = computed(() => this.logService.logsListError());

  readonly aiSummaryDisabled = computed(
    () =>
      this.aiSummaryLoading() ||
      this.aiSummaryCooldownActive() ||
      this.logService.logsList().length === 0 ||
      this.initialListLoading() ||
      this.hasLoadError(),
  );

  /** True while replacing list after filter change but rows still visible. */
  readonly listRefreshingWithContent = computed(
    () =>
      this.logService.logsListLoading() && this.logService.logsList().length > 0,
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

  /** Preset categories plus distinct labels from logs/tasks for this account. */
  categoryMenuOptions = computed(() => {
    const presetList = [...CATEGORY_PRESETS];
    const presetSet = new Set<string>(presetList);
    const extras = new Set<string>();
    const res = this.categoryOptionsService.categoryOptions;
    if (res.status() === ResourceStatus.Resolved && res.value()) {
      for (const c of res.value() ?? []) {
        if (c && !presetSet.has(c)) {
          extras.add(c);
        }
      }
    }
    const extraSorted = [...extras].sort((a, b) => a.localeCompare(b));
    return [...presetList, ...extraSorted];
  });

  hasClientFiltersActive = computed(
    () =>
      this.logService.filterMood() !== null ||
      this.logService.filterCategory() !== null ||
      this.logService.searchQuery().trim().length > 0,
  );

  /** Date or mood/search filters that affect the list request. */
  hasAnyListFilter = computed(
    () =>
      this.logService.selectedDate() !== null || this.hasClientFiltersActive(),
  );

  /** Header badge: number of logs loaded so far. */
  headerBadgeText = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return undefined;
    }
    const n = this.logService.logsList().length;
    const more = this.logService.logsHasMore();
    return more && n > 0 ? `${n}+` : String(n);
  });

  /** One-line summary for the combined filters toggle (date · mood · category · search). */
  filtersPanelSummary = computed(() => {
    const mood = this.logService.filterMood();
    const category = this.logService.filterCategory();
    const q = this.logService.searchQuery().trim();
    const moodPart = mood ?? 'All moods';
    const categoryPart = category ?? 'All categories';
    const searchPart =
      q.length === 0
        ? 'No search'
        : q.length > 20
          ? `${q.slice(0, 20)}…`
          : q;
    const searchSegment = q.length === 0 ? 'No search' : `"${searchPart}"`;
    return `${this.dateFilterSummary()} · ${moodPart} · ${categoryPart} · ${searchSegment}`;
  });

  /** Extra context when mood or search filters are active; shown under date headline. */
  clientFilterLine = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
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
    const category = this.logService.filterCategory();
    if (category) {
      parts.push(`Category: ${category}`);
    }
    const q = this.logService.searchQuery().trim();
    if (q) {
      parts.push(`Search matches title or surroundings`);
    }
    return parts.join(' · ');
  });

  /** Human-readable list context; hidden while loading or on error. */
  filterHeadline = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return null;
    }
    const n = this.logService.logsList().length;
    const logWord = n === 1 ? 'log' : 'logs';
    const raw = this.logService.selectedDate();
    if (!raw) {
      return `Showing ${n} ${logWord} (all dates)`;
    }
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
      return `Showing ${n} ${logWord} (date filter active)`;
    }
    const [y, m, d] = parts;
    const localDay = new Date(y, m - 1, d);
    const dateLabel = localDay.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `Showing ${n} ${logWord} for ${dateLabel}`;
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
    if (this.initialListLoading() || this.hasLoadError()) {
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
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      const d = q.get('completedDate');
      this.logService.selectedDate.set(d && d.length > 0 ? d : null);
      const m = q.get('mood');
      this.logService.filterMood.set(m && m.length > 0 ? m : null);
      const cat = q.get('category');
      this.logService.filterCategory.set(cat && cat.length > 0 ? cat : null);
      this.logService.searchQuery.set(q.get('search') ?? '');
      this.logService.reloadLogsList();
    });

    effect(() => {
      this.logService.logsList();
      this.logService.logsHasMore();
      this.logService.logsListLoading();
      this.logService.logsListLoadingMore();
      untracked(() => queueMicrotask(() => this.setupScrollObserver()));
    });
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
    this.scrollObserver = null;
    this.clearAiSummaryCooldown();
  }

  private setupScrollObserver(): void {
    this.scrollObserver?.disconnect();
    this.scrollObserver = null;

    if (
      !this.logService.logsHasMore() ||
      this.logService.logsListLoading() ||
      this.logService.logsListLoadingMore()
    ) {
      return;
    }

    const el = document.getElementById('logs-scroll-sentinel');
    if (!el) {
      return;
    }

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            this.logService.logsHasMore() &&
            !this.logService.logsListLoading() &&
            !this.logService.logsListLoadingMore()
          ) {
            this.logService.loadLogsPage(false);
          }
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    this.scrollObserver.observe(el);
  }

  /** Keeps the address bar aligned with what GET /logs sends. */
  private syncListQueryToUrl(): void {
    const date = this.logService.selectedDate();
    const mood = this.logService.filterMood();
    const category = this.logService.filterCategory();
    const search = this.logService.searchQuery().trim();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        completedDate: date ?? undefined,
        timeZone: date ? tz : undefined,
        mood: mood ?? undefined,
        category: category ?? undefined,
        search: search || undefined,
      },
    });
  }

  onMoodModelChange(value: string) {
    this.logService.filterMood.set(value || null);
    this.syncListQueryToUrl();
  }

  onCategoryModelChange(value: string) {
    this.logService.filterCategory.set(value || null);
    this.syncListQueryToUrl();
  }

  onSearchInput(event: Event) {
    this.logService.searchQuery.set((event.target as HTMLInputElement).value);
    clearTimeout(this.searchUrlDebounce);
    this.searchUrlDebounce = setTimeout(() => {
      this.syncListQueryToUrl();
      this.logService.reloadLogsList();
    }, 300);
  }

  clearClientFilters() {
    this.logService.clearMoodCategoryAndSearch();
    this.syncListQueryToUrl();
  }

  fetchAiSummary(): void {
    if (this.aiSummaryDisabled()) {
      return;
    }
    this.aiSummaryError.set(null);
    this.aiSummaryLoading.set(true);
    this.logService
      .getAiSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ summary }) => {
          this.aiSummary.set(summary);
          this.aiSummaryLoading.set(false);
          this.startAiSummaryCooldown();
        },
        error: (err: unknown) => {
          this.aiSummaryLoading.set(false);
          this.clearAiSummaryCooldown();
          const msg = LogsContainerComponent.httpErrorMessage(err);
          this.aiSummaryError.set(msg);
        },
      });
  }

  /** Drop client cooldown so a failed run does not burn the 5-minute window. */
  private clearAiSummaryCooldown(): void {
    if (this.aiSummaryCooldownTimeoutId !== null) {
      clearTimeout(this.aiSummaryCooldownTimeoutId);
      this.aiSummaryCooldownTimeoutId = null;
    }
    this.aiSummaryCooldownActive.set(false);
  }

  private startAiSummaryCooldown(): void {
    this.aiSummaryCooldownActive.set(true);
    if (this.aiSummaryCooldownTimeoutId !== null) {
      clearTimeout(this.aiSummaryCooldownTimeoutId);
    }
    this.aiSummaryCooldownTimeoutId = setTimeout(() => {
      this.aiSummaryCooldownActive.set(false);
      this.aiSummaryCooldownTimeoutId = null;
    }, LogsContainerComponent.AI_SUMMARY_COOLDOWN_MS);
  }

  private static httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | undefined;
      if (body?.message !== undefined) {
        return Array.isArray(body.message)
          ? body.message.join('; ')
          : body.message;
      }
      if (err.status === 504 || err.status === 503) {
        return 'The server took too long to finish the summary. Try narrowing filters or retry in a moment.';
      }
      if (err.status === 0) {
        return 'The request did not complete (network or timeout). Check your connection and try again.';
      }
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong.';
  }
}
