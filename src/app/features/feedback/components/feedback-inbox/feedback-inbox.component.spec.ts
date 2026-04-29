import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { FeedbackService } from '../../services/feedback.service';
import { FeedbackInboxComponent } from './feedback-inbox.component';

describe('FeedbackInboxComponent', () => {
  let component: FeedbackInboxComponent;
  let fixture: ComponentFixture<FeedbackInboxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeedbackInboxComponent],
      providers: [
        provideRouter([]),
        {
          provide: FeedbackService,
          useValue: {
            listForAdmin: () => of([]),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FeedbackInboxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set forbidden on 403', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [FeedbackInboxComponent],
      providers: [
        provideRouter([]),
        {
          provide: FeedbackService,
          useValue: {
            listForAdmin: () =>
              throwError(
                () =>
                  new HttpErrorResponse({
                    status: 403,
                    statusText: 'Forbidden',
                  }),
              ),
          },
        },
      ],
    }).compileComponents();

    const f = TestBed.createComponent(FeedbackInboxComponent);
    f.detectChanges();
    await f.whenStable();
    expect(f.componentInstance.forbidden()).toBe(true);
  });
});
