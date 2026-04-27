import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';
import { GoalScope } from '../../../goals/models/goals.models';
import { HabitDetailComponent } from './habit-detail.component';
import { HabitsService } from '../../services/habits.service';

describe('HabitDetailComponent', () => {
  let component: HabitDetailComponent;
  let fixture: ComponentFixture<HabitDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HabitDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'habit-id-1' })),
          },
        },
        {
          provide: HabitsService,
          useValue: {
            getHabit: () =>
              of({
                id: 'habit-id-1',
                name: 'Test habit',
                description: null,
                cadence: GoalScope.DAY,
                targetPerPeriod: 1,
                logCount: 0,
                currentStreak: 0,
                longestStreak: 0,
              }),
            habitsOptions: { reload: (): void => undefined },
            deleteHabit: () => of(undefined),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HabitDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load habit from service', () => {
    fixture.detectChanges();
    expect(component.loadError()).toBe(false);
    expect(component.habit()?.name).toBe('Test habit');
  });
});
