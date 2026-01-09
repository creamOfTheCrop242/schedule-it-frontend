import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../../../goals/services/goals.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';

@Component({
  selector: 'app-task-progress-card',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './task-progress-card.component.html',
  styleUrl: './task-progress-card.component.scss',
})
export class TaskProgressCardComponent {
  private readonly goalsService = inject(GoalsService);

  readonly dailyGoalStatus = this.goalsService.dailyGoalStatus;

  readonly progressPercentage = computed(() => {
    const goal = this.dailyGoalStatus();
    if (!goal || goal.target === 0) return 0;
    return Math.min((goal.currentValue / goal.target) * 100, 100);
  });
}
