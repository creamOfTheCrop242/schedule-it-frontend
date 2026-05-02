import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { PersonalGoalRow } from '../../models/personal-goal.model';

@Component({
  selector: 'app-personal-goals-container',
  imports: [RouterLink],
  templateUrl: './personal-goals-container.component.html',
  styleUrl: './personal-goals-container.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PersonalGoalsContainerComponent {
  private readonly http = inject(HttpClient);

  readonly goals = signal<PersonalGoalRow[]>([]);
  readonly loading = signal(true);
  readonly error = signal(false);

  constructor() {
    this.http.get<PersonalGoalRow[]>(`${environment.baseUrl}/personal-goals`).subscribe({
      next: (rows) => {
        this.goals.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(true);
        this.loading.set(false);
      },
    });
  }
}
