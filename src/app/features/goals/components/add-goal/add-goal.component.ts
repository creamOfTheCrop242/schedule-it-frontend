import { Component, computed, effect, inject } from '@angular/core';
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
  AddGoal,
  GoalMetric,
  GoalScope,
  GoalStatusResponse,
  UpdateGoal,
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
    metric: new FormControl<GoalMetric>(GoalMetric.TASKS_COMPLETED, [
      Validators.required,
    ]),
    scope: new FormControl<GoalScope>(GoalScope.DAY, [Validators.required]),
    target: new FormControl<number | null>(null, [
      Validators.required,
      Validators.min(1),
    ]),
  });

  readonly id = this.route.snapshot.paramMap.get('id');

  readonly currentGoal = computed(() => {
    if (!this.id) return undefined;

    const goals = this.goalsService.tasksGoalStatus.value();
    if (!goals) return undefined;

    return goals.find((goal) => goal.goalId === this.id);
  });

  readonly metricOptions = Object.values(GoalMetric);
  readonly scopeOptions = Object.values(GoalScope);

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

    const baseGoal = this.buildBaseGoal();
    const operation = this.goalsService.addGoal(baseGoal);

    operation.pipe(take(1)).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error),
    });
  }

  private buildBaseGoal(): AddGoal {
    return {
      metric: this.form.value.metric!,
      scope: this.form.value.scope!,
      targetValue: this.form.value.target!,
    };
  }

  private populateForm(goal: GoalStatusResponse): void {
    this.form.patchValue({
      metric: goal.metric,
      scope: goal.scope,
      target: goal.target,
    });
  }

  private handleSuccess(): void {
    this.router.navigate(['/goals']);
    this.goalsService.tasksGoalStatus.reload();
  }

  private handleError(error: unknown): void {
    console.error('Goal operation failed:', error);
  }
}
