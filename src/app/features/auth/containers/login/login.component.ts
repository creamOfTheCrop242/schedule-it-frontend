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

@Component({
  selector: 'app-login',
  imports: [InputComponent, RouterModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
})
export class LoginComponent {
  form = new FormGroup({
    email: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });
  router = inject(Router);
  accountService = inject(AuthService);

  navigateToRegister() {
    this.router.navigate(['auth/register']);
  }

  login() {
    console.log('here');
    const requst: LoginRequest = {
      email: this.form.controls['email'].value,
      password: this.form.controls['password'].value,
    };

    this.accountService
      .loginUser(requst)
      .pipe(take(1))
      .subscribe((response) => {
        console.log(response);
      });
  }
}
