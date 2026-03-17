import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  input,
  signal,
} from '@angular/core';
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogComponent {
  log = input<Log>();
  expandedLogId = signal<string | null>(null);
  logService = inject(LogService);
  goalsService = inject(GoalsService);

  readonly LogPriority = LogPriority;

  toggleDescription(logId: string): void {
    if (this.expandedLogId() === logId) {
      this.expandedLogId.set(null);
    } else {
      this.expandedLogId.set(logId);
    }
  }

  isExpanded(logId: string): boolean {
    return this.expandedLogId() === logId;
  }

  deleteConfirmId = signal<string | null>(null);

  deleteLog(id: string) {
    this.deleteConfirmId.set(id);
  }

  cancelDelete() {
    this.deleteConfirmId.set(null);
  }

  confirmDelete(id: string) {
    this.logService.deleteLog(id).subscribe({
      next: () => {
        this.logService.allLogs.reload();
        this.deleteConfirmId.set(null);
      },
    });
  }

  completeLog(logId: string, completed: boolean, event?: Event) {
    if (event) {
      event.stopPropagation();

      this.logService
        .toggleLogStatus({
          id: logId,
          completed,
        })
        .pipe(take(1))
        .subscribe({
          next: () => {
            this.logService.allLogs.reload();
            this.goalsService.logsGoalStatus.reload();
          },
          error: () => {},
        });
    }
  }
}
