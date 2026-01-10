import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  AddGoal,
  GoalMetric,
  GoalScope,
  GoalStatusResponse,
  UpdateGoal,
} from '../models/goals.models';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  httpClient = inject(HttpClient);
  dailyGoalStatus = computed(() =>
    this.tasksGoalStatus.value()?.find((goal) => goal.scope === GoalScope.DAY)
  );

  weeklyGoalStatus = computed(() =>
    this.tasksGoalStatus.value()?.find((goal) => goal.scope === GoalScope.WEEK)
  );

  monthlyGoalStatus = computed(() =>
    this.tasksGoalStatus.value()?.find((goal) => goal.scope === GoalScope.MONTH)
  );

  yearlyGoalStatus = computed(() =>
    this.tasksGoalStatus.value()?.find((goal) => goal.scope === GoalScope.YEAR)
  );

  constructor() {}

  tasksGoalStatus = httpResource<GoalStatusResponse[]>({
    url: `${environment.baseUrl}/goals/status`,
    params: {
      metric: GoalMetric.TASKS_COMPLETED,
    },
  });

  addGoal(goal: AddGoal) {
    return this.httpClient.post<GoalStatusResponse>(
      `${environment.baseUrl}/goals`,
      goal
    );
  }
}
