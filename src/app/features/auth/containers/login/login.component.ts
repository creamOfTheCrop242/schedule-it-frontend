import { Component, inject, OnInit } from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { InputComponent } from '../../../shared/components/input/input.component';
import { Router, RouterModule } from '@angular/router';
import { LoginRequest } from '../../models/auth.model';
import { AuthService } from '../../services/auth.service';
import { take } from 'rxjs';
import { ErrorTextComponent } from '../../../shared/components/error-text/error-text.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-login',
  imports: [
    InputComponent,
    RouterModule,
    ReactiveFormsModule,
    ErrorTextComponent,
    ButtonComponent,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  router = inject(Router);
  authService = inject(AuthService);
  formErrors = { email: null, password: null };
  submissionError;
  googleUrl = `${environment.baseUrl}/auth/google`;
  facebookUrl = `${environment.baseUrl}/auth/facebook`;

  validateForm() {
    if (this.form.invalid) {
      if (this.form.controls['email'].errors) {
        this.formErrors.email = 'Please enter a valid email';
      }

      if (this.form.controls['password'].errors) {
        this.formErrors.password = 'Please enter a valid password';
      }

      return false;
    }
    this.formErrors.email = null;
    this.formErrors.password = null;
    return true;
  }

  login() {
    if (!this.validateForm()) {
      return;
    }

    const request: LoginRequest = {
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value,
    };

    this.authService
      .loginUser(request)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.authService.authStatus.reload();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.submissionError = 'An error has occured';
        },
      });
  }
}
