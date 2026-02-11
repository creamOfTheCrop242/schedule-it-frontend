import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogService } from '../../services/log.service';
import { LogComponent } from '../../components/log/log.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GoalsService } from '../../../goals/services/goals.service';

@Component({
  selector: 'app-logs-container',
  imports: [RouterModule, LogComponent, InputComponent, ReactiveFormsModule],
  templateUrl: './logs-container.component.html',
  styleUrl: './logs-container.component.scss',
})
export class LogsContainerComponent implements OnInit {
  logService = inject(LogService);
  goalsService = inject(GoalsService);
  isLoading = this.logService.incompleteLogs.isLoading;
  hasError = this.logService.incompleteLogs.error;
  completedLogs = this.logService.completeLogs;
  incompleteLogs = this.logService.incompleteLogs;
  form = new FormGroup({
    date: new FormControl<Date | null>(null),
  });
  dailyGoalStatus = this.goalsService.dailyGoalStatus;
  dailyGoalStatusLoading = this.goalsService.logsGoalStatus.isLoading;

  constructor() {}

  ngOnInit(): void {
    this.form.controls.date.valueChanges.subscribe((value) => {
      this.logService.selectedDate.set(value?.toString() ?? '');
      this.completedLogs.reload();
    });
  }
}
