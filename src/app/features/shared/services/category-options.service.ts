import { httpResource } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CategoryOptionsService {
  /** Distinct category labels in use across logs and tasks for the account. */
  readonly categoryOptions = httpResource<string[]>({
    url: `${environment.baseUrl}/categories/options`,
  });
}
