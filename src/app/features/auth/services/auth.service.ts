import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../environments/environment';
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

  authStatus = httpResource({
    url: `${environment.baseUrl}/auth/status`,
    withCredentials: true,
  });

  loginUser(request: LoginRequest) {
    return this.httpClient.post(`${environment.baseUrl}/auth/login`, request);
  }

  sendVerifyCode(request: RegisterRequest) {
    return this.httpClient.post(
      `${environment.baseUrl}/auth/send-verify-code`,
      request
    );
  }

  verifyCode(request: VerifyCodeRequest) {
    return this.httpClient.post(
      `${environment.baseUrl}/auth/register`,
      request
    );
  }
}
