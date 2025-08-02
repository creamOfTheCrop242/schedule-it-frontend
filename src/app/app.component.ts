import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { AuthService } from './features/auth/services/auth.service';
import { TopHeaderComponent } from './features/shared/components/top-header/top-header.component';
import { BottomNavMenuComponent } from './features/shared/components/bottom-nav-menu/bottom-nav-menu.component';
import { UpdateNotificationComponent } from './shared/components/update-notification/update-notification.component';
import { InstallPromptComponent } from './shared/components/install-prompt/install-prompt.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TopHeaderComponent,
    BottomNavMenuComponent,
    UpdateNotificationComponent,
    InstallPromptComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  appService = inject(AppService);
  authService = inject(AuthService);
  router = inject(Router);
  title = 'schedule-it';
  status = false;

  constructor() {}
}
