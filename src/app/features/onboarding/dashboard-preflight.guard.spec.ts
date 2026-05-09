import { TestBed } from '@angular/core/testing';
import { GuardResult, provideRouter, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { dashboardPreflightGuard } from './dashboard-preflight.guard';
import { OnboardingStateService } from './onboarding-state.service';
import { environment } from '../../../environments/environment';

describe('dashboardPreflightGuard', () => {
  const runGuard = (): Observable<GuardResult> =>
    TestBed.runInInjectionContext(() =>
      dashboardPreflightGuard({} as never, {} as never),
    ) as Observable<GuardResult>;

  let httpMock: HttpTestingController;
  let onboarding: OnboardingStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    httpMock = TestBed.inject(HttpTestingController);
    onboarding = TestBed.inject(OnboardingStateService);
    spyOn(onboarding, 'isCompleted').and.returnValue(false);
    spyOn(onboarding, 'isSkipped').and.returnValue(false);
    spyOn(onboarding, 'syncCompletedFromExistingLogs');
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('allows navigation when onboarding already completed in storage', (done) => {
    (
      onboarding.isCompleted as unknown as jasmine.Spy
    ).and.returnValue(true);

    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      done();
    });
  });

  it('allows navigation when onboarding skipped and logs still empty', (done) => {
    (
      onboarding.isSkipped as unknown as jasmine.Spy
    ).and.returnValue(true);

    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      done();
    });

    const req = httpMock.expectOne(
      (request) => request.url.startsWith(`${environment.baseUrl}/logs`),
    );
    req.flush([]);
  });

  it('redirects to welcome when logs array is empty', (done) => {
    runGuard().subscribe((r) => {
      const router = TestBed.inject(Router);
      expect(r instanceof UrlTree).toBe(true);
      expect(router.serializeUrl(r as UrlTree)).toContain('welcome');
      done();
    });

    const req = httpMock.expectOne(
      (req) =>
        req.url.startsWith(`${environment.baseUrl}/logs`) &&
        req.params.get('limit') === '1',
    );
    req.flush([]);
  });

  it('allows navigation and syncs when user already has logs', (done) => {
    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      expect(onboarding.syncCompletedFromExistingLogs).toHaveBeenCalled();
      done();
    });

    const req = httpMock.expectOne(
      (request) =>
        request.url.startsWith(`${environment.baseUrl}/logs`) &&
        request.params.get('limit') === '1',
    );
    req.flush([{ id: '1', name: 'foo' }]);
  });

  it('allows navigation when logs probe fails (fail open)', (done) => {
    runGuard().subscribe((r) => {
      expect(r).toBe(true);
      done();
    });

    const req = httpMock.expectOne(
      (request) => request.url.startsWith(`${environment.baseUrl}/logs`),
    );
    req.error(new ProgressEvent('err'));
  });
});
