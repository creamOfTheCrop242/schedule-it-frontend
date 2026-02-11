import { Component } from '@angular/core';
import { LogProgressCardComponent } from '../../components/log-progress-card/log-progress-card.component';

@Component({
  selector: 'app-dashboard-container',
  imports: [LogProgressCardComponent],
  templateUrl: './dashboard-container.component.html',
  styleUrl: './dashboard-container.component.scss',
})
export class DashboardContainerComponent {}
