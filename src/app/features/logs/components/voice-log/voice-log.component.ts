import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  OnDestroy,
  signal,
} from '@angular/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { take } from 'rxjs';
import { GoalsService } from '../../../goals/services/goals.service';
import { CategoryOptionsService } from '../../../shared/services/category-options.service';
import { HabitsService } from '../../../habits/services/habits.service';
import { PersonalGoalsService } from '../../../personal-goals/services/personal-goals.service';
import { MOOD_PRESETS } from '../../models/log.model';
import { LogService } from '../../services/log.service';

@Component({
  selector: 'app-voice-log',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './voice-log.component.html',
  styleUrl: './voice-log.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VoiceLogComponent implements OnDestroy {
  private readonly logService = inject(LogService);
  private readonly router = inject(Router);
  private readonly goalsService = inject(GoalsService);
  private readonly categoryOptionsService = inject(CategoryOptionsService);
  private readonly habitsService = inject(HabitsService);
  private readonly personalGoalsService = inject(PersonalGoalsService);

  readonly moodOptions = [...MOOD_PRESETS] as const;

  readonly recordPhase = signal<
    'idle' | 'recording' | 'uploading' | 'draft' | 'error'
  >('idle');
  readonly errorMessage = signal<string | null>(null);
  readonly transcriptPreview = signal<string | null>(null);

  readonly form = new FormGroup({
    name: new FormControl('', [Validators.required]),
    mood: new FormControl<string>('', [Validators.required]),
    description: new FormControl('', [Validators.required]),
  });

  private mediaStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: BlobPart[] = [];
  private recorderMimeType = 'audio/webm';

  ngOnDestroy(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {
        /* noop */
      }
    }
    this.stopMediaTracks();
    this.mediaRecorder = null;
  }

  async startRecording(): Promise<void> {
    this.errorMessage.set(null);
    if (!navigator.mediaDevices?.getUserMedia) {
      this.errorMessage.set(
        'Microphone recording is not supported in this browser.',
      );
      this.recordPhase.set('error');
      return;
    }

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      this.recordedChunks = [];
      const options: MediaRecorderOptions = {};
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options.mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        options.mimeType = 'audio/webm';
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options.mimeType = 'audio/mp4';
      }

      this.mediaRecorder = new MediaRecorder(this.mediaStream, options);
      this.recorderMimeType =
        this.mediaRecorder.mimeType &&
        MediaRecorder.isTypeSupported(this.mediaRecorder.mimeType)
          ? this.mediaRecorder.mimeType
          : 'audio/webm';

      this.mediaRecorder.ondataavailable = (ev: BlobEvent) => {
        if (ev.data.size > 0) {
          this.recordedChunks.push(ev.data);
        }
      };

      this.mediaRecorder.onstop = () => {
        this.stopMediaTracks();
        this.mediaRecorder = null;
        void this.finalizeRecording();
      };

      this.mediaRecorder.start();
      this.recordPhase.set('recording');
    } catch {
      this.errorMessage.set(
        'Could not access the microphone. Check permissions.',
      );
      this.recordPhase.set('error');
      this.stopMediaTracks();
    }
  }

  stopRecording(): void {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.recordPhase.set('uploading');
      this.mediaRecorder.stop();
      return;
    }
    this.stopMediaTracks();
    this.mediaRecorder = null;
    this.recordPhase.set('idle');
  }

  discardDraft(): void {
    this.recordPhase.set('idle');
    this.transcriptPreview.set(null);
    this.form.reset({ name: '', mood: '', description: '' });
  }

  onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.errorMessage.set(null);
    const v = this.form.getRawValue();
    this.logService
      .addLog({
        name: v.name!,
        mood: v.mood || undefined,
        description: v.description || undefined,
      })
      .pipe(take(1))
      .subscribe({
        next: () => this.handleSuccess(),
        error: () =>
          this.errorMessage.set('Failed to save log. Please try again.'),
      });
  }

  private async finalizeRecording(): Promise<void> {
    const blob = new Blob(this.recordedChunks, {
      type: this.recorderMimeType.split(';')[0] || this.recorderMimeType,
    });
    this.recordedChunks = [];

    if (blob.size < 500) {
      this.errorMessage.set('Recording was too short. Try again.');
      this.recordPhase.set('error');
      return;
    }

    const primary = blob.type.replace(/;.+$/, '') || 'audio/webm';
    const ext =
      primary.includes('webm')
        ? 'webm'
        : primary.includes('mp4')
          ? 'mp4'
          : primary.includes('mpeg')
            ? 'mp3'
            : primary.includes('ogg')
              ? 'ogg'
              : 'wav';
    const filename = `recording.${ext}`;

    this.logService.voiceDraft(blob, filename).pipe(take(1)).subscribe({
      next: (draft) => {
        const moodOk = (MOOD_PRESETS as readonly string[]).includes(
          draft.mood,
        );
        this.form.patchValue({
          name: draft.name,
          mood: moodOk ? draft.mood : 'Calm',
          description: draft.description || draft.transcript,
        });
        this.transcriptPreview.set(draft.transcript);
        this.recordPhase.set('draft');
      },
      error: (err: unknown) => {
        let msg = '';
        if (err instanceof HttpErrorResponse) {
          const body = err.error;
          if (typeof body === 'object' && body !== null && 'message' in body) {
            const m = (body as { message: unknown }).message;
            if (typeof m === 'string') {
              msg = m;
            } else if (Array.isArray(m) && typeof m[0] === 'string') {
              msg = m.join(' ');
            }
          } else if (typeof body === 'string') {
            msg = body;
          }
        }
        this.errorMessage.set(
          msg.trim() || 'Could not analyze the recording. Try again.',
        );
        this.recordPhase.set('error');
      },
    });
  }

  private handleSuccess(): void {
    void this.router.navigate(['/logs']);
    this.logService.reloadLogsList();
    this.goalsService.reloadAllGoalStatus();
    this.categoryOptionsService.categoryOptions.reload();
    this.habitsService.habitsOptions.reload();
    this.personalGoalsService.personalGoalsOptions.reload();
  }

  private stopMediaTracks(): void {
    if (this.mediaStream) {
      for (const t of this.mediaStream.getTracks()) {
        t.stop();
      }
      this.mediaStream = null;
    }
  }
}
