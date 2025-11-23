import { Component, inject, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../services/task.service';
import { TaskComponent } from '../../components/task/task.component';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GoalsService } from '../../../goals/services/goals.service';

@Component({
  selector: 'app-tasks-container',
  imports: [RouterModule, TaskComponent, InputComponent, ReactiveFormsModule],
  templateUrl: './tasks-container.component.html',
  styleUrl: './tasks-container.component.scss',
})
export class TasksContainerComponent implements OnInit {
  taskService = inject(TaskService);
  goalsService = inject(GoalsService);
  isLoading = this.taskService.incompleteTasks.isLoading;
  hasError = this.taskService.incompleteTasks.error;
  completedTasks = this.taskService.completeTasks;
  incompleteTasks = this.taskService.incompleteTasks;
  form = new FormGroup({
    date: new FormControl<Date | null>(null),
  });
  dailyGoalStatus = this.goalsService.dailyGoalStatus;
  dailyGoalStatusLoading = this.goalsService.tasksGoalStatus.isLoading;

  constructor() {}

  ngOnInit(): void {
    this.form.controls.date.valueChanges.subscribe((value) => {
      console.log(value);
      console.log(Intl.DateTimeFormat().resolvedOptions().timeZone);
      this.taskService.selectedDate.set(value.toString());
      this.completedTasks.reload();
    });
  }
}
