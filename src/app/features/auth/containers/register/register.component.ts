import { Component, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/auth.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-register',
  imports: [InputComponent, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss',
})
export class RegisterComponent {
  authService = inject(AuthService);
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
    if (this.form.invalid) {
      if (this.form.controls['name'].errors) {
        this.formErrors.email = 'Please enter a name';
      }

      if (this.form.controls['email'].errors) {
        this.formErrors.password = 'Please enter a valid email';
      }

      if (this.form.controls['password'].errors) {
        this.formErrors.password = 'Please enter a valid password';
      }

      if (
        this.form.controls['password'].value !==
        this.form.controls['confirmPassword'].value
      ) {
        this.formErrors.password = 'Please enter a valid password';
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
    const request: RegisterRequest = {
      email: this.form.controls['email'].value,
      name: this.form.controls['name'].value,
      password: this.form.controls['password'].value,
    };

    this.authService
      .sendVerifyCode(request)
      .pipe(take(1))
      .subscribe({ next: (response) => {}, error: (error) => {} });
  }
}
