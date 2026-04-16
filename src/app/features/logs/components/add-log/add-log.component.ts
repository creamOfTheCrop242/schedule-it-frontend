import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
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

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    surroundings: new FormControl(''),
    moodPreset: new FormControl<string>(''),
    moodCustom: new FormControl(''),
    startTime: new FormControl<Date | null>(null),
    endTime: new FormControl<Date | null>(null),
    completedDate: new FormControl<Date | null>(null),
  });

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly currentLog = computed(() => {
    if (!this.id) return undefined;
    const logs = this.logService.allLogs.value();
    if (!logs) return undefined;
    return logs.find((log) => log.id === this.id);
  });

  readonly moodPresetOptions = ['', ...MOOD_PRESETS, MOOD_CUSTOM];

  readonly errorMessage = signal<string | null>(null);
  readonly scheduleOpen = signal(false);

  constructor() {
    effect(() => {
      const log = this.currentLog();
      if (log) {
        this.populateForm(log);
      }
    });

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

    const completedDate = this.form.value.completedDate || undefined;

    return {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      surroundings: this.form.value.surroundings || undefined,
      mood,
      startTime: this.form.value.startTime || undefined,
      endTime: this.form.value.endTime || undefined,
      completedDate,
    };
  }

  private populateForm(log: Log): void {
    const mood = log.mood || '';
    const isPreset = mood && MOOD_PRESETS.includes(mood as (typeof MOOD_PRESETS)[number]);

    this.form.patchValue({
      name: log.name,
      description: log.description || '',
      surroundings: log.surroundings || '',
      moodPreset: isPreset ? mood : mood ? MOOD_CUSTOM : '',
      moodCustom: isPreset ? '' : mood,
      startTime: this.toDate(log.startTime),
      endTime: this.toDate(log.endTime),
      completedDate: this.toDate(log.completedDate),
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

  private handleSuccess(): void {
    this.router.navigate(['/logs']);
    this.logService.allLogs.reload();
    this.goalsService.logsGoalStatus.reload();
  }

  private handleError(): void {
    this.errorMessage.set('Failed to save log. Please try again.');
  }
}
