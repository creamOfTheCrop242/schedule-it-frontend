import { TestBed } from '@angular/core/testing';
import { GuardResult, provideRouter, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { welcomeGuard } from './welcome.guard';
import { OnboardingStateService } from './onboarding-state.service';
import { environment } from '../../../environments/environment';

describe('welcomeGuard', () => {
  const runGuard = (): Observable<GuardResult> =>
    TestBed.runInInjectionContext(() =>
      welcomeGuard({} as never, {} as never),
    ) as Observable<GuardResult>;

  let httpMock: HttpTestingController;
  let onboarding: OnboardingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    onboarding = TestBed.inject(OnboardingStateService);
    spyOn(onboarding, 'shouldBypassWelcomeRoute').and.returnValue(false);
    spyOn(onboarding, 'syncCompletedFromExistingLogs');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('redirects to dashboard when storage says onboarding completed', (done) => {
    (
      onboarding.shouldBypassWelcomeRoute as unknown as jasmine.Spy
    ).and.returnValue(true);

    runGuard().subscribe((r) => {
      const router = TestBed.inject(Router);
      expect(r instanceof UrlTree).toBe(true);
      expect(router.serializeUrl(r as UrlTree)).toContain('dashboard');
      done();
    });
  });

  it('redirects to dashboard when user already has logs', (done) => {
    runGuard().subscribe((r) => {
      const router = TestBed.inject(Router);
      expect(r instanceof UrlTree).toBe(true);
      expect(router.serializeUrl(r as UrlTree)).toContain('dashboard');
      expect(onboarding.syncCompletedFromExistingLogs).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url.startsWith(`${environment.baseUrl}/logs`) &&
        request.params.get('limit') === '1',
    );
    req.flush([{ id: '1', name: 'x' }]);
  });

  it('allows welcome when probe returns empty logs', (done) => {
    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      done();
    });

    const req = httpMock.expectOne((request) =>
      request.url.startsWith(`${environment.baseUrl}/logs`),
    );
    req.flush([]);
  });

  it('allows welcome when probe errors (fail open)', (done) => {
    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      done();
    });

    const req = httpMock.expectOne((request) =>
      request.url.startsWith(`${environment.baseUrl}/logs`),
    );
    req.error(new ProgressEvent('err'));
  });
});
