import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { AppService } from './app.service';
import { AuthService } from './features/auth/services/auth.service';
import { TopHeaderComponent } from './features/shared/components/top-header/top-header.component';
import { BottomNavMenuComponent } from './features/shared/components/bottom-nav-menu/bottom-nav-menu.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TopHeaderComponent, BottomNavMenuComponent],
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
