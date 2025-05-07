import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AppService {
  httpService = inject(HttpClient);
  constructor() {}

  googleLogin() {
    return this.httpService.get('http://localhost:3000/auth/google');
  }

  checkStatus() {
    return this.httpService.get('http://localhost:3000/auth/status', {
      withCredentials: true,
    });
  }
}
