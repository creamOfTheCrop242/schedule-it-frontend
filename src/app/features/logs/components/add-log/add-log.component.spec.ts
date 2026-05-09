import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { ResourceStatus } from '@angular/core';
import { of } from 'rxjs';

import { AddLogComponent } from './add-log.component';
import { LogService } from '../../services/log.service';
import { GoalsService } from '../../../goals/services/goals.service';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
import { HabitsService } from '../../../habits/services/habits.service';
import { PersonalGoalsService } from '../../../personal-goals/services/personal-goals.service';

describe('AddLogComponent', () => {
  let fixture: ComponentFixture<AddLogComponent>;
  let navigateSpy: jasmine.Spy;

  function setupWithQuery(quick: string | undefined) {
    const q = quick !== undefined ? { quick } : {};
    TestBed.configureTestingModule({
      imports: [AddLogComponent, RouterTestingModule.withRoutes([])],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({}),
              queryParamMap: convertToParamMap(q),
            },
            queryParamMap: of(convertToParamMap(q)),
            paramMap: of(convertToParamMap({})),
          },
        },
        {
          provide: LogService,
          useValue: jasmine.createSpyObj('LogService', [
            'addLog',
            'updateLog',
            'getLog',
            'reloadLogsList',
          ]),
        },
        {
          provide: GoalsService,
          useValue: jasmine.createSpyObj('GoalsService', ['reloadAllGoalStatus']),
        },
        {
          provide: CategoryOptionsService,
          useValue: {
            categoryOptions: {
              status: () => ResourceStatus.Loading,
              value: () => undefined,
              reload: jasmine.createSpy('categoryReload'),
            },
          },
        },
        {
          provide: HabitsService,
          useValue: {
            habitsOptions: {
              status: () => ResourceStatus.Loading,
              value: () => undefined,
              reload: jasmine.createSpy('habitsReload'),
            },
          },
        },
        {
          provide: PersonalGoalsService,
          useValue: {
            personalGoalsOptions: {
              status: () => ResourceStatus.Loading,
              value: () => undefined,
              reload: jasmine.createSpy('personalGoalsReload'),
            },
          },
        },
      ],
    });
    fixture = TestBed.createComponent(AddLogComponent);
    navigateSpy = spyOn(TestBed.inject(Router), 'navigate');
    fixture.detectChanges();
  }

  it('should create', () => {
    setupWithQuery(undefined);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('isQuickMode is true when quick=1 and not editing', () => {
    setupWithQuery('1');
    expect(fixture.componentInstance.isQuickMode()).toBe(true);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Quick log');
    expect(compiled.textContent).toContain('Use full log form');
  });

  it('isQuickMode is false without quick query', () => {
    setupWithQuery(undefined);
    expect(fixture.componentInstance.isQuickMode()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Add New Log');
  });

  it('navigateToFullAddLog clears quick query via router', () => {
    setupWithQuery('1');
    fixture.componentInstance.navigateToFullAddLog();
    expect(navigateSpy).toHaveBeenCalledWith(['/logs', 'add-log'], {
      queryParams: {},
      replaceUrl: true,
    });
  });
});
