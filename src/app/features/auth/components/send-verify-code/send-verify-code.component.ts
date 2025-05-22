import { Component, Inject, inject } from '@angular/core';
import { InputComponent } from '../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ErrorTextComponent } from '../../../shared/components/error-text/error-text.component';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { VerifyCodeRequest } from '../../models/auth.model';
import { take } from 'rxjs';

@Component({
  selector: 'app-send-verify-code',
  imports: [
    InputComponent,
    ButtonComponent,
    ErrorTextComponent,
    ReactiveFormsModule,
  ],
  templateUrl: './send-verify-code.component.html',
  styleUrl: './send-verify-code.component.scss',
})
export class SendVerifyCodeComponent {
  form = new FormGroup({
    code: new FormControl('', [Validators.required]),
  });
  error: string;
  route = inject(ActivatedRoute);
  email = this.route.snapshot.queryParamMap.get('email');
  authService = inject(AuthService);
  router = inject(Router);

  verifyCode() {
    console.log(this.email);
    if (this.form.invalid) {
      this.error = 'Please enter the Verification Code';
      return;
    }

    const request: VerifyCodeRequest = {
      email: this.email,
      code: this.form.controls['code'].value,
    };

    this.authService
      .verifyCode(request)
      .pipe(take(1))
      .subscribe({
        next: (response) => {
          this.authService.authStatus.reload();
          this.router.navigate(['/dashboard']);
        },
        error: (error) => {
          this.error = error;
        },
      });
  }
}
