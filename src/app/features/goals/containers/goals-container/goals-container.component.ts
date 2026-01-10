import { Component, computed, inject } from '@angular/core';
import { GoalsService } from '../../services/goals.service';
import { GoalCardComponent } from '../../components/goal-card/goal-card.component';

@Component({
  selector: 'app-goals-container',
  imports: [GoalCardComponent],
  templateUrl: './goals-container.component.html',
  styleUrl: './goals-container.component.scss',
})
export class GoalsContainerComponent {
  goalsService = inject(GoalsService);

  isLoaded = computed(() => {
    return (
      this.goalsService.tasksGoalStatus.value() &&
      !this.goalsService.tasksGoalStatus.isLoading()
    );
  });
  dailyGoalStatus = this.goalsService.dailyGoalStatus;
  weeklyGoalStatus = this.goalsService.weeklyGoalStatus;
  monthlyGoalStatus = this.goalsService.monthlyGoalStatus;
  yearlyGoalStatus = this.goalsService.yearlyGoalStatus;
}
