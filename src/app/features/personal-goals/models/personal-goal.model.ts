/** API row for personal goals (not log-progress goals). */
export interface PersonalGoalRow {
  id: string;
  title: string;
  description?: string | null;
  targetDate?: string | null;
  linkedLogCount: number;
  createdAt?: string;
  updatedAt?: string;
}
