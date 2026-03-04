import { Component, computed, effect, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LogService } from '../../services/log.service';
import { AddLog, Log, LogPriority } from '../../models/log.model';
import { take } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';
import { GoalsService } from '../../../goals/services/goals.service';

@Component({
  selector: 'app-add-log',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-log.component.html',
  styleUrl: './add-log.component.scss',
})
export class AddLogComponent {
  private readonly logService = inject(LogService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly goalsService = inject(GoalsService);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    description: new FormControl(''),
    priority: new FormControl<LogPriority>(LogPriority.LOW, [
      Validators.required,
    ]),
    startDate: new FormControl<Date | null>(null),
    dueDate: new FormControl<Date | null>(null),
    completed: new FormControl(false),
    completedDate: new FormControl<Date | null>(null),
    dependencyLogId: new FormControl<string | null>(null),
  });

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly currentLog = computed(() => {
    if (!this.id) return undefined;
    const logs = this.logService.allLogs.value();
    if (!logs) return undefined;
    return logs.find((log) => log.id === this.id);
  });

  readonly availableLogs = computed(() => {
    const logs = this.logService.allLogs.value();
    if (!logs) return [];
    return logs.filter((log) => log.id !== this.id);
  });

  readonly priorityOptions = Object.values(LogPriority);

  constructor() {
    effect(() => {
      const log = this.currentLog();
      if (log) {
        this.populateForm(log);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const baseLog = this.buildBaseLog();
    const operation = this.id
      ? this.logService.updateLog({ ...baseLog, id: this.id })
      : this.logService.addLog(baseLog);

    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error),
    });
  }

  private buildBaseLog(): AddLog {
    return {
      name: this.form.value.name!,
      description: this.form.value.description || undefined,
      priority: this.form.value.priority!,
      startDate: this.form.value.startDate || undefined,
      dueDate: this.form.value.dueDate || undefined,
      completed: this.form.value.completed ?? false,
    };
  }

  private populateForm(log: Log): void {
    this.form.patchValue({
      name: log.name,
      description: log.description || '',
      priority: log.priority,
      startDate: this.toDate(log.startDate),
      dueDate: this.toDate(log.dueDate),
      completed: log.completed,
      completedDate: this.toDate(log.completedDate),
      dependencyLogId: log.dependencyLog?.id || null,
    });
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

  private handleError(error: unknown): void {
    console.error('Log operation failed:', error);
  }
}
