import { Component } from '@angular/core';
import { TaskCardComponent } from '../../components/task-card/task-card.component';

@Component({
  selector: 'app-dashboard-container',
  imports: [TaskCardComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
})
export class DashboardContainerComponent {}
