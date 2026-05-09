import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Log } from '../logs/models/log.model';

/** First-page probe for onboarding guards (unfiltered list). */
export function fetchLogsLimitOne(http: HttpClient): Observable<Log[]> {
  const params = new HttpParams().set('limit', '1').set('offset', '0');
  return http.get<Log[]>(`${environment.baseUrl}/logs`, { params });
}
