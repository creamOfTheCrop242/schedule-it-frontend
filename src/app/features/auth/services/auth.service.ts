import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import {
  LoginRequest,
  RegisterRequest,
  VerifyCodeRequest,
} from '../models/auth.model';

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

  sendVerifyCode(request: RegisterRequest) {
    return this.httpClient.post(
      `${environment.baseUrl}/auth/send-verify-code`,
      request,
      {
        withCredentials: true,
      }
    );
  }

  verifyCode(request: VerifyCodeRequest) {
    return this.httpClient.post(
      `${environment.baseUrl}/auth/register`,
      request,
      {
        withCredentials: true,
      }
    );
  }
}
