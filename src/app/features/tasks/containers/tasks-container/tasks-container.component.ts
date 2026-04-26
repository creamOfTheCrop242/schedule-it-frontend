import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  effect,
  inject,
  signal,
  untracked,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CATEGORY_PRESETS } from '../../../shared/models/category.model';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-tasks-container',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './tasks-container.component.html',
  styleUrl: './tasks-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksContainerComponent implements OnDestroy {
  readonly tasksService = inject(TasksService);
  private readonly categoryOptionsService = inject(CategoryOptionsService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private searchUrlDebounce?: ReturnType<typeof setTimeout>;
  private scrollObserver: IntersectionObserver | null = null;

  private readonly _hydrateListFiltersFromUrl = (() => {
    const q = inject(ActivatedRoute).snapshot.queryParamMap;
    const tasks = inject(TasksService);
    const d = q.get('completedDate');
    tasks.selectedDate.set(d && d.length > 0 ? d : null);
    const c = q.get('completion');
    tasks.filterCompletion.set(c === 'open' || c === 'done' ? c : null);
    const cat = q.get('category');
    tasks.filterCategory.set(cat && cat.length > 0 ? cat : null);
    tasks.searchQuery.set(q.get('search') ?? '');
    return undefined;
  })();

  filtersExpanded = signal(false);

  readonly initialListLoading = computed(
    () =>
      this.tasksService.tasksListLoading() &&
      this.tasksService.tasksList().length === 0,
  );

  readonly hasLoadError = computed(() => this.tasksService.tasksListError());

  readonly listRefreshingWithContent = computed(
    () =>
      this.tasksService.tasksListLoading() &&
      this.tasksService.tasksList().length > 0,
  );

  readonly categoryMenuOptions = computed(() => {
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

  readonly hasClientFiltersActive = computed(
    () =>
      this.tasksService.filterCompletion() !== null ||
      this.tasksService.filterCategory() !== null ||
      this.tasksService.searchQuery().trim().length > 0,
  );

  readonly hasAnyListFilter = computed(
    () =>
      this.tasksService.selectedDate() !== null ||
      this.hasClientFiltersActive(),
  );

  readonly headerBadgeText = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return undefined;
    }
    const n = this.tasksService.tasksList().length;
    const more = this.tasksService.tasksHasMore();
    return more && n > 0 ? `${n}+` : String(n);
  });

  readonly filtersPanelSummary = computed(() => {
    const c = this.tasksService.filterCompletion();
    const completionPart =
      c === 'open' ? 'Open' : c === 'done' ? 'Done' : 'All statuses';
    const cat = this.tasksService.filterCategory();
    const categoryPart = cat
      ? cat.length > 24
        ? `${cat.slice(0, 24)}…`
        : cat
      : 'All categories';
    const q = this.tasksService.searchQuery().trim();
    const searchPart =
      q.length === 0
        ? 'No search'
        : q.length > 20
          ? `${q.slice(0, 20)}…`
          : q;
    const searchSegment = q.length === 0 ? 'No search' : `"${searchPart}"`;
    return `${this.dateFilterSummary()} · ${completionPart} · ${categoryPart} · ${searchSegment}`;
  });

  readonly clientFilterLine = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return null;
    }
    if (!this.hasClientFiltersActive()) {
      return null;
    }
    const parts: string[] = [];
    const c = this.tasksService.filterCompletion();
    if (c === 'open') {
      parts.push('Status: Open');
    } else if (c === 'done') {
      parts.push('Status: Done');
    }
    const cat = this.tasksService.filterCategory();
    if (cat) {
      parts.push(`Category: ${cat}`);
    }
    const q = this.tasksService.searchQuery().trim();
    if (q) {
      parts.push('Search matches title or description');
    }
    return parts.join(' · ');
  });

  readonly filterHeadline = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return null;
    }
    const n = this.tasksService.tasksList().length;
    const taskWord = n === 1 ? 'task' : 'tasks';
    const raw = this.tasksService.selectedDate();
    if (!raw) {
      return `Showing ${n} ${taskWord} (all dates)`;
    }
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
      return `Showing ${n} ${taskWord} (date filter active)`;
    }
    const [y, m, d] = parts;
    const localDay = new Date(y, m - 1, d);
    const dateLabel = localDay.toLocaleDateString(undefined, {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    return `Showing ${n} ${taskWord} for ${dateLabel}`;
  });

  readonly dateFilterSummary = computed(() => {
    const raw = this.tasksService.selectedDate();
    if (!raw) {
      return 'All dates';
    }
    const parts = raw.split('-').map(Number);
    if (parts.length !== 3 || parts.some((p) => Number.isNaN(p))) {
      return 'Date selected';
    }
    const [y, m, d] = parts;
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      dateStyle: 'medium',
    });
  });

  readonly timezoneHint = computed(() => {
    if (this.initialListLoading() || this.hasLoadError()) {
      return null;
    }
    if (!this.tasksService.selectedDate()) {
      return null;
    }
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return `Dates use your local time zone: ${tz}`;
  });

  constructor() {
    this.route.queryParamMap.pipe(takeUntilDestroyed()).subscribe((q) => {
      const d = q.get('completedDate');
      this.tasksService.selectedDate.set(d && d.length > 0 ? d : null);
      const c = q.get('completion');
      this.tasksService.filterCompletion.set(
        c === 'open' || c === 'done' ? c : null,
      );
      const cat = q.get('category');
      this.tasksService.filterCategory.set(cat && cat.length > 0 ? cat : null);
      this.tasksService.searchQuery.set(q.get('search') ?? '');
      this.tasksService.reloadTasksList();
    });

    effect(() => {
      this.tasksService.tasksList();
      this.tasksService.tasksHasMore();
      this.tasksService.tasksListLoading();
      this.tasksService.tasksListLoadingMore();
      untracked(() => queueMicrotask(() => this.setupScrollObserver()));
    });
  }

  ngOnDestroy(): void {
    this.scrollObserver?.disconnect();
    this.scrollObserver = null;
  }

  private setupScrollObserver(): void {
    this.scrollObserver?.disconnect();
    this.scrollObserver = null;

    if (
      !this.tasksService.tasksHasMore() ||
      this.tasksService.tasksListLoading() ||
      this.tasksService.tasksListLoadingMore()
    ) {
      return;
    }

    const el = document.getElementById('tasks-scroll-sentinel');
    if (!el) {
      return;
    }

    this.scrollObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (
            entry.isIntersecting &&
            this.tasksService.tasksHasMore() &&
            !this.tasksService.tasksListLoading() &&
            !this.tasksService.tasksListLoadingMore()
          ) {
            this.tasksService.loadTasksPage(false);
          }
        }
      },
      { root: null, rootMargin: '120px', threshold: 0 },
    );
    this.scrollObserver.observe(el);
  }

  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.tasksService.selectedDate.set(input.value || null);
    this.syncListQueryToUrl();
  }

  clearDate(): void {
    this.tasksService.selectedDate.set(null);
    this.syncListQueryToUrl();
  }

  toggleFilters(): void {
    this.filtersExpanded.update((v) => !v);
  }

  private syncListQueryToUrl(): void {
    const date = this.tasksService.selectedDate();
    const completion = this.tasksService.filterCompletion();
    const category = this.tasksService.filterCategory();
    const search = this.tasksService.searchQuery().trim();
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    void this.router.navigate([], {
      relativeTo: this.route,
      replaceUrl: true,
      queryParams: {
        completedDate: date ?? undefined,
        timeZone: date ? tz : undefined,
        completion: completion ?? undefined,
        category: category ?? undefined,
        search: search || undefined,
      },
    });
  }

  onCompletionModelChange(value: string): void {
    if (value === 'open' || value === 'done') {
      this.tasksService.filterCompletion.set(value);
    } else {
      this.tasksService.filterCompletion.set(null);
    }
    this.syncListQueryToUrl();
  }

  onCategoryModelChange(value: string): void {
    this.tasksService.filterCategory.set(value || null);
    this.syncListQueryToUrl();
  }

  onSearchInput(event: Event): void {
    this.tasksService.searchQuery.set(
      (event.target as HTMLInputElement).value,
    );
    clearTimeout(this.searchUrlDebounce);
    this.searchUrlDebounce = setTimeout(() => {
      this.syncListQueryToUrl();
      this.tasksService.reloadTasksList();
    }, 300);
  }

  clearClientFilters(): void {
    this.tasksService.clearCompletionSearchAndCategory();
    this.syncListQueryToUrl();
  }
}
