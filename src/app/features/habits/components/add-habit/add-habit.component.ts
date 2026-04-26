import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { InputComponent } from '../../../shared/components/input/input.component';
import { HabitsService } from '../../services/habits.service';

@Component({
  selector: 'app-add-habit',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './add-habit.component.html',
  styleUrl: './add-habit.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddHabitComponent {
  private readonly habitsService = inject(HabitsService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.form.valid) return;

    const name = this.form.value.name?.trim() ?? '';
    if (!name) return;

    const desc = this.form.value.description?.trim();
    this.errorMessage.set(null);

    this.habitsService
      .create({
        name,
        ...(desc ? { description: desc } : {}),
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
}
