import { Component, inject } from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bottom-nav-menu',
  imports: [RouterModule, CommonModule],
  templateUrl: './bottom-nav-menu.component.html',
  styleUrl: './bottom-nav-menu.component.scss',
})
export class BottomNavMenuComponent {
  router = inject(Router);
  currentUrl = this.router.url;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl = event.url;
      });
  }

  isActiveRoute(route: string): boolean {
    const url = this.currentUrl;
    if (route === '/dashboard') {
      return url === '/dashboard';
    }
    if (route === '/logs') {
      return url === '/logs' || url.startsWith('/logs/edit-log');
    }
    if (route === '/logs/add-log') {
      return url === '/logs/add-log' || url.startsWith('/logs/edit-log');
    }
    if (route === '/goals') {
      return (
        url === '/goals' ||
        (url.startsWith('/goals/') &&
          !url.includes('/add-goal') &&
          !url.includes('/edit-goal'))
      );
    }
    return url.startsWith(route);
  }
}
