import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { FeedbackListItem } from '../../models/feedback.model';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-inbox',
  imports: [RouterLink],
  templateUrl: './feedback-inbox.component.html',
  styleUrl: './feedback-inbox.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackInboxComponent implements OnInit {
  private readonly feedbackService = inject(FeedbackService);

  readonly items = signal<FeedbackListItem[]>([]);
  readonly loading = signal(true);
  readonly forbidden = signal(false);
  readonly loadError = signal(false);

  ngOnInit(): void {
    this.feedbackService
      .listForAdmin()
      .pipe(take(1))
      .subscribe({
        next: (rows) => {
          this.items.set(rows);
          this.loading.set(false);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          if (err instanceof HttpErrorResponse && err.status === 403) {
            this.forbidden.set(true);
            return;
          }
          this.loadError.set(true);
        },
      });
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }
}
