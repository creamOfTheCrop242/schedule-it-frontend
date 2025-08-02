import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PwaService } from '../../../services/pwa.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-update-notification',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div
      *ngIf="updateAvailable"
      class="fixed top-4 right-4 bg-blue-500 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm"
    >
      <div class="flex items-center justify-between">
        <div>
          <h3 class="font-semibold">Update Available</h3>
          <p class="text-sm opacity-90">
            A new version of the app is available.
          </p>
        </div>
        <button
          (click)="updateApp()"
          class="ml-4 px-3 py-1 bg-white text-blue-500 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
        >
          Update
        </button>
      </div>
    </div>
  `,
  styles: [],
})
export class UpdateNotificationComponent implements OnInit, OnDestroy {
  updateAvailable = false;
  private subscription: Subscription | undefined;

  constructor(private pwaService: PwaService) {}

  ngOnInit(): void {
    this.subscription = this.pwaService.updateAvailable$.subscribe(
      (available) => (this.updateAvailable = available)
    );
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  async updateApp(): Promise<void> {
    await this.pwaService.updateApp();
  }
}
