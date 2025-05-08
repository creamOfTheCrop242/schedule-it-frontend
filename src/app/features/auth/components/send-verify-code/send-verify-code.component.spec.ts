import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SendVerifyCodeComponent } from './send-verify-code.component';

describe('SendVerifyCodeComponent', () => {
  let component: SendVerifyCodeComponent;
  let fixture: ComponentFixture<SendVerifyCodeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SendVerifyCodeComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SendVerifyCodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
