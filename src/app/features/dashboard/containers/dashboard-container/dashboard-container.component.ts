import { Component } from '@angular/core';
import { TaskCardComponent } from '../../components/task-card/task-card.component';
import { TaskProgressCardComponent } from '../../components/task-progress-card/task-progress-card.component';

@Component({
  selector: 'app-dashboard-container',
  imports: [TaskProgressCardComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
})
export class DashboardContainerComponent {}
