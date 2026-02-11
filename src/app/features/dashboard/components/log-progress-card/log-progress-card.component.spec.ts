import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LogProgressCardComponent } from './log-progress-card.component';

describe('LogProgressCardComponent', () => {
  let component: LogProgressCardComponent;
  let fixture: ComponentFixture<LogProgressCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogProgressCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LogProgressCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
