
class NotificationService {
  private audio: HTMLAudioElement | null = null;
  private isNotificationPermissionRequested = false;

  constructor() {
    this.initializeAudio();
    this.requestNotificationPermission();
  }

  private initializeAudio() {
    try {
      // Create a simple notification sound using Web Audio API
      this.audio = new Audio();
      // Use a data URL for a simple beep sound
      this.audio.src = "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQAoUXrTp66hVFApGn+DyvmYeBDaL1fPReS0FJHfH8N2QQ";
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }
  }

  private async requestNotificationPermission() {
    if ('Notification' in window && !this.isNotificationPermissionRequested) {
      this.isNotificationPermissionRequested = true;
      try {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
      } catch (error) {
        console.warn('Notification permission request failed:', error);
      }
    }
  }

  playNotificationSound() {
    try {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(error => {
          console.warn('Audio play failed:', error);
        });
      }
    } catch (error) {
      console.warn('Sound notification failed:', error);
    }
  }

  vibrate() {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]); // vibrate for 200ms, pause 100ms, vibrate 200ms
      }
    } catch (error) {
      console.warn('Vibration failed:', error);
    }
  }

  showNotification(title: string, message: string, senderName?: string) {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notification = new Notification(title, {
          body: message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'chat-message',
          requireInteraction: false,
          silent: false,
        });

        // Auto close after 5 seconds
        setTimeout(() => {
          notification.close();
        }, 5000);

        return notification;
      }
    } catch (error) {
      console.warn('Desktop notification failed:', error);
    }
    return null;
  }

  showMessageNotification(senderName: string, message: string, currentChatUserId?: string, messageSenderId?: string) {
    // Don't show notification if user is currently chatting with the sender
    if (currentChatUserId && currentChatUserId === messageSenderId) {
      return;
    }

    // Play sound and vibrate
    this.playNotificationSound();
    this.vibrate();

    // Show desktop notification
    const title = `New message from ${senderName}`;
    this.showNotification(title, message, senderName);
  }
}

export const notificationService = new NotificationService();
