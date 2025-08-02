import { Injectable } from '@angular/core';
import { SwUpdate } from '@angular/service-worker';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PwaService {
  private updateAvailable = new BehaviorSubject<boolean>(false);
  updateAvailable$ = this.updateAvailable.asObservable();

  constructor(private swUpdate: SwUpdate) {
    this.initializePWA();
  }

  private async initializePWA(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      // Check for updates
      this.swUpdate.versionUpdates.subscribe((event) => {
        if (event.type === 'VERSION_READY') {
          this.updateAvailable.next(true);
        }
      });

      // Check for updates on app start
      try {
        await this.swUpdate.checkForUpdate();
      } catch (error) {
        console.log('Failed to check for updates:', error);
      }
    }
  }

  async updateApp(): Promise<void> {
    if (this.swUpdate.isEnabled) {
      try {
        await this.swUpdate.activateUpdate();
        window.location.reload();
      } catch (error) {
        console.log('Failed to activate update:', error);
      }
    }
  }

  async requestNotificationPermission(): Promise<NotificationPermission> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  showNotification(title: string, options?: NotificationOptions): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}
