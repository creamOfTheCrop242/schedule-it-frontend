import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject, ResourceStatus } from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, map, take } from 'rxjs';
import { RxResourceStatuses } from '../models/auth.model';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return toObservable(authService.authStatus.status).pipe(
    filter(
      (status) =>
        status === ResourceStatus.Resolved || status === ResourceStatus.Error
    ),
    take(1),
    map((status) => {
      console.log();
      const rxStatus = ResourceStatus[status];
      if (rxStatus === RxResourceStatuses.Error) {
        router.navigate(['/auth']);
        return false;
      }
      return true;
    })
  );
};
