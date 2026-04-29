import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { FeedbackListItem } from '../models/feedback.model';

@Injectable({
  providedIn: 'root',
})
export class FeedbackService {
  private readonly http = inject(HttpClient);

  submit(message: string): Observable<{ id: number }> {
    return this.http.post<{ id: number }>(
      `${environment.baseUrl}/feedback`,
      { message },
    );
  }

  listForAdmin(): Observable<FeedbackListItem[]> {
    return this.http.get<FeedbackListItem[]>(
      `${environment.baseUrl}/feedback`,
    );
  }
}
