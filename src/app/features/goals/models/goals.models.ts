export enum GoalMetric {
  TASKS_COMPLETED = 'TASKS_COMPLETED',
}

export enum GoalScope {
  DAY = 'DAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export interface GoalStatusResponse {
  goalId: string;
  metric: GoalMetric;
  scope: GoalScope;
  periodKey: string;
  target: number;
  currentValue: number;
  targetSnapshot: number;
  completed: boolean;
}
