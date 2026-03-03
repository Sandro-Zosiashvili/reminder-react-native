import { create } from 'zustand';
import { Payment, PaymentHistory } from '../types/payment';
import { StorageService } from '../services/StorageService';
import { NotificationService } from '../services/NotificationService';
import { addMonths, addYears, addDays, isAfter, isBefore, startOfDay } from 'date-fns';

interface PaymentState {
  payments: Payment[];
  history: PaymentHistory[];
  isLoading: boolean;
  loadPayments: () => Promise<void>;
  addPayment: (payment: Omit<Payment, 'id' | 'createdAt' | 'updatedAt' | 'notificationIds'>) => Promise<void>;
  updatePayment: (id: string, payment: Partial<Payment>) => Promise<void>;
  deletePayment: (id: string) => Promise<void>;
  markAsPaid: (id: string) => Promise<void>;
  getUpcomingPayments: () => Payment[];
  getOverduePayments: () => Payment[];
  getPaymentsByCategory: (category: string) => Payment[];
  searchPayments: (query: string) => Payment[];
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  payments: [],
  history: [],
  isLoading: false,

  loadPayments: async () => {
    set({ isLoading: true });
    try {
      const paymentsData = await StorageService.getItem('payments');
      const historyData = await StorageService.getItem('paymentHistory');
      
      const payments = paymentsData ? JSON.parse(paymentsData).map((p: any) => ({
        ...p,
        dueDate: new Date(p.dueDate),
        paidDate: p.paidDate ? new Date(p.paidDate) : undefined,
        createdAt: new Date(p.createdAt),
        updatedAt: new Date(p.updatedAt),
      })) : [];

      const history = historyData ? JSON.parse(historyData).map((h: any) => ({
        ...h,
        paidDate: new Date(h.paidDate),
        originalDueDate: new Date(h.originalDueDate),
      })) : [];
      
      set({ payments, history, isLoading: false });
    } catch (error) {
      console.error('Error loading payments:', error);
      set({ isLoading: false });
    }
  },

  addPayment: async (paymentData) => {
    const newPayment: Payment = {
      ...paymentData,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      notificationIds: [],
    };

    // Schedule notifications
    const notificationIds = await NotificationService.schedulePaymentNotifications(newPayment);
    newPayment.notificationIds = notificationIds;

    const payments = [...get().payments, newPayment];
    set({ payments });
    
    await StorageService.setItem('payments', JSON.stringify(payments));
  },

  updatePayment: async (id, paymentData) => {
    const payments = get().payments.map(p => 
      p.id === id 
        ? { ...p, ...paymentData, updatedAt: new Date() }
        : p
    );

    // Reschedule notifications for updated payment
    const updatedPayment = payments.find(p => p.id === id);
    if (updatedPayment) {
      // Cancel old notifications
      if (updatedPayment.notificationIds) {
        await NotificationService.cancelNotifications(updatedPayment.notificationIds);
      }
      
      // Schedule new notifications
      const notificationIds = await NotificationService.schedulePaymentNotifications(updatedPayment);
      updatedPayment.notificationIds = notificationIds;
    }

    set({ payments });
    await StorageService.setItem('payments', JSON.stringify(payments));
  },

  deletePayment: async (id) => {
    const payment = get().payments.find(p => p.id === id);
    
    // Cancel notifications
    if (payment?.notificationIds) {
      await NotificationService.cancelNotifications(payment.notificationIds);
    }

    const payments = get().payments.filter(p => p.id !== id);
    set({ payments });
    
    await StorageService.setItem('payments', JSON.stringify(payments));
  },

  markAsPaid: async (id) => {
    const payment = get().payments.find(p => p.id === id);
    if (!payment) return;

    // Add to history
    const historyEntry: PaymentHistory = {
      paymentId: payment.id,
      title: payment.title,
      amount: payment.amount,
      paidDate: new Date(),
      category: payment.category,
      originalDueDate: payment.dueDate,
    };

    const history = [...get().history, historyEntry];

    // If recurring, create next payment
    if (payment.isRecurring) {
      let nextDueDate: Date;
      
      switch (payment.recurringInterval) {
        case 'monthly':
          nextDueDate = addMonths(payment.dueDate, 1);
          break;
        case 'yearly':
          nextDueDate = addYears(payment.dueDate, 1);
          break;
        case 'custom':
          nextDueDate = addDays(payment.dueDate, payment.customIntervalDays || 30);
          break;
        default:
          nextDueDate = addMonths(payment.dueDate, 1);
      }

      const nextPayment: Payment = {
        ...payment,
        id: Date.now().toString(),
        dueDate: nextDueDate,
        isPaid: false,
        paidDate: undefined,
        notificationIds: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Schedule notifications for next payment
      const notificationIds = await NotificationService.schedulePaymentNotifications(nextPayment);
      nextPayment.notificationIds = notificationIds;

      // Cancel old notifications
      if (payment.notificationIds) {
        await NotificationService.cancelNotifications(payment.notificationIds);
      }

      const payments = get().payments.map(p => 
        p.id === id ? nextPayment : p
      );

      set({ payments, history });
      await StorageService.setItem('payments', JSON.stringify(payments));
      await StorageService.setItem('paymentHistory', JSON.stringify(history));
    } else {
      // Non-recurring: just mark as paid
      const payments = get().payments.map(p =>
        p.id === id ? { ...p, isPaid: true, paidDate: new Date() } : p
      );

      // Cancel notifications
      if (payment.notificationIds) {
        await NotificationService.cancelNotifications(payment.notificationIds);
      }

      set({ payments, history });
      await StorageService.setItem('payments', JSON.stringify(payments));
      await StorageService.setItem('paymentHistory', JSON.stringify(history));
    }
  },

  getUpcomingPayments: () => {
    const now = startOfDay(new Date());
    return get().payments
      .filter(p => !p.isPaid && isAfter(p.dueDate, now))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },

  getOverduePayments: () => {
    const now = startOfDay(new Date());
    return get().payments
      .filter(p => !p.isPaid && isBefore(p.dueDate, now))
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  },

  getPaymentsByCategory: (category: string) => {
    return get().payments.filter(p => p.category === category);
  },

  searchPayments: (query: string) => {
    const lowerQuery = query.toLowerCase();
    return get().payments.filter(p => 
      p.title.toLowerCase().includes(lowerQuery) ||
      p.category.toLowerCase().includes(lowerQuery) ||
      p.notes?.toLowerCase().includes(lowerQuery)
    );
  },
}));
