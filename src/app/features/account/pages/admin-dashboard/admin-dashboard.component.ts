import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  ResourceStatus,
  effect,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';

import { AccountService, type AdminDashboardDto } from '../../services/account.service';

const SELF_ADMIN_EMAIL = 'dhudson0242@gmail.com';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './admin-dashboard.component.html',
  styleUrl: './admin-dashboard.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboardComponent {
  private readonly accountService = inject(AccountService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly data = signal<AdminDashboardDto | null>(null);

  constructor() {
    effect(() => {
      const cur = this.accountService.currentUser;
      if (cur.status() !== ResourceStatus.Resolved) return;
      const user = cur.value();
      if (!user) return;
      if (user.email?.toLowerCase() !== SELF_ADMIN_EMAIL) {
        void this.router.navigate(['/settings']);
      }
    });

    effect(() => {
      this.loading.set(true);
      this.error.set(null);
      this.data.set(null);
      this.accountService
        .getAdminDashboard()
        .pipe(take(1))
        .subscribe({
          next: (res) => {
            this.data.set(res);
            this.loading.set(false);
          },
          error: (err: unknown) => {
            this.loading.set(false);
            this.error.set(AdminDashboardComponent.errorMessage(err));
          },
        });
    });
  }

  private static errorMessage(err: unknown): string {
    if (err instanceof HttpErrorResponse) {
      const body = err.error as { message?: string | string[] } | undefined;
      if (body?.message !== undefined) {
        return Array.isArray(body.message) ? body.message.join('; ') : body.message;
      }
      if (err.status === 403) return 'Forbidden.';
      if (err.status === 401) return 'Please sign in again.';
      return err.message || `Request failed (${err.status})`;
    }
    return 'Something went wrong.';
  }
}

