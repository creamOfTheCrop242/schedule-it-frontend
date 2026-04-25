import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bottom-nav-menu',
  imports: [RouterModule, CommonModule],
  templateUrl: './bottom-nav-menu.component.html',
  styleUrl: './bottom-nav-menu.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
  },
})
export class BottomNavMenuComponent implements OnDestroy {
  router = inject(Router);
  currentUrl = signal(this.router.url);
  readonly addChoiceModalOpen = signal(false);
  readonly addChoiceModalExiting = signal(false);

  private readonly exitFadeMs = 300;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.url);
      });
  }

  ngOnDestroy(): void {
    this.clearExitTimer();
  }

  openAddChoiceModal(): void {
    this.clearExitTimer();
    this.addChoiceModalExiting.set(false);
    this.addChoiceModalOpen.set(true);
  }

  closeAddChoiceModal(): void {
    this.beginModalExit();
  }

  onBackdropClick(event: MouseEvent): void {
    if (this.addChoiceModalExiting()) return;
    if (event.target === event.currentTarget) {
      this.closeAddChoiceModal();
    }
  }

  onEscape(): void {
    if (!this.addChoiceModalOpen() || this.addChoiceModalExiting()) return;
    this.closeAddChoiceModal();
  }

  navigateToAddLog(): void {
    this.beginModalExit(() => void this.router.navigate(['/logs/add-log']));
  }

  navigateToAddTask(): void {
    this.beginModalExit(() => void this.router.navigate(['/tasks/add-task']));
  }

  private beginModalExit(after?: () => void): void {
    if (!this.addChoiceModalOpen()) {
      after?.();
      return;
    }
    if (this.addChoiceModalExiting()) return;

    this.addChoiceModalExiting.set(true);
    this.clearExitTimer();

    const delayMs = this.exitAnimationDelayMs();
    if (delayMs <= 0) {
      queueMicrotask(() => this.finishModalExit(after));
      return;
    }
    this.exitTimer = setTimeout(() => this.finishModalExit(after), delayMs);
  }

  private finishModalExit(after?: () => void): void {
    this.exitTimer = null;
    this.addChoiceModalOpen.set(false);
    this.addChoiceModalExiting.set(false);
    after?.();
  }

  private exitAnimationDelayMs(): number {
    if (
      typeof matchMedia !== 'undefined' &&
      matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      return 0;
    }
    return this.exitFadeMs;
  }

  private clearExitTimer(): void {
    if (this.exitTimer !== null) {
      clearTimeout(this.exitTimer);
      this.exitTimer = null;
    }
  }

  isActiveRoute(route: string): boolean {
    const url = this.currentUrl();
    if (route === '/dashboard') {
      return url === '/dashboard';
    }
    if (route === '/logs') {
      return (
        url === '/logs' ||
        url.startsWith('/logs/edit-log') ||
        url.startsWith('/logs/log/')
      );
    }
    if (route === '/logs/add-log') {
      return (
        url === '/logs/add-log' ||
        url.startsWith('/logs/edit-log') ||
        url === '/tasks/add-task'
      );
    }
    if (route === '/goals') {
      return (
        url === '/goals' ||
        (url.startsWith('/goals/') &&
          !url.includes('/add-goal') &&
          !url.includes('/edit-goal'))
      );
    }
    if (route === '/tasks') {
      return (
        url === '/tasks' ||
        (url.startsWith('/tasks/') && !url.startsWith('/tasks/add-task'))
      );
    }
    return url.startsWith(route);
  }
}
