import { Injectable } from '@angular/core';

const STORAGE_KEY = 'gl_onboarding_v1';
const BANNER_DISMISS_KEY = 'gl_onboarding_banner_dismiss_v1';

function readStorage(key: string): string | null {
  if (typeof localStorage === 'undefined') {
    return null;
  }
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function writeStorage(key: string, value: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.setItem(key, value);
  } catch {
    /* ignore quota / privacy mode */
  }
}

function removeStorage(key: string): void {
  if (typeof localStorage === 'undefined') {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

@Injectable({
  providedIn: 'root',
})
export class OnboardingStateService {
  /** User finished quick-start or has created a log elsewhere. */
  markCompleted(): void {
    writeStorage(STORAGE_KEY, 'completed');
    removeStorage(BANNER_DISMISS_KEY);
  }

  markSkipped(): void {
    writeStorage(STORAGE_KEY, 'skipped');
  }

  /** Normalize local state when GET /logs shows at least one entry. */
  syncCompletedFromExistingLogs(): void {
    writeStorage(STORAGE_KEY, 'completed');
    removeStorage(BANNER_DISMISS_KEY);
  }

  isCompleted(): boolean {
    return readStorage(STORAGE_KEY) === 'completed';
  }

  isSkipped(): boolean {
    return readStorage(STORAGE_KEY) === 'skipped';
  }

  /** True when wizard should redirect away (dashboard) per storage only. */
  shouldBypassWelcomeRoute(): boolean {
    return this.isCompleted();
  }

  dismissFirstLogBanner(): void {
    writeStorage(BANNER_DISMISS_KEY, '1');
  }

  isFirstLogBannerDismissed(): boolean {
    return readStorage(BANNER_DISMISS_KEY) === '1';
  }
}
