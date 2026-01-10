import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsContainerComponent } from './goals-container.component';

describe('GoalsContainerComponent', () => {
  let component: GoalsContainerComponent;
  let fixture: ComponentFixture<GoalsContainerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalsContainerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
