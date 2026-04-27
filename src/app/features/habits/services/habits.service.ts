import { HttpClient, HttpParams, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { GoalScope } from '../../goals/models/goals.models';
import { HabitRow } from '../models/habit.model';

export interface CreateHabitPayload {
  name: string;
  description?: string;
  cadence?: GoalScope;
  targetPerPeriod?: number;
}

export interface UpdateHabitPayload {
  name?: string;
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

  getHabit(id: string): Observable<HabitRow> {
    return this.http.get<HabitRow>(`${environment.baseUrl}/habits/${id}`, {
      params: this.habitsListParams(),
    });
  }

  updateHabit(id: string, body: UpdateHabitPayload): Observable<HabitRow> {
    return this.http.patch<HabitRow>(
      `${environment.baseUrl}/habits/${id}`,
      body,
    );
  }

  deleteHabit(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.baseUrl}/habits/${id}`);
  }
}
