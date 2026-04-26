import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { of } from 'rxjs';

import { LogService } from '../../../logs/services/log.service';
import { TaskDetailComponent } from './task-detail.component';
import { TasksService } from '../../services/tasks.service';

describe('TaskDetailComponent', () => {
  let component: TaskDetailComponent;
  let fixture: ComponentFixture<TaskDetailComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskDetailComponent],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: 'task-id-1' })),
          },
        },
        {
          provide: LogService,
          useValue: {
            reloadLogsList: (): void => undefined,
          },
        },
        {
          provide: TasksService,
          useValue: {
            getTask: () =>
              of({
                id: 'task-id-1',
                title: 'Test task',
                description: null,
                completedDate: null,
                createdAt: '2026-01-01T00:00:00.000Z',
                updatedAt: '2026-01-01T00:00:00.000Z',
              }),
            allTasks: { reload: (): void => undefined },
            deleteTask: () => of(undefined),
            completeTask: () => of({}),
            reopenTask: () => of({}),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskDetailComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load task from service', () => {
    fixture.detectChanges();
    expect(component.loadError()).toBe(false);
    expect(component.task()?.title).toBe('Test task');
  });
});
