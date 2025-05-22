import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { take } from 'rxjs';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { ErrorTextComponent } from '../../../shared/components/error-text/error-text.component';

@Component({
  selector: 'app-register',
  imports: [
    InputComponent,
    RouterModule,
    ReactiveFormsModule,
    ButtonComponent,
    ErrorTextComponent,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
  router = inject(Router);
  form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    confirmPassword: new FormControl('', [Validators.required]),
  });
  formErrors = {
    name: null,
    email: null,
    password: null,
    confirmPassword: null,
  };

  validateForm() {
    this.formErrors = {
      name: null,
      email: null,
      password: null,
      confirmPassword: null,
    };

    if (this.form.invalid) {
      console.log(this.form);
      if (this.form.controls['name'].errors) {
        this.formErrors.name = 'Please enter a name';
      }

      if (this.form.controls['email'].errors) {
        this.formErrors.email = 'Please enter a valid email';
      }

      if (this.form.controls['password'].errors) {
        this.formErrors.password = 'Please enter a valid password';
      }

      if (this.form.controls['confirmPassword'].errors) {
        this.formErrors.confirmPassword = 'Please enter a Confirm password';
      }

      return false;
    }
    this.formErrors.name = null;
    this.formErrors.confirmPassword = null;
    this.formErrors.email = null;
    this.formErrors.password = null;
    return true;
  }

  registerUser() {
    if (!this.validateForm()) {
      return;
    }
    console.log(
      this.form.controls['password'].value !==
        this.form.controls['confirmPassword'].value
    );
    if (
      this.form.controls['password'].value !==
      this.form.controls['confirmPassword'].value
    ) {
      console.log('haere');
      this.formErrors.confirmPassword =
        'Current Password does not match new password';
      return;
    }

    const request: RegisterRequest = {
      email: this.form.controls['email'].value,
      name: this.form.controls['name'].value,
      password: this.form.controls['password'].value,
    };
    this.authService
      .sendVerifyCode(request)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.router.navigate(['/auth/register/send-verify-code'], {
            queryParams: { email: this.form.controls['email'].value },
          });
        },
        error: (error) => {},
      });
  }
}
