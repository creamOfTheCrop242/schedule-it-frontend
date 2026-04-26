import { HttpClient, HttpParams } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { HabitRow } from '../../models/habit.model';

@Component({
  selector: 'app-habits-container',
  imports: [RouterLink],
  templateUrl: './habits-container.component.html',
  styleUrl: './habits-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitsContainerComponent {
  private readonly http = inject(HttpClient);

  readonly habits = signal<HabitRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    const params = new HttpParams().set(
      'timeZone',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
    this.http.get<HabitRow[]>(`${environment.baseUrl}/habits`, { params }).subscribe({
      next: (rows) => {
        this.habits.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
