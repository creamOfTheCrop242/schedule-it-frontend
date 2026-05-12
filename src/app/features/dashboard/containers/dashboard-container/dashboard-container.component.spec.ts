import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ResourceStatus } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardContainerComponent } from './dashboard-container.component';
import { HabitsService } from '../../../habits/services/habits.service';
import { GoalsService } from '../../../goals/services/goals.service';

describe('DashboardContainerComponent', () => {
  async function configure(): Promise<void> {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [DashboardContainerComponent],
      providers: [
        provideRouter([]),
        { provide: HttpClient, useValue: { get: () => of([]) } },
        {
          provide: HabitsService,
          useValue: {
            habitsOptions: {
              reload: (): void => undefined,
              status: () => ResourceStatus.Resolved,
              value: () => [],
            },
          },
        },
        {
          provide: GoalsService,
          useValue: {
            logsGoalStatus: {
              value: () => [],
              status: () => ResourceStatus.Resolved,
            },
            reloadAllGoalStatus: (): void => undefined,
          },
        },
      ],
    }).compileComponents();
  }

  describe('default onboarding', () => {
    let fixture: ComponentFixture<DashboardContainerComponent>;
    let component: DashboardContainerComponent;

    beforeEach(async () => {
      await configure();
      localStorage.removeItem('gl_onboarding_v1');
      localStorage.removeItem('gl_onboarding_banner_dismiss_v1');
      fixture = TestBed.createComponent(DashboardContainerComponent);
      component = fixture.componentInstance;
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('should create', () => {
      expect(component).toBeTruthy();
    });

    it('when recent logs empty, links Quick log and full add with quick=1 on quick paths', () => {
      const root = fixture.nativeElement as HTMLElement;
      const recent = root.querySelector('[aria-label="Recent logs"]');
      expect(recent?.textContent).toContain('Quick log');
      expect(recent?.textContent).toContain('Full add');
      const quickInRecent = recent?.querySelectorAll('a[href*="quick=1"]');
      expect(quickInRecent?.length).toBe(1);

      const quickActions = root.querySelector('[aria-label="Quick actions"]');
      expect(quickActions?.textContent).toContain('Quick log');
      const quickInActions = quickActions?.querySelectorAll('a[href*="quick=1"]');
      expect(quickInActions?.length).toBe(1);
    });
  });

  describe('skipped onboarding with no logs', () => {
    let fixture: ComponentFixture<DashboardContainerComponent>;

    beforeEach(async () => {
      await configure();
      localStorage.setItem('gl_onboarding_v1', 'skipped');
      localStorage.removeItem('gl_onboarding_banner_dismiss_v1');
      fixture = TestBed.createComponent(DashboardContainerComponent);
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
    });

    it('shows first-log banner with Quick log link using quick=1', () => {
      const root = fixture.nativeElement as HTMLElement;
      const banner = root.querySelector('[role="status"][aria-live="polite"]');
      expect(banner?.textContent).toContain('Quick log');
      const quick = banner?.querySelector('a[href*="quick=1"]');
      expect(quick?.textContent?.trim()).toBe('Quick log');
    });
  });
});
