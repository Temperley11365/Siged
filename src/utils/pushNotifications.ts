/**
 * Web Push Notification Utility for SIGED Misiones
 * Handles Native Browser Push Notifications, Audio Chimes, and Fallbacks
 */

export interface PushNotificationData {
  id?: string;
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: any;
  onClickUrl?: string;
}

export function isPushNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

export function getPushPermissionStatus(): NotificationPermission | 'unsupported' {
  if (!isPushNotificationSupported()) return 'unsupported';
  return Notification.permission;
}

export async function requestPushPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) return 'denied';
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (err) {
    console.warn('Error solicitando permisos de notificación push:', err);
    return 'denied';
  }
}

/**
 * Plays a discrete, professional dual-tone audio chime using Web Audio API
 */
export function playNotificationChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const now = ctx.currentTime;
    
    // First tone (E5 = 659.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(659.25, now);
    gain1.gain.setValueAtTime(0.12, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.3);

    // Second tone (B5 = 987.77Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(987.77, now + 0.12);
    gain2.gain.setValueAtTime(0.15, now + 0.12);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.12);
    osc2.stop(now + 0.45);
  } catch (e) {
    // Web audio might be muted or not permitted until user interaction
  }
}

/**
 * Sends a native browser push notification
 */
export function sendBrowserPushNotification(
  options: PushNotificationData,
  onNotificationClick?: (data?: any) => void
): boolean {
  playNotificationChime();

  if (!isPushNotificationSupported()) {
    console.log('Notificaciones Push no soportadas en este navegador.');
    return false;
  }

  if (Notification.permission === 'granted') {
    try {
      const notif = new Notification(options.title, {
        body: options.body,
        icon: options.icon || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=128&auto=format&fit=crop&q=80',
        tag: options.tag || `siged-push-${Date.now()}`,
        data: options.data,
      });

      notif.onclick = (event) => {
        event.preventDefault();
        window.focus();
        if (onNotificationClick) {
          onNotificationClick(options.data);
        }
        notif.close();
      };
      return true;
    } catch (err) {
      console.error('Error enviando notificación push:', err);
      return false;
    }
  } else {
    console.log('Permiso de notificación push no otorgado:', Notification.permission);
    return false;
  }
}
