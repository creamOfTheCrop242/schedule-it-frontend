import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { catchError, finalize, of } from 'rxjs';
import { environment } from '../../../../../environments/environment';

export interface DailyMotivationDto {
  story: string;
  date: string;
}

@Component({
  selector: 'app-daily-motivation-page',
  imports: [RouterLink],
  templateUrl: './daily-motivation-page.component.html',
  styleUrl: './daily-motivation-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DailyMotivationPageComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly destroyRef = inject(DestroyRef);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly story = signal<string | null>(null);
  readonly storyDate = signal<string | null>(null);

  ngOnInit(): void {
    this.http
      .get<DailyMotivationDto>(`${environment.baseUrl}/daily-motivation`)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        catchError((err: unknown) => {
          this.error.set(DailyMotivationPageComponent.httpErrorMessage(err));
          return of(null);
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe((body) => {
        if (body) {
          this.story.set(body.story);
          this.storyDate.set(body.date);
        }
      });
  }

  private static httpErrorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const message = err.error as { message?: string | string[] } | undefined;
      if (message?.message !== undefined) {
        return Array.isArray(message.message)
          ? message.message.join('; ')
          : message.message;
      }
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong.';
  }
}
