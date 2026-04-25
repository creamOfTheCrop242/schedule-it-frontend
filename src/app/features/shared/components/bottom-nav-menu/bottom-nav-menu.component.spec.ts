import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';

import { BottomNavMenuComponent } from './bottom-nav-menu.component';

describe('BottomNavMenuComponent', () => {
  let component: BottomNavMenuComponent;
  let fixture: ComponentFixture<BottomNavMenuComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomNavMenuComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomNavMenuComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should link to tasks list from fifth nav item', () => {
    const link = fixture.debugElement.query(By.css('a[aria-label="Tasks"]'));
    expect(link).toBeTruthy();
    expect(link.nativeElement.getAttribute('ng-reflect-router-link')).toBe(
      '/tasks',
    );
  });

  it('should open add choice modal when plus is clicked', () => {
    const btn = fixture.debugElement.query(
      By.css('button[aria-label="Add log or task"]'),
    );
    expect(btn).toBeTruthy();
    btn.nativeElement.click();
    fixture.detectChanges();

    const dialog = fixture.debugElement.query(By.css('[role="dialog"]'));
    expect(dialog).toBeTruthy();
    expect(component.addChoiceModalOpen()).toBe(true);
  });
});
