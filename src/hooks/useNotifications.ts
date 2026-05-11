import { useEffect } from 'react';
import { useStore } from '../store/useStore';
import { getExpiryStatus, getDaysLeft } from '../utils/dateUtils';
import { toast } from 'sonner';

export const useNotifications = () => {
  const { items, user } = useStore();

  useEffect(() => {
    if (!user || items.length === 0) return;

    // Check for expired or expiring items and notify the user
    const expiringItems = items.filter(item => {
      const status = getExpiryStatus(item.expiry_date);
      return (status === 'expired' || status === 'expiring') && item.notifications_enabled;
    });

    if (expiringItems.length > 0) {
      const count = expiringItems.length;
      toast.warning(`You have ${count} item${count > 1 ? 's' : ''} that need attention!`, {
        description: 'Check your dashboard for details.',
        duration: 5000,
      });
    }

    // Request browser notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [items, user]);

  const sendLocalNotification = (title: string, body: string) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, { body });
    }
  };

  return { sendLocalNotification };
};
