import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { Payment } from '../types/payment';
import { CATEGORIES, SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';
import { format, isToday, isTomorrow, isPast } from 'date-fns';

interface PaymentCardProps {
  payment: Payment;
  onPress: () => void;
  dateLabel?: string;
}

export default function PaymentCard({ payment, onPress, dateLabel }: PaymentCardProps) {
  const { theme } = useThemeStore();
  const category = CATEGORIES.find(c => c.id === payment.category);
  const isOverdue = isPast(payment.dueDate) && !payment.isPaid;

  const getStatusColor = () => {
    if (payment.isPaid) return theme.success;
    if (isOverdue) return theme.error;
    if (isToday(payment.dueDate)) return theme.warning;
    return theme.textSecondary;
  };

  const getStatusText = () => {
    if (payment.isPaid) return 'Paid';
    if (isOverdue) return 'Overdue';
    if (isToday(payment.dueDate)) return 'Due Today';
    if (isTomorrow(payment.dueDate)) return 'Due Tomorrow';
    return dateLabel || format(payment.dueDate, 'MMM dd');
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.surface,
          borderLeftColor: category?.color || theme.primary,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: category?.color + '20' || theme.primary + '20' },
          ]}
        >
          <Ionicons
            name={(category?.icon as any) || 'cash'}
            size={24}
            color={category?.color || theme.primary}
          />
        </View>

        <View style={styles.info}>
          <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>
            {payment.title}
          </Text>
          <View style={styles.meta}>
            <Text style={[styles.category, { color: category?.color || theme.primary }]}>
              {category?.name || 'Other'}
            </Text>
            {payment.isRecurring && (
              <>
                <Text style={[styles.dot, { color: theme.textTertiary }]}>•</Text>
                <Ionicons name="sync" size={12} color={theme.textTertiary} />
                <Text style={[styles.recurring, { color: theme.textTertiary }]}>
                  {payment.recurringInterval}
                </Text>
              </>
            )}
          </View>
        </View>
      </View>

      <View style={styles.right}>
        <Text style={[styles.amount, { color: theme.text }]}>
          ${payment.amount.toFixed(2)}
        </Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor() }]}>
            {getStatusText()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderLeftWidth: 4,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: 4,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  category: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
  dot: {
    fontSize: FONT_SIZE.xs,
  },
  recurring: {
    fontSize: FONT_SIZE.xs,
  },
  right: {
    alignItems: 'flex-end',
    gap: SPACING.xs,
  },
  amount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  statusText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
  },
});
