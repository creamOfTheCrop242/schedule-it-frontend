import { Component, computed, input, OnInit } from '@angular/core';
import { GoalStatusResponse } from '../../models/goals.models';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-goal-card',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './goal-card.component.html',
  styleUrl: './goal-card.component.scss',
})
export class GoalCardComponent implements OnInit {
  goal = input<GoalStatusResponse>();
  title = input<string>();

  ngOnInit(): void {
    console.log(this.goal());
  }

  readonly progressPercentage = computed(() => {
    const goal = this.goal();
    if (!goal || goal.target === 0) return 0;
    return Math.min((goal.currentValue / goal.target) * 100, 100);
  });
}
