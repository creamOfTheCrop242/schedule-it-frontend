import { CommonModule } from '@angular/common';
import { Component, inject, input } from '@angular/core';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { Log, LogPriority } from '../../models/log.model';
import { LogService } from '../../services/log.service';
import { GoalsService } from '../../../goals/services/goals.service';

@Component({
  selector: 'app-log',
  imports: [CommonModule, ButtonComponent],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss',
})
export class LogComponent {
  log = input<Log>();
  expandedLogId: string | null = null;
  logService = inject(LogService);
  goalsService = inject(GoalsService);

  readonly LogPriority = LogPriority;

  toggleDescription(logId: string): void {
    if (this.expandedLogId === logId) {
      this.expandedLogId = null;
    } else {
      this.expandedLogId = logId;
    }
  }

  isExpanded(logId: string): boolean {
    return this.expandedLogId === logId;
  }

  deleteLog(id: string) {
    if (confirm('Are you sure you want to delete this log?')) {
      this.logService.deleteLog(id).subscribe({
        next: () => {
          if (this.log()?.completed) {
            this.logService.completeLogs.reload();
          } else {
            this.logService.incompleteLogs.reload();
          }
        },
      });
    }
  }

  completeLog(completed: boolean, event?: Event) {
    if (event) {
      event.stopPropagation();

      this.logService
        .toggleLogStatus({
          id: this.log()!.id,
          completed,
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.logService.incompleteLogs.reload();
            this.logService.completeLogs.reload();
            this.goalsService.logsGoalStatus.reload();
          },
          error: (error) => {
            console.error(error);
          },
        });
    }
  }
}
