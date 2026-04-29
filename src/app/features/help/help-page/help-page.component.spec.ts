import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../auth/services/auth.service';
import { HelpPageComponent } from './help-page.component';

describe('HelpPageComponent', () => {
  let component: HelpPageComponent;
  let fixture: ComponentFixture<HelpPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HelpPageComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            authStatus: { value: signal(null) },
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HelpPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
