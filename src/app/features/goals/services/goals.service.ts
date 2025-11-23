import { HttpClient, httpResource } from '@angular/common/http';
import { computed, inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  GoalMetric,
  GoalScope,
  GoalStatusResponse,
} from '../models/goals.models';

@Injectable({
  providedIn: 'root',
})
export class GoalsService {
  httpClient = inject(HttpClient);
  dailyGoalStatus = computed(() =>
    this.tasksGoalStatus.value()?.find((goal) => goal.scope === GoalScope.DAY)
  );

  constructor() {}

  tasksGoalStatus = httpResource<GoalStatusResponse[]>({
    url: `${environment.baseUrl}/goals/status`,
    params: {
      metric: GoalMetric.TASKS_COMPLETED,
    },
  });
}
