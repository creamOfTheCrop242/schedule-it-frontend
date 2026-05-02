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
  readonly goalsHabitsModalOpen = signal(false);
  readonly goalsHabitsModalExiting = signal(false);

  private readonly exitFadeMs = 300;
  private exitTimer: ReturnType<typeof setTimeout> | null = null;
  private goalsHabitsExitTimer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => {
        this.currentUrl.set(event.url);
      });
  }

  ngOnDestroy(): void {
    this.clearExitTimer();
    this.clearGoalsHabitsExitTimer();
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
    if (this.addChoiceModalOpen() && !this.addChoiceModalExiting()) {
      this.closeAddChoiceModal();
      return;
    }
    if (this.goalsHabitsModalOpen() && !this.goalsHabitsModalExiting()) {
      this.closeGoalsHabitsModal();
    }
  }

  openGoalsHabitsModal(): void {
    this.clearGoalsHabitsExitTimer();
    this.goalsHabitsModalExiting.set(false);
    this.goalsHabitsModalOpen.set(true);
  }

  closeGoalsHabitsModal(): void {
    this.beginGoalsHabitsModalExit();
  }

  onGoalsHabitsBackdropClick(event: MouseEvent): void {
    if (this.goalsHabitsModalExiting()) return;
    if (event.target === event.currentTarget) {
      this.closeGoalsHabitsModal();
    }
  }

  navigateToGoals(): void {
    this.beginGoalsHabitsModalExit(() => void this.router.navigate(['/goals']));
  }

  navigateToHabits(): void {
    this.beginGoalsHabitsModalExit(() => void this.router.navigate(['/habits']));
  }

  navigateToPersonalGoals(): void {
    this.beginGoalsHabitsModalExit(() =>
      void this.router.navigate(['/personal-goals']),
    );
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

  private beginGoalsHabitsModalExit(after?: () => void): void {
    if (!this.goalsHabitsModalOpen()) {
      after?.();
      return;
    }
    if (this.goalsHabitsModalExiting()) return;

    this.goalsHabitsModalExiting.set(true);
    this.clearGoalsHabitsExitTimer();

    const delayMs = this.exitAnimationDelayMs();
    if (delayMs <= 0) {
      queueMicrotask(() => this.finishGoalsHabitsModalExit(after));
      return;
    }
    this.goalsHabitsExitTimer = setTimeout(
      () => this.finishGoalsHabitsModalExit(after),
      delayMs,
    );
  }

  private finishGoalsHabitsModalExit(after?: () => void): void {
    this.goalsHabitsExitTimer = null;
    this.goalsHabitsModalOpen.set(false);
    this.goalsHabitsModalExiting.set(false);
    after?.();
  }

  private clearGoalsHabitsExitTimer(): void {
    if (this.goalsHabitsExitTimer !== null) {
      clearTimeout(this.goalsHabitsExitTimer);
      this.goalsHabitsExitTimer = null;
    }
  }

  isActiveRoute(route: string): boolean {
    const url = this.currentUrl();
    const path = url.split('?')[0];
    if (route === '/dashboard') {
      return path === '/dashboard';
    }
    if (route === '/logs') {
      return (
        path === '/logs' ||
        path.startsWith('/logs/edit-log') ||
        path.startsWith('/logs/log/')
      );
    }
    if (route === '/logs/add-log') {
      return (
        path === '/logs/add-log' ||
        path.startsWith('/logs/edit-log') ||
        path === '/tasks/add-task' ||
        path.startsWith('/tasks/edit-task')
      );
    }
    if (route === '/goals') {
      return (
        path === '/habits' ||
        path.startsWith('/habits/') ||
        path === '/goals' ||
        (path.startsWith('/goals/') &&
          !path.includes('/add-goal') &&
          !path.includes('/edit-goal')) ||
        path === '/personal-goals' ||
        path.startsWith('/personal-goals/')
      );
    }
    if (route === '/tasks') {
      return (
        path === '/tasks' ||
        (path.startsWith('/tasks/') &&
          !path.startsWith('/tasks/add-task') &&
          !path.startsWith('/tasks/edit-task'))
      );
    }
    return path.startsWith(route);
  }
}
