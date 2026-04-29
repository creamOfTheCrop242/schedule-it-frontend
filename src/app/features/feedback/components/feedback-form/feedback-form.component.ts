import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { FeedbackService } from '../../services/feedback.service';

@Component({
  selector: 'app-feedback-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './feedback-form.component.html',
  styleUrl: './feedback-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeedbackFormComponent {
  private readonly feedbackService = inject(FeedbackService);

  readonly submittedOk = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly form = new FormGroup({
    message: new FormControl('', [
      Validators.required,
      Validators.maxLength(5000),
    ]),
  });

  onSubmit(): void {
    const msg = this.form.controls.message.value?.trim();
    if (!msg || this.form.invalid) {
      this.form.controls.message.markAsTouched();
      return;
    }

    this.submitError.set(null);
    this.feedbackService
      .submit(msg)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.submittedOk.set(true);
          this.form.reset();
        },
        error: () => {
          this.submitError.set('Could not send feedback. Please try again.');
        },
      });
  }
}
