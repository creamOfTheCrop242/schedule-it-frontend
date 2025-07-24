import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomNavMenuComponent } from './bottom-nav-menu.component';

describe('BottomNavMenuComponent', () => {
  let component: BottomNavMenuComponent;
  let fixture: ComponentFixture<BottomNavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavMenuComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
