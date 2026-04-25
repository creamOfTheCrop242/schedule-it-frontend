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
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, finalize, of, switchMap } from 'rxjs';
import { Task } from '../../models/task.model';
import { TasksService } from '../../services/tasks.service';

@Component({
  selector: 'app-task-detail',
  imports: [CommonModule, RouterLink],
  templateUrl: './task-detail.component.html',
  styleUrl: './task-detail.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TaskDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly tasksService = inject(TasksService);
  private readonly destroyRef = inject(DestroyRef);

  readonly task = signal<Task | undefined>(undefined);
  readonly isLoading = signal(true);
  readonly loadError = signal(false);

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
          return this.tasksService.getTask(id).pipe(
            catchError(() => {
              this.loadError.set(true);
              return of(undefined);
            }),
            finalize(() => this.isLoading.set(false)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((t) => this.task.set(t));
  }
}
