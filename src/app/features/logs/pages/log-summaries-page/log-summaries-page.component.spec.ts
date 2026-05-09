import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LogSummariesPageComponent } from './log-summaries-page.component';

describe('LogSummariesPageComponent', () => {
  let component: LogSummariesPageComponent;
  let fixture: ComponentFixture<LogSummariesPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LogSummariesPageComponent, HttpClientTestingModule],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LogSummariesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
