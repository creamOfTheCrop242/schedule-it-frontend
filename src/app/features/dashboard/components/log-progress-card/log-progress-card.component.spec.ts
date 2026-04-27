import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpResourceRef } from '@angular/common/http';
import { ResourceStatus } from '@angular/core';

import { LogProgressCardComponent } from './log-progress-card.component';
import { GoalStatusResponse } from '../../../goals/models/goals.models';

describe('LogProgressCardComponent', () => {
  let component: LogProgressCardComponent;
  let fixture: ComponentFixture<LogProgressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogProgressCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogProgressCardComponent);
    component = fixture.componentInstance;
    const mockRef = {
      value: () => [] as GoalStatusResponse[],
      status: () => ResourceStatus.Resolved,
    } as unknown as HttpResourceRef<GoalStatusResponse[]>;
    fixture.componentRef.setInput('heading', 'Test heading');
    fixture.componentRef.setInput('goals', mockRef);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
