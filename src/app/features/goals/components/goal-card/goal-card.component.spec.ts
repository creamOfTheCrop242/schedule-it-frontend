import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GoalCardComponent } from './goal-card.component';

describe('GoalCardComponent', () => {
  let component: GoalCardComponent;
  let fixture: ComponentFixture<GoalCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalCardComponent],
      providers: [provideRouter([])],
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
