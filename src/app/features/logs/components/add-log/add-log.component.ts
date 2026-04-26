import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
  inject,
  signal,
} from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log.service';
import { AddLog, Log, MOOD_PRESETS, MOOD_CUSTOM } from '../../models/log.model';
import { take } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalsService } from '../../../goals/services/goals.service';
import {
  CATEGORY_CUSTOM,
  CATEGORY_PRESETS,
} from '../../../shared/models/category.model';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
import { HabitsService } from '../../../habits/services/habits.service';
import { HabitRow } from '../../../habits/models/habit.model';

@Component({
  selector: 'app-add-log',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-log.component.html',
  styleUrl: './add-log.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddLogComponent {
  private readonly logService = inject(LogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly goalsService = inject(GoalsService);
  private readonly categoryOptionsService = inject(CategoryOptionsService);
  private readonly habitsService = inject(HabitsService);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    surroundings: new FormControl(''),
    moodPreset: new FormControl<string>(''),
    moodCustom: new FormControl(''),
    categoryPreset: new FormControl<string>(''),
    categoryCustom: new FormControl(''),
    habitId: new FormControl<string>(''),
    startTime: new FormControl<string | null>(null),
    endTime: new FormControl<string | null>(null),
    completedDate: new FormControl<string | null>(null),
  });

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly moodPresetOptions = ['', ...MOOD_PRESETS, MOOD_CUSTOM];

  /** Presets, Custom, then distinct labels from the server (excluding preset duplicates). */
  readonly categorySelectOptions = computed(() => {
    const presetList = [...CATEGORY_PRESETS];
    const presetSet = new Set<string>(presetList);
    const extras = new Set<string>();
    const res = this.categoryOptionsService.categoryOptions;
    if (res.status() === ResourceStatus.Resolved && res.value()) {
      for (const c of res.value() ?? []) {
        if (
          c &&
          c !== CATEGORY_CUSTOM &&
          !presetSet.has(c)
        ) {
          extras.add(c);
        }
      }
    }
    const extraSorted = [...extras].sort((a, b) => a.localeCompare(b));
    return ['', ...presetList, CATEGORY_CUSTOM, ...extraSorted];
  });

  /** Habits sorted by name for the dropdown (when GET /habits has resolved). */
  readonly habitsForSelect = computed((): HabitRow[] => {
    const res = this.habitsService.habitsOptions;
    if (res.status() !== ResourceStatus.Resolved || !res.value()) {
      return [];
    }
    return [...(res.value() ?? [])].sort((a, b) =>
      a.name.localeCompare(b.name),
    );
  });

  readonly errorMessage = signal<string | null>(null);
  readonly scheduleOpen = signal(false);

  constructor() {
    if (this.id) {
      this.logService.getLog(this.id).pipe(take(1)).subscribe({
        next: (log) => this.populateForm(log),
        error: () => {
          this.errorMessage.set('Failed to load log');
        },
      });
    }
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const baseLog = this.buildBaseLog();
    const operation = this.id
      ? this.logService.updateLog({ ...baseLog, id: this.id })
      : this.logService.addLog(baseLog);

    this.errorMessage.set(null);
    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  private buildBaseLog(): AddLog {
    const moodPreset = this.form.value.moodPreset ?? '';
    const mood =
      moodPreset === MOOD_CUSTOM
        ? (this.form.value.moodCustom ?? '').trim() || undefined
        : moodPreset || undefined;

    const catPreset = this.form.value.categoryPreset ?? '';
    const category =
      catPreset === CATEGORY_CUSTOM
        ? (this.form.value.categoryCustom ?? '').trim() || undefined
        : catPreset || undefined;

    const habitIdRaw = (this.form.value.habitId ?? '').trim();

    const base: AddLog = {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      surroundings: this.form.value.surroundings || undefined,
      mood,
      category,
      startTime: this.parseDatetimeLocalInput(this.form.value.startTime),
      endTime: this.parseDatetimeLocalInput(this.form.value.endTime),
      completedDate: this.parseDatetimeLocalInput(this.form.value.completedDate),
    };

    if (this.id) {
      return { ...base, habitId: habitIdRaw || '' };
    }
    return habitIdRaw ? { ...base, habitId: habitIdRaw } : base;
  }

  private populateForm(log: Log): void {
    const mood = log.mood || '';
    const isPreset = mood && MOOD_PRESETS.includes(mood as (typeof MOOD_PRESETS)[number]);

    const category = log.category || '';
    const isCatPreset =
      !!category &&
      CATEGORY_PRESETS.includes(category as (typeof CATEGORY_PRESETS)[number]);

    this.form.patchValue({
      name: log.name,
      description: log.description || '',
      surroundings: log.surroundings || '',
      moodPreset: isPreset ? mood : mood ? MOOD_CUSTOM : '',
      moodCustom: isPreset ? '' : mood,
      categoryPreset: isCatPreset ? category : category ? CATEGORY_CUSTOM : '',
      categoryCustom: isCatPreset ? '' : category,
      habitId: log.habit?.id ?? log.habitId ?? '',
      startTime: this.toDatetimeLocalInputValue(log.startTime),
      endTime: this.toDatetimeLocalInputValue(log.endTime),
      completedDate: this.toDatetimeLocalInputValue(log.completedDate),
    });

    if (log.startTime || log.endTime) {
      this.scheduleOpen.set(true);
    }
  }

  toggleSchedule(): void {
    this.scheduleOpen.update((open) => !open);
  }

  private toDate(date: Date | string | undefined): Date | null {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  }

  /** Value for `<input type="datetime-local">` in local wall time (no timezone suffix). */
  private toDatetimeLocalValue(d: Date): string {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  private toDatetimeLocalInputValue(
    date: Date | string | undefined | null,
  ): string | null {
    const d = this.toDate(date ?? undefined);
    return d ? this.toDatetimeLocalValue(d) : null;
  }

  private parseDatetimeLocalInput(
    value: string | null | undefined,
  ): Date | undefined {
    if (value == null || String(value).trim() === '') {
      return undefined;
    }
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? undefined : d;
  }

  private handleSuccess(): void {
    this.router.navigate(['/logs']);
    this.logService.reloadLogsList();
    this.goalsService.logsGoalStatus.reload();
    this.categoryOptionsService.categoryOptions.reload();
    this.habitsService.habitsOptions.reload();
  }

  private handleError(): void {
    this.errorMessage.set('Failed to save log. Please try again.');
  }
}
