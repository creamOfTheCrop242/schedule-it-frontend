import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { LogService } from '../../services/log.service';
import { LogComponent } from '../../components/log/log.component';

@Component({
  selector: 'app-logs-container',
  imports: [RouterModule, LogComponent],
  templateUrl: './logs-container.component.html',
  styleUrl: './logs-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogsContainerComponent {
  logService = inject(LogService);
  allLogs = this.logService.allLogs;
  isLoading = this.logService.allLogs.isLoading;
  hasError = this.logService.allLogs.error;

  onDateChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.logService.selectedDate.set(input.value || null);
  }

  clearDate() {
    this.logService.selectedDate.set(null);
  }
}
