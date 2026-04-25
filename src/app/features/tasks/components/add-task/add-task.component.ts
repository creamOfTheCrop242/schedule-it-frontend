import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-add-task',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddTaskComponent {
  private readonly tasksService = inject(TasksService);
  private readonly router = inject(Router);

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  readonly errorMessage = signal<string | null>(null);

  onSubmit(): void {
    if (!this.form.valid) return;

    const title = this.form.value.title?.trim() ?? '';
    if (!title) return;

    const description = this.form.value.description?.trim();
    this.errorMessage.set(null);

    this.tasksService
      .create({
        title,
        ...(description ? { description } : {}),
      })
      .pipe(take(1))
      .subscribe({
        next: () => void this.router.navigate(['/dashboard']),
        error: () =>
          this.errorMessage.set('Failed to create task. Please try again.'),
      });
  }
}
