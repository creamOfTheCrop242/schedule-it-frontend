import { inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { catchError, map, Observable, of, take } from 'rxjs';

import { OnboardingStateService } from './onboarding-state.service';
import { fetchLogsLimitOne } from './onboarding-logs.probe';

/**
 * Sends users with zero logs to `/welcome` until they skip or finish,
 * unless we already synced completion from existing logs or storage.
 */
export const dashboardPreflightGuard: CanActivateFn = (): Observable<
  boolean | UrlTree
> => {
  const onboarding = inject(OnboardingStateService);
  const http = inject(HttpClient);
  const router = inject(Router);

  if (onboarding.isCompleted()) {
    return of(true);
  }

  return fetchLogsLimitOne(http).pipe(
    take(1),
    map((logs) => {
      if (logs.length > 0) {
        onboarding.syncCompletedFromExistingLogs();
        return true;
      }
      if (onboarding.isSkipped()) {
        return true;
      }
      return router.parseUrl('/welcome');
    }),
    catchError(() => {
      /** Avoid blocking dashboard if probe fails (offline / 5xx). */
      return of(true);
    }),
  );
};
