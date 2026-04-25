import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { TasksService } from '../../services/tasks.service';
import { Task } from '../../models/task.model';

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
  private readonly route = inject(ActivatedRoute);

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
  });

  readonly errorMessage = signal<string | null>(null);
  /** Set when URL is `tasks/edit-task/:id`. */
  readonly editTaskId = signal<string | null>(null);

  constructor() {
    this.route.paramMap
      .pipe(takeUntilDestroyed())
      .subscribe((params) => {
        const id = params.get('id');
        this.editTaskId.set(id);
        if (id) {
          this.errorMessage.set(null);
          this.tasksService
            .getTask(id)
            .pipe(take(1))
            .subscribe({
              next: (task) => this.populateForm(task),
              error: () => this.errorMessage.set('Failed to load task'),
            });
        } else {
          this.form.reset({ title: '', description: '' });
        }
      });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const title = this.form.value.title?.trim() ?? '';
    if (!title) return;

    const description = this.form.value.description?.trim();
    this.errorMessage.set(null);

    const id = this.editTaskId();
    const operation = id
      ? this.tasksService.updateTask(id, {
          title,
          description: description ?? '',
        })
      : this.tasksService.create({
          title,
          ...(description ? { description } : {}),
        });

    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(id),
      error: () =>
        this.errorMessage.set(
          id ? 'Failed to update task. Please try again.' : 'Failed to create task. Please try again.',
        ),
    });
  }

  private populateForm(task: Task): void {
    this.form.patchValue({
      title: task.title,
      description: task.description ?? '',
    });
  }

  private handleSuccess(editId: string | null): void {
    this.tasksService.allTasks.reload();
    if (editId) {
      void this.router.navigate(['/tasks', editId]);
    } else {
      void this.router.navigate(['/tasks']);
    }
  }
}
