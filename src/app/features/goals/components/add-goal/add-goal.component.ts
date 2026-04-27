import { Component, computed, effect, inject, signal } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../services/goals.service';
import {
  GoalMetric,
  GoalStatusResponse,
} from '../../models/goals.models';
import { take } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-goal',
  imports: [InputComponent, ReactiveFormsModule, CommonModule],
  templateUrl: './add-goal.component.html',
  styleUrl: './add-goal.component.scss',
})
export class AddGoalComponent {
  private readonly goalsService = inject(GoalsService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = new FormGroup({
    metric: new FormControl<GoalMetric>(GoalMetric.LOGS_ADDED, [
      Validators.required,
    ]),
    target: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly currentGoal = computed(() => {
    if (!this.id) return undefined;

    // Daily-only UX: edit the DAY definition; server derives other scopes.
    return this.goalsService
      .logsGoalStatus
      .value()
      ?.find((goal) => goal.goalId === this.id);
  });

  readonly metricOptions = Object.values(GoalMetric);
  readonly errorMessage = signal<string | null>(null);

  constructor() {
    effect(() => {
      const goal = this.currentGoal();
      if (goal) {
        this.populateForm(goal);
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid) return;

    const operation = this.goalsService.addDailyGoal(this.buildDailyPayload());

    this.errorMessage.set(null);
    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(),
      error: () => this.handleError(),
    });
  }

  private buildDailyPayload(): { metric: GoalMetric; dailyTargetValue: number } {
    const target = this.form.value.target;
    return {
      metric: this.form.value.metric!,
      dailyTargetValue: typeof target === 'number' ? target : Number(target),
    };
  }

  private populateForm(goal: GoalStatusResponse): void {
    this.form.patchValue({
      metric: goal.metric,
      target: goal.target,
    });
  }

  private handleSuccess(): void {
    this.router.navigate(['/goals']);
    this.goalsService.reloadAllGoalStatus();
  }

  private handleError(): void {
    this.errorMessage.set('Failed to save goal. Please try again.');
  }
}
