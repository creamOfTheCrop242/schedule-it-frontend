import { Component, inject } from '@angular/core';
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
import { AccountService } from '../../../account/services/account.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-task',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-task.component.html',
  styleUrl: './add-task.component.scss',
})
export class AddTaskComponent {
  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    priority: new FormControl('Medium', [Validators.required]),
    startDate: new FormControl<Date | null>(null),
    dueDate: new FormControl<Date | null>(null),
    completed: new FormControl(false),
    completedDate: new FormControl<Date | null>(null),
    dependencyTaskId: new FormControl<string | null>(null),
  });
  taskService = inject(TaskService);
  accountService = inject(AccountService);
  router = inject(Router);

  priorityOptions = ['Low', 'Medium', 'High'];

  // Mock data - replace with actual task data from your service
  availableTasks = [
    { id: '1', name: 'Complete project setup' },
    { id: '2', name: 'Design user interface' },
    { id: '3', name: 'Implement authentication' },
    { id: '4', name: 'Write unit tests' },
    { id: '5', name: 'Deploy to production' },
  ];

  onSubmit() {
    if (this.form.valid) {
      const task: AddTask = {
        name: this.form.value.name,
        description: this.form.value.description,
        priority: this.form.value.priority as 'Low' | 'Medium' | 'High',
        startDate: this.form.value.startDate || null,
        dueDate: this.form.value.dueDate,
        completed: this.form.value.completed,
      };

      this.taskService
        .addTask(task)
        .pipe(take(1))
        .subscribe({
          next: (response) => {
            this.router.navigate(['/tasks']);
            this.taskService.tasks.reload();
          },
          error: (error) => {
            console.log(error);
          },
        });
    }
  }
}
