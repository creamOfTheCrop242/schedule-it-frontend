import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { LoginRequest } from '../models/auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  httpClient = inject(HttpClient);

  constructor() {}

  authStatus = rxResource({
    loader: () =>
      this.httpClient.get('http://localhost:3000/auth/status', {
        withCredentials: true,
      }),
  });

  loginUser(request: LoginRequest) {
    return this.httpClient.post(`${environment.baseUrl}/auth/login`, request, {
      withCredentials: true,
    });
  }
}
