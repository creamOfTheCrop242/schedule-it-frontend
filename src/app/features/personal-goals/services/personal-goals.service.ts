import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Log } from '../../logs/models/log.model';
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

  /** Logs assigned to this personal goal (same shape as main log list). */
  getLinkedLogs(personalGoalId: string): Observable<Log[]> {
    return this.http.get<Log[]>(
      `${environment.baseUrl}/personal-goals/${personalGoalId}/logs`,
    );
  }

  /** On-demand AI coaching from logs linked to this goal (uses OpenAI on the server). */
  requestCoaching(personalGoalId: string): Observable<{ advice: string }> {
    return this.http.post<{ advice: string }>(
      `${environment.baseUrl}/personal-goals/${personalGoalId}/coaching`,
      {},
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
