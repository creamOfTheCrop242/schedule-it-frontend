import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';

import { InputComponent } from '../../shared/components/input/input.component';
import { LogService } from '../../logs/services/log.service';
import { AddLog, MOOD_PRESETS } from '../../logs/models/log.model';
import { CATEGORY_PRESETS } from '../../shared/models/category.model';
import { HabitsService } from '../../habits/services/habits.service';
import { OnboardingStateService } from '../onboarding-state.service';

const TEMPLATES: ReadonlyArray<{
  label: string;
  name: string;
  description?: string;
}> = [
  {
    label: 'Evening check-in',
    name: 'Evening check-in',
    description: 'What mattered today?',
  },
  { label: 'Gratitude', name: 'Gratitude', description: 'Three grateful notes…' },
  {
    label: 'Training',
    name: 'Training',
    description: 'Session notes…',
  },
];

@Component({
  selector: 'app-welcome',
  imports: [ReactiveFormsModule, InputComponent],
  templateUrl: './welcome.component.html',
  styleUrl: './welcome.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WelcomeComponent {
  private readonly logService = inject(LogService);
  private readonly habitsService = inject(HabitsService);
  private readonly onboarding = inject(OnboardingStateService);
  private readonly router = inject(Router);

  readonly step = signal<1 | 2 | 3>(1);
  readonly moreOpen = signal(false);
  readonly submitError = signal<string | null>(null);
  readonly logSubmitting = signal(false);
  readonly habitSubmitting = signal(false);
  readonly habitCreated = signal(false);

  readonly templates = TEMPLATES;
  readonly moodOptions = MOOD_PRESETS;
  readonly categoryOptions = CATEGORY_PRESETS;

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required, Validators.maxLength(500)]),
    description: new FormControl(''),
    mood: new FormControl<string>(''),
    category: new FormControl<string>(''),
  });

  skip(): void {
    this.onboarding.markSkipped();
    void this.router.navigateByUrl('/dashboard');
  }

  continueIntro(): void {
    this.step.set(2);
  }

  toggleMore(): void {
    this.moreOpen.update((o) => !o);
  }

  applyTemplate(t: { name: string; description?: string }): void {
    this.form.patchValue({
      name: t.name,
      description: t.description ?? '',
    });
  }

  submitFirstLog(): void {
    if (this.form.controls.name.invalid || !this.form.controls.name.value?.trim()) {
      this.submitError.set('Add a title for your log.');
      return;
    }
    this.submitError.set(null);
    this.logSubmitting.set(true);

    const name = String(this.form.controls.name.value ?? '').trim();
    const description = String(this.form.controls.description.value ?? '').trim();
    const moodRaw = String(this.form.controls.mood.value ?? '').trim();
    const categoryRaw = String(this.form.controls.category.value ?? '').trim();

    const body: AddLog = {
      name,
      ...(description ? { description } : {}),
      ...(moodRaw ? { mood: moodRaw } : {}),
      ...(categoryRaw ? { category: categoryRaw } : {}),
    };

    this.logService
      .addLog(body)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.logSubmitting.set(false);
          this.onboarding.markCompleted();
          this.step.set(3);
        },
        error: () => {
          this.logSubmitting.set(false);
          this.submitError.set('Could not save your log. Check your connection and try again.');
        },
      });
  }

  optionalDailyHabit(): void {
    if (this.habitCreated() || this.habitSubmitting()) {
      return;
    }
    this.habitSubmitting.set(true);
    this.habitsService
      .create({ name: 'Daily check-in' })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.habitSubmitting.set(false);
          this.habitCreated.set(true);
          this.habitsService.habitsOptions.reload();
        },
        error: () => {
          this.habitSubmitting.set(false);
        },
      });
  }

  finishToDashboard(): void {
    void this.router.navigateByUrl('/dashboard');
  }
}
