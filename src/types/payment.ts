export interface Payment {
  id: string;
  title: string;
  amount: number;
  dueDate: Date;
  category: string;
  notes?: string;
  isRecurring: boolean;
  recurringInterval?: 'monthly' | 'yearly' | 'custom';
  customIntervalDays?: number;
  reminderDaysBefore: number[];
  isPaid: boolean;
  paidDate?: Date;
  notificationIds?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentHistory {
  paymentId: string;
  title: string;
  amount: number;
  paidDate: Date;
  category: string;
  originalDueDate: Date;
}

export interface MonthlyStats {
  month: string;
  totalPaid: number;
  totalDue: number;
  paymentsCount: number;
}

export type RecurringInterval = 'monthly' | 'yearly' | 'custom';

export interface NotificationSchedule {
  paymentId: string;
  notificationId: string;
  scheduledDate: Date;
  daysBefore: number;
}
