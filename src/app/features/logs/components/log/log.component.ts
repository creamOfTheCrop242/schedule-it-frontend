import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Log } from '../../models/log.model';
import { moodPillThemeClass } from '../../utils/mood-pill.theme';

@Component({
  selector: 'app-log',
  imports: [CommonModule, RouterLink],
  templateUrl: './log.component.html',
  styleUrl: './log.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogComponent {
  log = input<Log>();

  /** Bound in template for mood pill border / glow colors. */
  protected readonly moodPillClass = moodPillThemeClass;
}
