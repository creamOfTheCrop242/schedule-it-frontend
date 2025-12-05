import { Component, computed, effect, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../services/task.service';
import { AddTask, Task } from '../../models/task.model';
import { take } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalsService } from '../../../goals/services/goals.service';

const PRIORITY_OPTIONS = ['Low', 'Medium', 'High'] as const;
type Priority = (typeof PRIORITY_OPTIONS)[number];

@Component({
  selector: 'app-add-task',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent {
  // Services
  private readonly taskService = inject(TaskService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly goalsService = inject(GoalsService);

  // Form
  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    priority: new FormControl<Priority>('Medium', [Validators.required]),
    startDate: new FormControl<Date | null>(null),
    dueDate: new FormControl<Date | null>(null),
    completed: new FormControl(false),
    completedDate: new FormControl<Date | null>(null),
    dependencyTaskId: new FormControl<string | null>(null),
  });

  // Route parameter
  readonly id = this.route.snapshot.paramMap.get('id');

  // Computed signals
  readonly currentTask = computed(() => {
    const tasks = this.taskService.incompleteTasks.value();
    if (!tasks || !this.id) return undefined;
    return tasks.find((task) => task.id === this.id);
  });

  readonly availableTasks = computed(() => {
    const tasks = this.taskService.incompleteTasks.value();
    if (!tasks) return [];
    return tasks.filter((task) => task.id !== this.id);
  });

  // Constants
  readonly priorityOptions = PRIORITY_OPTIONS;

  constructor() {
    // Populate form when editing an existing task
    effect(() => {
      const task = this.currentTask();
      if (task) {
        this.populateForm(task);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const baseTask = this.buildBaseTask();
    const operation = this.id
      ? this.taskService.updateTask({ ...baseTask, id: this.id })
      : this.taskService.addTask(baseTask);

    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error),
    });
  }

  private buildBaseTask(): AddTask {
    return {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority!,
      startDate: this.form.value.startDate || undefined,
      dueDate: this.form.value.dueDate || undefined,
      completed: this.form.value.completed ?? false,
    };
  }

  private populateForm(task: Task): void {
    this.form.patchValue({
      name: task.name,
      description: task.description || '',
      priority: task.priority,
      startDate: this.toDate(task.startDate),
      dueDate: this.toDate(task.dueDate),
      completed: task.completed,
      completedDate: this.toDate(task.completedDate),
      dependencyTaskId: task.dependencyTask?.id || null,
    });
  }

  private toDate(date: Date | string | undefined): Date | null {
    if (!date) return null;
    return date instanceof Date ? date : new Date(date);
  }

  private handleSuccess(): void {
    this.router.navigate(['/tasks']);
    this.taskService.completeTasks.reload();
    this.taskService.incompleteTasks.reload();
    this.goalsService.tasksGoalStatus.reload();
  }

  private handleError(error: unknown): void {
    console.error('Task operation failed:', error);
    // TODO: Add user-facing error notification
  }
}
