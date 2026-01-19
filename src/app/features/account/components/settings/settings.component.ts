import { Component, computed, effect, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { AccountService } from '../../services/account.service';
import { AuthService } from '../../../auth/services/auth.service';
import { InputComponent } from '../../../shared/components/input/input.component';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, ReactiveFormsModule, InputComponent],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.scss',
})
export class SettingsComponent {
  private readonly accountService = inject(AccountService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

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
}
