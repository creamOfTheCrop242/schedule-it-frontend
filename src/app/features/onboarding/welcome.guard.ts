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
 * Keeps `/welcome` for users still in onboarding; everyone else goes home.
 */
export const welcomeGuard: CanActivateFn = (): Observable<boolean | UrlTree> => {
  const onboarding = inject(OnboardingStateService);
  const http = inject(HttpClient);
  const router = inject(Router);

  if (onboarding.shouldBypassWelcomeRoute()) {
    return of(router.parseUrl('/dashboard'));
  }

  return fetchLogsLimitOne(http).pipe(
    take(1),
    map((logs) => {
      if (logs.length > 0) {
        onboarding.syncCompletedFromExistingLogs();
        return router.parseUrl('/dashboard');
      }
      return true;
    }),
    catchError(() => {
      /** Fail open to welcome so new users still see onboarding when unsure. */
      return of(true);
    }),
  );
};
