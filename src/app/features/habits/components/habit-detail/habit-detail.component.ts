import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap, take } from 'rxjs';
import { HabitRow } from '../../models/habit.model';
import { HabitsService } from '../../services/habits.service';

@Component({
  selector: 'app-habit-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './habit-detail.component.html',
  styleUrl: './habit-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HabitDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly habitsService = inject(HabitsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly habit = signal<HabitRow | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);
  readonly deleteConfirmId = signal<string | null>(null);
  readonly actionsMenuOpen = signal(false);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap((params) => {
          const id = params.get('id');
          if (!id) {
            this.loadError.set(true);
            this.isLoading.set(false);
            return of(undefined);
          }
          this.isLoading.set(true);
          this.loadError.set(false);
          return this.habitsService.getHabit(id).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of(undefined);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((h) => {
        this.actionsMenuOpen.set(false);
        this.deleteConfirmId.set(null);
        this.habit.set(h);
      });
  }

  toggleActionsMenu(): void {
    this.actionsMenuOpen.update((open) => !open);
  }

  closeActionsMenu(): void {
    this.actionsMenuOpen.set(false);
  }

  deleteHabit(id: string): void {
    this.actionsMenuOpen.set(false);
    this.deleteConfirmId.set(id);
  }

  cancelDelete(): void {
    this.deleteConfirmId.set(null);
    this.actionsMenuOpen.set(false);
  }

  confirmDelete(id: string): void {
    this.actionsMenuOpen.set(false);
    this.habitsService.deleteHabit(id).pipe(take(1)).subscribe({
      next: () => {
        this.habitsService.habitsOptions.reload();
        this.deleteConfirmId.set(null);
        void this.router.navigate(['/habits']);
      },
    });
  }
}
