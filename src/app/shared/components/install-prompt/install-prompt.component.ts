import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-install-prompt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="showInstallPrompt"
      class="fixed bottom-4 left-4 right-4 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
    >
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">Install ScheduleIt</h3>
          <p class="text-sm text-gray-600 mt-1">
            Add to home screen for a better experience
          </p>
        </div>
        <div class="flex gap-2">
          <button
            (click)="dismiss()"
            class="px-3 py-1 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Later
          </button>
          <button
            (click)="install()"
            class="px-4 py-1 bg-blue-500 text-white rounded font-medium hover:bg-blue-600 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [],
})
export class InstallPromptComponent implements OnInit, OnDestroy {
  showInstallPrompt = false;
  private deferredPrompt: any;
  private subscription: any;

  ngOnInit(): void {
    this.setupInstallPrompt();
  }

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private setupInstallPrompt(): void {
    // Listen for the beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.deferredPrompt = e;
      this.showInstallPrompt = true;
    });

    // Listen for successful installation
    window.addEventListener('appinstalled', () => {
      this.showInstallPrompt = false;
      this.deferredPrompt = null;
    });
  }

  async install(): Promise<void> {
    if (this.deferredPrompt) {
      this.deferredPrompt.prompt();
      const { outcome } = await this.deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        this.showInstallPrompt = false;
      }
      this.deferredPrompt = null;
    }
  }

  dismiss(): void {
    this.showInstallPrompt = false;
  }
}
