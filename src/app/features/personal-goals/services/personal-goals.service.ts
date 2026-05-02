import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PersonalGoalRow } from '../models/personal-goal.model';

export interface CreatePersonalGoalPayload {
  title: string;
  description?: string;
  targetDate?: string;
}

export interface UpdatePersonalGoalPayload {
  title?: string;
  description?: string;
  /** Omit to leave unchanged; `null` or `""` clears. */
  targetDate?: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PersonalGoalsService {
  private readonly http = inject(HttpClient);

  /** All personal goals for pickers and list (reload after mutations). */
  readonly personalGoalsOptions = httpResource<PersonalGoalRow[]>(() => ({
    url: `${environment.baseUrl}/personal-goals`,
  }));

  create(payload: CreatePersonalGoalPayload) {
    return this.http.post<PersonalGoalRow>(
      `${environment.baseUrl}/personal-goals`,
      payload,
    );
  }

  getOne(id: string): Observable<PersonalGoalRow> {
    return this.http.get<PersonalGoalRow>(
      `${environment.baseUrl}/personal-goals/${id}`,
    );
  }

  update(id: string, body: UpdatePersonalGoalPayload) {
    return this.http.patch<PersonalGoalRow>(
      `${environment.baseUrl}/personal-goals/${id}`,
      body,
    );
  }

  delete(id: string) {
    return this.http.delete<void>(
      `${environment.baseUrl}/personal-goals/${id}`,
    );
  }
}
