import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HabitRow } from '../models/habit.model';

export interface CreateHabitPayload {
  name: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class HabitsService {
  private readonly http = inject(HttpClient);

  /** All habits for the account (pickers, lists). */
  readonly habitsOptions = httpResource<HabitRow[]>({
    url: `${environment.baseUrl}/habits`,
  });

  create(payload: CreateHabitPayload) {
    return this.http.post<HabitRow>(`${environment.baseUrl}/habits`, payload);
  }
}
