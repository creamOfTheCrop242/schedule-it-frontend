import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { GoalScope } from '../../../goals/models/goals.models';
import { InputComponent } from '../../../shared/components/input/input.component';
import { HabitsService } from '../../services/habits.service';

@Component({
  selector: 'app-add-habit',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './add-habit.component.html',
  styleUrl: './add-habit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddHabitComponent implements OnInit {
  private readonly habitsService = inject(HabitsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Present when route is `habits/edit-habit/:id`. */
  readonly editId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = this.editId !== null && this.editId.length > 0;

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    cadence: new FormControl<GoalScope>(GoalScope.DAY, [Validators.required]),
    targetPerPeriod: new FormControl(1, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  readonly cadenceOptions = Object.values(GoalScope);

  readonly errorMessage = signal<string | null>(null);
  readonly loadError = signal(false);
  readonly isLoadingHabit = signal(this.isEditMode);

  ngOnInit(): void {
    const id = this.editId;
    if (!id) {
      this.isLoadingHabit.set(false);
      return;
    }
    this.habitsService.getHabit(id).pipe(take(1)).subscribe({
      next: (h) => {
        this.isLoadingHabit.set(false);
        this.form.patchValue({
          name: h.name,
          description: h.description ?? '',
          cadence: h.cadence,
          targetPerPeriod: h.targetPerPeriod,
        });
      },
      error: () => {
        this.isLoadingHabit.set(false);
        this.loadError.set(true);
      },
    });
  }

  onSubmit(): void {
    if (!this.form.valid || this.isLoadingHabit()) return;

    const name = this.form.value.name?.trim() ?? '';
    if (!name) return;

    const descTrimmed = this.form.value.description?.trim() ?? '';
    const cadence = this.form.value.cadence ?? GoalScope.DAY;
    const targetPerPeriod =
      AddHabitComponent.coerceTargetPerPeriod(this.form.value.targetPerPeriod);
    this.errorMessage.set(null);

    const id = this.editId;
    if (id) {
      this.habitsService
        .updateHabit(id, {
          name,
          cadence,
          targetPerPeriod,
          description: descTrimmed,
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.habitsService.habitsOptions.reload();
            void this.router.navigate(['/habits', id]);
          },
          error: () =>
            this.errorMessage.set('Failed to update habit. Please try again.'),
        });
      return;
    }

    this.habitsService
      .create({
        name,
        cadence,
        targetPerPeriod,
        ...(descTrimmed.length > 0 ? { description: descTrimmed } : {}),
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.habitsService.habitsOptions.reload();
          void this.router.navigate(['/habits']);
        },
        error: () =>
          this.errorMessage.set('Failed to create habit. Please try again.'),
      });
  }

  /** `<input type="number">` often yields strings; coerce before PATCH/POST. */
  private static coerceTargetPerPeriod(raw: unknown): number {
    if (raw === null || raw === undefined) {
      return 1;
    }
    if (typeof raw === 'number' && Number.isFinite(raw)) {
      return Math.max(1, Math.floor(raw));
    }
    const s = String(raw).trim();
    if (s === '') return 1;
    const n = Number(s);
    return Number.isFinite(n) ? Math.max(1, Math.floor(n)) : 1;
  }
}
