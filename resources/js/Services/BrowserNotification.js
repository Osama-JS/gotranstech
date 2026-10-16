/**
 * Web Browser Push / Native Desktop Notifications Service
 */

class BrowserNotificationService {
    isSupported() {
        return typeof window !== 'undefined' && 'Notification' in window;
    }

    getPermission() {
        if (!this.isSupported()) return 'unsupported';
        return Notification.permission;
    }

    async requestPermission() {
        if (!this.isSupported()) return 'unsupported';
        try {
            const permission = await Notification.requestPermission();
            return permission;
        } catch (error) {
            console.error('Failed to request notification permission:', error);
            return 'denied';
        }
    }

    /**
     * Show native desktop browser notification
     */
    show({ title, body, icon = '/favicon.ico', url = null, tag = null }) {
        if (!this.isSupported()) return null;
        if (Notification.permission !== 'granted') return null;

        try {
            const options = {
                body: body || '',
                icon: icon,
                badge: icon,
                dir: 'rtl',
                lang: 'ar',
                tag: tag || `gotranstech-${Date.now()}`,
                renotify: true,
            };

            const notification = new Notification(title || 'إشعار جديد من منصة جو تيك', options);

            notification.onclick = (event) => {
                event.preventDefault();
                window.focus();
                if (url) {
                    window.location.href = url;
                }
                notification.close();
            };

            return notification;
        } catch (error) {
            console.error('Failed to create browser notification:', error);
            return null;
        }
    }
}

export const browserNotification = new BrowserNotificationService();
export default browserNotification;
