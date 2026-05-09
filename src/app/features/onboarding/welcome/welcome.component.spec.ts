import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { WelcomeComponent } from './welcome.component';
import { LogService } from '../../logs/services/log.service';
import { HabitsService } from '../../habits/services/habits.service';
import { OnboardingStateService } from '../onboarding-state.service';
import { of, throwError } from 'rxjs';

describe('WelcomeComponent', () => {
  let fixture: ComponentFixture<WelcomeComponent>;
  let logServiceMock: jasmine.SpyObj<LogService>;
  let onboardingMock: jasmine.SpyObj<OnboardingStateService>;

  beforeEach(async () => {
    logServiceMock = jasmine.createSpyObj('LogService', ['addLog']);
    onboardingMock = jasmine.createSpyObj('OnboardingStateService', [
      'markSkipped',
      'markCompleted',
    ]);

    const habitsMock = jasmine.createSpyObj('HabitsService', ['create']);
    habitsMock.habitsOptions = { reload: jasmine.createSpy('reload') };

    await TestBed.configureTestingModule({
      imports: [WelcomeComponent],
      providers: [
        provideRouter([]),
        { provide: LogService, useValue: logServiceMock },
        { provide: HabitsService, useValue: habitsMock },
        { provide: OnboardingStateService, useValue: onboardingMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(WelcomeComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('step 1 continue moves to step 2', () => {
    fixture.componentInstance.continueIntro();
    expect(fixture.componentInstance.step()).toBe(2);
  });

  it('submitFirstLog calls LogService.addLog and marks completed on success', () => {
    logServiceMock.addLog.and.returnValue(of({ id: '1', name: 'Test' } as never));

    fixture.componentInstance.step.set(2);
    fixture.componentInstance.form.patchValue({ name: 'My entry' });
    fixture.componentInstance.submitFirstLog();

    expect(logServiceMock.addLog).toHaveBeenCalledWith(
      jasmine.objectContaining({ name: 'My entry' }),
    );
    expect(onboardingMock.markCompleted).toHaveBeenCalled();
    expect(fixture.componentInstance.step()).toBe(3);
  });

  it('submitFirstLog shows error when API fails', () => {
    logServiceMock.addLog.and.returnValue(throwError(() => new Error('network')));

    fixture.componentInstance.step.set(2);
    fixture.componentInstance.form.patchValue({ name: 'X' });
    fixture.componentInstance.submitFirstLog();

    expect(fixture.componentInstance.submitError()).toContain('Could not save');
    expect(fixture.componentInstance.step()).toBe(2);
    expect(onboardingMock.markCompleted).not.toHaveBeenCalled();
  });
});
