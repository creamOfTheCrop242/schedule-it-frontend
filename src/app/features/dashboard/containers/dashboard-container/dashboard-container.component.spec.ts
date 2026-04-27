import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { ResourceStatus } from '@angular/core';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { DashboardContainerComponent } from './dashboard-container.component';
import { HabitsService } from '../../../habits/services/habits.service';
import { GoalsService } from '../../../goals/services/goals.service';

describe('DashboardContainerComponent', () => {
  let component: DashboardContainerComponent;
  let fixture: ComponentFixture<DashboardContainerComponent>;

  beforeEach(async () => {
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

    fixture = TestBed.createComponent(DashboardContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
