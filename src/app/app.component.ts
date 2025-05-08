import {
  Component,
  effect,
  inject,
  OnInit,
  ResourceStatus,
} from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { AuthService } from './features/auth/services/auth.service';
import { RxResourceStatuses } from './features/auth/models/auth.model';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  appService = inject(AppService);
  authService = inject(AuthService);
  router = inject(Router);
  title = 'schedule-it';
  status = false;
  // effect = effect(() => {
  //   if (
  //     ResourceStatus[this.authService.authStatus.status()] ===
  //     RxResourceStatuses.Error
  //   ) {
  //     localStorage.setItem('isLoggedIn', 'false');
  //     this.router.navigate(['/auth']);
  //   }

  //   if (this.authService.authStatus.value()) {
  //     localStorage.setItem('isLoggedIn', 'true');
  //     this.router.navigate(['/dashboard']);
  //   }
  // });

  constructor() {}

  googleLogin() {
    window.location.href = 'http://localhost:3000/auth/google';
    // this.appService.googleLogin().subscribe();
  }

  facebookLogin() {
    window.location.href = 'http://localhost:3000/auth/facebook';
    // this.appService.googleLogin().subscribe();
  }
}
