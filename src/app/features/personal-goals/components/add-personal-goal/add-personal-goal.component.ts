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
import { InputComponent } from '../../../shared/components/input/input.component';
import { PersonalGoalsService } from '../../services/personal-goals.service';

@Component({
  selector: 'app-add-personal-goal',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './add-personal-goal.component.html',
  styleUrl: './add-personal-goal.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddPersonalGoalComponent implements OnInit {
  private readonly personalGoalsService = inject(PersonalGoalsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Set when URL is `personal-goals/edit-personal-goal/:id`. */
  readonly editId = this.route.snapshot.paramMap.get('id');
  readonly isEditMode = this.editId !== null && this.editId.length > 0;

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    targetDate: new FormControl<string>(''),
  });

  readonly errorMessage = signal<string | null>(null);
  readonly loadError = signal(false);
  readonly isLoadingGoal = signal(this.isEditMode);

  ngOnInit(): void {
    const id = this.editId;
    if (!id) {
      this.isLoadingGoal.set(false);
      return;
    }
    this.personalGoalsService.getOne(id).pipe(take(1)).subscribe({
      next: (g) => {
        this.isLoadingGoal.set(false);
        const td =
          g.targetDate && String(g.targetDate).length >= 10
            ? String(g.targetDate).slice(0, 10)
            : '';
        this.form.patchValue({
          title: g.title,
          description: g.description ?? '',
          targetDate: td,
        });
      },
      error: () => {
        this.isLoadingGoal.set(false);
        this.loadError.set(true);
      },
    });
  }

  onSubmit(): void {
    if (!this.form.valid || this.isLoadingGoal()) return;

    const title = this.form.value.title?.trim() ?? '';
    if (!title) return;

    const descTrimmed = this.form.value.description?.trim() ?? '';
    const targetRaw = (this.form.value.targetDate ?? '').trim();
    this.errorMessage.set(null);

    const id = this.editId;
    if (id) {
      this.personalGoalsService
        .update(id, {
          title,
          description: descTrimmed,
          targetDate: targetRaw.length > 0 ? targetRaw : null,
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.personalGoalsService.personalGoalsOptions.reload();
            void this.router.navigate(['/personal-goals']);
          },
          error: () =>
            this.errorMessage.set(
              'Failed to update personal goal. Please try again.',
            ),
        });
      return;
    }

    this.personalGoalsService
      .create({
        title,
        ...(descTrimmed.length > 0 ? { description: descTrimmed } : {}),
        ...(targetRaw.length > 0 ? { targetDate: targetRaw } : {}),
      })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.personalGoalsService.personalGoalsOptions.reload();
          void this.router.navigate(['/personal-goals']);
        },
        error: () =>
          this.errorMessage.set(
            'Failed to create personal goal. Please try again.',
          ),
      });
  }
}
