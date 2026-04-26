import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { GoalScope } from '../../goals/models/goals.models';
import { HabitRow } from '../models/habit.model';

export interface CreateHabitPayload {
  name: string;
  description?: string;
  cadence?: GoalScope;
  targetPerPeriod?: number;
}

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private readonly http = inject(HttpClient);

  private habitsListParams(): HttpParams {
    return new HttpParams().set(
      'timeZone',
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    );
  }

  /** All habits for the account (pickers, lists). */
  readonly habitsOptions = httpResource<HabitRow[]>(() => ({
    url: `${environment.baseUrl}/habits`,
    params: this.habitsListParams(),
  }));

  create(payload: CreateHabitPayload) {
    return this.http.post<HabitRow>(`${environment.baseUrl}/habits`, payload);
  }
}
