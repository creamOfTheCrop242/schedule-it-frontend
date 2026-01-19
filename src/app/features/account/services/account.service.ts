import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { UpdateUserNameRequest, User } from '../model/account.model';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  httpClient = inject(HttpClient);

  currentUser = httpResource<User>({
    url: `${environment.baseUrl}/account/me`,
    withCredentials: true,
  });

  updateUserName(request: UpdateUserNameRequest) {
    return this.httpClient.put<User>(
      `${environment.baseUrl}/account/update`,
      request,
      { withCredentials: true }
    );
  }
}
