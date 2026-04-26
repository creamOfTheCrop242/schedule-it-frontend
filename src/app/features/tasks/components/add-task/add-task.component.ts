import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  computed,
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
import {
  CATEGORY_CUSTOM,
  CATEGORY_PRESETS,
} from '../../../shared/models/category.model';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
import { HabitsService } from '../../../habits/services/habits.service';
import { HabitRow } from '../../../habits/models/habit.model';

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
  private readonly categoryOptionsService = inject(CategoryOptionsService);
  private readonly habitsService = inject(HabitsService);

  readonly form = new FormGroup({
    title: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    categoryPreset: new FormControl<string>(''),
    categoryCustom: new FormControl(''),
    habitId: new FormControl<string>(''),
  });

  readonly categorySelectOptions = computed(() => {
    const presetList = [...CATEGORY_PRESETS];
    const presetSet = new Set<string>(presetList);
    const extras = new Set<string>();
    const res = this.categoryOptionsService.categoryOptions;
    if (res.status() === ResourceStatus.Resolved && res.value()) {
      for (const c of res.value() ?? []) {
        if (c && c !== CATEGORY_CUSTOM && !presetSet.has(c)) {
          extras.add(c);
        }
      }
    }
    const extraSorted = [...extras].sort((a, b) => a.localeCompare(b));
    return ['', ...presetList, CATEGORY_CUSTOM, ...extraSorted];
  });

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
          this.form.reset({
            title: '',
            description: '',
            categoryPreset: '',
            categoryCustom: '',
            habitId: '',
          });
        }
      });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const title = this.form.value.title?.trim() ?? '';
    if (!title) return;

    const description = this.form.value.description?.trim();
    const catPreset = this.form.value.categoryPreset ?? '';
    const rawCategory =
      catPreset === CATEGORY_CUSTOM
        ? (this.form.value.categoryCustom ?? '').trim()
        : catPreset.trim();

    const habitIdRaw = (this.form.value.habitId ?? '').trim();

    this.errorMessage.set(null);

    const id = this.editTaskId();
    const operation = id
      ? this.tasksService.updateTask(id, {
          title,
          description: description ?? '',
          category: rawCategory.length > 0 ? rawCategory : '',
          habitId: habitIdRaw || '',
        })
      : this.tasksService.create({
          title,
          ...(description ? { description } : {}),
          ...(rawCategory.length > 0 ? { category: rawCategory } : {}),
          ...(habitIdRaw ? { habitId: habitIdRaw } : {}),
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
    const category = task.category || '';
    const isCatPreset =
      !!category &&
      CATEGORY_PRESETS.includes(category as (typeof CATEGORY_PRESETS)[number]);

    this.form.patchValue({
      title: task.title,
      description: task.description ?? '',
      categoryPreset: isCatPreset ? category : category ? CATEGORY_CUSTOM : '',
      categoryCustom: isCatPreset ? '' : category,
      habitId: task.habit?.id ?? task.habitId ?? '',
    });
  }

  private handleSuccess(editId: string | null): void {
    this.tasksService.reloadTasksList();
    this.categoryOptionsService.categoryOptions.reload();
    this.habitsService.habitsOptions.reload();
    if (editId) {
      void this.router.navigate(['/tasks', editId]);
    } else {
      void this.router.navigate(['/tasks']);
    }
  }
}
