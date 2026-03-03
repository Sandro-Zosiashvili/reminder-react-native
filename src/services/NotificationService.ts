import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { Payment } from '../types/payment';
import { subDays, isBefore, startOfDay } from 'date-fns';
import { StorageService } from './StorageService';

// Configure notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export class NotificationService {
  /**
   * Initialize notification service and request permissions
   */
  static async initialize(): Promise<boolean> {
    if (!Device.isDevice) {
      console.log('Notifications only work on physical devices');
      return false;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permission not granted');
        return false;
      }

      // Configure notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('payment-reminders', {
          name: 'Payment Reminders',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#5B63D3',
          sound: 'default',
        });
      }

      return true;
    } catch (error) {
      console.error('Error initializing notifications:', error);
      return false;
    }
  }

  /**
   * Schedule all notifications for a payment
   * Returns array of notification IDs
   */
  static async schedulePaymentNotifications(payment: Payment): Promise<string[]> {
    const notificationIds: string[] = [];
    
    if (payment.isPaid) {
      return notificationIds;
    }

    const now = new Date();
    const dueDate = startOfDay(payment.dueDate);

    // Schedule notifications based on reminderDaysBefore array
    for (const daysBefore of payment.reminderDaysBefore) {
      const notificationDate = subDays(dueDate, daysBefore);
      
      // Only schedule if notification date is in the future
      if (isBefore(now, notificationDate)) {
        try {
          const id = await this.scheduleNotification(
            payment.title,
            `Payment of $${payment.amount.toFixed(2)} due in ${daysBefore} day${daysBefore === 1 ? '' : 's'}`,
            notificationDate,
            {
              paymentId: payment.id,
              daysBefore,
              type: 'reminder',
            }
          );
          notificationIds.push(id);
        } catch (error) {
          console.error('Error scheduling reminder notification:', error);
        }
      }
    }

    // Always schedule notification on due date if it's in the future
    if (isBefore(now, dueDate)) {
      try {
        const id = await this.scheduleNotification(
          `Payment Due Today: ${payment.title}`,
          `Don't forget to pay $${payment.amount.toFixed(2)} today!`,
          dueDate,
          {
            paymentId: payment.id,
            daysBefore: 0,
            type: 'due',
          }
        );
        notificationIds.push(id);
      } catch (error) {
        console.error('Error scheduling due date notification:', error);
      }
    }

    return notificationIds;
  }

  /**
   * Schedule a single notification
   */
  private static async scheduleNotification(
    title: string,
    body: string,
    date: Date,
    data: any
  ): Promise<string> {
    const trigger = {
      date,
      channelId: Platform.OS === 'android' ? 'payment-reminders' : undefined,
    };

    const id = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.MAX,
        badge: 1,
      },
      trigger,
    });

    return id;
  }

  /**
   * Cancel specific notifications
   */
  static async cancelNotifications(notificationIds: string[]): Promise<void> {
    try {
      for (const id of notificationIds) {
        await Notifications.cancelScheduledNotificationAsync(id);
      }
    } catch (error) {
      console.error('Error canceling notifications:', error);
    }
  }

  /**
   * Cancel all scheduled notifications
   */
  static async cancelAllNotifications(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error canceling all notifications:', error);
    }
  }

  /**
   * Get all scheduled notifications
   */
  static async getAllScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Error getting scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Reschedule all notifications (useful after app restart)
   */
  static async rescheduleAllNotifications(): Promise<void> {
    try {
      // This would typically be called with payments from storage
      // Implementation would load payments and reschedule
      const paymentsData = await StorageService.getItem('payments');
      if (!paymentsData) return;

      const payments: Payment[] = JSON.parse(paymentsData).map((p: any) => ({
        ...p,
        dueDate: new Date(p.dueDate),
        paidDate: p.paidDate ? new Date(p.paidDate) : undefined,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      }));

      // Cancel all existing notifications
      await this.cancelAllNotifications();

      // Reschedule for each active payment
      for (const payment of payments) {
        if (!payment.isPaid) {
          await this.schedulePaymentNotifications(payment);
        }
      }
    } catch (error) {
      console.error('Error rescheduling notifications:', error);
    }
  }

  /**
   * Send immediate notification (for testing)
   */
  static async sendImmediateNotification(title: string, body: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: true,
        },
        trigger: null, // null means immediate
      });
    } catch (error) {
      console.error('Error sending immediate notification:', error);
    }
  }
}
