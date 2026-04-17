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
import { catchError, finalize, of, switchMap } from 'rxjs';
import { Log } from '../../models/log.model';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-log-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './log-detail.component.html',
  styleUrl: './log-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LogDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly logService = inject(LogService);
  private readonly destroyRef = inject(DestroyRef);

  log = signal<Log | undefined>(undefined);
  isLoading = signal(true);
  loadError = signal(false);
  deleteConfirmId = signal<string | null>(null);
  /** Edit / Delete overflow menu. */
  actionsMenuOpen = signal(false);

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
          return this.logService.getLog(id).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of(undefined);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((l) => {
        this.actionsMenuOpen.set(false);
        this.log.set(l);
      });
  }

  toggleActionsMenu() {
    this.actionsMenuOpen.update((open) => !open);
  }

  closeActionsMenu() {
    this.actionsMenuOpen.set(false);
  }

  deleteLog(id: string) {
    this.actionsMenuOpen.set(false);
    this.deleteConfirmId.set(id);
  }

  cancelDelete() {
    this.deleteConfirmId.set(null);
    this.actionsMenuOpen.set(false);
  }

  confirmDelete(id: string) {
    this.actionsMenuOpen.set(false);
    this.logService.deleteLog(id).subscribe({
      next: () => {
        this.logService.allLogs.reload();
        this.deleteConfirmId.set(null);
        void this.router.navigate(['/logs']);
      },
    });
  }
}
