import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpResourceRef } from '@angular/common/http';
import { ResourceStatus } from '@angular/core';
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
  readonly heading = input.required<string>();
  readonly goals = input.required<HttpResourceRef<GoalStatusResponse[]>>();
  /** Shown after current/target numbers (e.g. "logs" or "completed"). */
  readonly valueLabel = input('logs');
  readonly ctaLabel = input<string | undefined>();
  readonly ctaLink = input<string | undefined>();
  readonly ctaInternal = input(true);

  protected readonly ResourceStatus = ResourceStatus;

  getProgressPercentage(goal: GoalStatusResponse): number {
    if (!goal.target || goal.target <= 0) {
      return 0;
    }
    return Math.min(100, (goal.currentValue / goal.target) * 100);
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
