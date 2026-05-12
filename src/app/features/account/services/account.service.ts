import { HttpClient, httpResource } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import {
  UpdateAccountRequest,
  UpdateUserNameRequest,
  User,
} from '../model/account.model';

export interface AdminDashboardDto {
  totalAccounts: number;
  accounts: Array<{
    email: string;
    lastActivityAt: string; // ISO
  }>;
}

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

  updateAccount(request: UpdateAccountRequest) {
    return this.httpClient.put<User>(
      `${environment.baseUrl}/account/update`,
      request,
      { withCredentials: true }
    );
  }

  getAdminDashboard() {
    return this.httpClient.get<AdminDashboardDto>(
      `${environment.baseUrl}/internal/admin/dashboard`,
      { withCredentials: true },
    );
  }

  /** Development only: soft-delete all logs + clear summaries; requires matching backend secret. */
  resetOnboardingSandbox(devSecret: string) {
    return this.httpClient.post<{
      ok: true;
      logsSoftDeleted: number;
      summariesDeleted: number;
    }>(
      `${environment.baseUrl}/internal/dev/reset-onboarding-sandbox`,
      {},
      {
        withCredentials: true,
        headers: { 'X-Dev-Onboarding-Reset': devSecret },
      },
    );
  }
}
