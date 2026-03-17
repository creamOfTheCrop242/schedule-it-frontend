import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../../goals/services/goals.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { GoalStatusResponse } from '../../../goals/models/goals.models';

@Component({
  selector: 'app-log-progress-card',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './log-progress-card.component.html',
  styleUrl: './log-progress-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogProgressCardComponent {
  private readonly goalsService = inject(GoalsService);
  goals = this.goalsService.logsGoalStatus;

  getProgressPercentage(goal: GoalStatusResponse): number {
    return (goal.currentValue / goal.target) * 100;
  }

  getProgressColorClass(goal: GoalStatusResponse): string {
    const percentage = this.getProgressPercentage(goal);

    if (percentage >= 100) {
      return 'progress-purple';
    } else if (percentage >= 66) {
      return 'progress-green';
    } else if (percentage >= 33) {
      return 'progress-yellow';
    } else {
      return 'progress-red';
    }
  }

  getProgressBgColor(goal: GoalStatusResponse): string {
    const percentage = this.getProgressPercentage(goal);

    if (percentage >= 100) {
      return 'bg-purple-600';
    } else if (percentage >= 66) {
      return 'bg-green-600';
    } else if (percentage >= 33) {
      return 'bg-yellow-500';
    } else {
      return 'bg-red-600';
    }
  }
}
