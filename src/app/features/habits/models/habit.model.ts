import { GoalScope } from '../../goals/models/goals.models';

export interface HabitRow {
  id: string;
  name: string;
  description: string | null;
  cadence: GoalScope;
  targetPerPeriod: number;
  logCount?: number;
  currentStreak?: number;
  longestStreak?: number;
}
