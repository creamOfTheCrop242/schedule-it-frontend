import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  AddGoal,
  GoalMetric,
  GoalScope,
  GoalStatusResponse,
} from '../models/goals.models';

export interface AddDailyGoalPayload {
  metric: GoalMetric;
  dailyTargetValue: number;
  filters?: Record<string, any>;
}

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  httpClient = inject(HttpClient);
  dailyGoalStatus = computed(() =>
    this.logsGoalStatus.value()?.find((goal) => goal.scope === GoalScope.DAY)
  );

  weeklyGoalStatus = computed(() =>
    this.logsGoalStatus.value()?.find((goal) => goal.scope === GoalScope.WEEK)
  );

  monthlyGoalStatus = computed(() =>
    this.logsGoalStatus.value()?.find((goal) => goal.scope === GoalScope.MONTH)
  );

  yearlyGoalStatus = computed(() =>
    this.logsGoalStatus.value()?.find((goal) => goal.scope === GoalScope.YEAR)
  );

  constructor() {}

  logsGoalStatus = httpResource<GoalStatusResponse[]>({
    url: `${environment.baseUrl}/goals/status`,
    params: {
      metric: GoalMetric.LOGS_ADDED,
    },
  });

  logsCompletedGoalStatus = httpResource<GoalStatusResponse[]>({
    url: `${environment.baseUrl}/goals/status`,
    params: {
      metric: GoalMetric.LOGS_COMPLETED,
    },
  });

  /** Call after mutations that affect goal progress (logs, tasks, goal definitions). */
  reloadAllGoalStatus(): void {
    this.logsGoalStatus.reload();
    this.logsCompletedGoalStatus.reload();
  }

  addGoal(goal: AddGoal) {
    return this.httpClient.post<GoalStatusResponse>(
      `${environment.baseUrl}/goals`,
      goal
    );
  }

  addDailyGoal(payload: AddDailyGoalPayload) {
    return this.httpClient.post<{ success: true }>(
      `${environment.baseUrl}/goals/daily`,
      payload,
    );
  }
}
