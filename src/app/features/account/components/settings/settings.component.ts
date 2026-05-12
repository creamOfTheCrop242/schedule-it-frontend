import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, InputComponent, RouterLink],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly accountService = inject(AccountService);
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly showDevOnboardingReset =
    !environment.production && !!environment.devOnboardingResetSecret;

  readonly resetSandboxSubmitting = signal(false);
  readonly resetSandboxError = signal<string | null>(null);

  readonly currentUser = this.accountService.currentUser;

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
  });

  readonly isLoading = computed(() =>
    this.accountService.currentUser.isLoading()
  );

  readonly isLoaded = computed(() => {
    return (
      this.accountService.currentUser.value() &&
      !this.accountService.currentUser.isLoading()
    );
  });

  constructor() {
    effect(() => {
      const user = this.currentUser.value();
      if (user) {
        this.form.patchValue({
          name: user.name || '',
        });
      }
    });
  }

  onSubmit(): void {
    if (!this.form.valid || !this.form.value.name) return;

    this.accountService
      .updateUserName({ name: this.form.value.name })
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.accountService.currentUser.reload();
        },
        error: (error) => {
          console.error('Failed to update name:', error);
        },
      });
  }

  logout(): void {
    // Delete the access_token cookie
    this.deleteCookie('access_token');

    this.authService.logout().subscribe({
      next: () => {
        this.authService.authStatus.reload();
        this.router.navigate(['/auth/login']);
      },
      error: (error) => {
        console.error('Failed to logout:', error);
      },
    });
  }

  private deleteCookie(name: string): void {
    // Try to delete cookie by setting it to expire in the past
    // This works for non-HTTP-only cookies
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.${window.location.hostname};`;

    // For secure cookies (HTTPS), try with Secure flag
    if (window.location.protocol === 'https:') {
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;`;
    }
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  resetOnboardingSandbox(): void {
    const secret = environment.devOnboardingResetSecret;
    if (!secret) return;

    this.resetSandboxError.set(null);
    this.resetSandboxSubmitting.set(true);

    this.accountService
      .resetOnboardingSandbox(secret)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.resetSandboxSubmitting.set(false);
          try {
            localStorage.removeItem('gl_onboarding_v1');
            localStorage.removeItem('gl_onboarding_banner_dismiss_v1');
          } catch {
            /* ignore */
          }
          void this.router.navigateByUrl('/dashboard');
        },
        error: () => {
          this.resetSandboxSubmitting.set(false);
          this.resetSandboxError.set(
            'Reset failed. Ensure the backend is running (not production), DEV_ONBOARDING_RESET_SECRET in backend .env matches this dev app build, and the server was restarted after changing .env.',
          );
        },
      });
  }
}
