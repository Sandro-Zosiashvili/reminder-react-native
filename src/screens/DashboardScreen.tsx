import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import PaymentCard from '../components/PaymentCard';
import StatCard from '../components/StatCard';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';
import { format, isToday, isTomorrow, differenceInDays } from 'date-fns';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function DashboardScreen() {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const { payments, loadPayments, getUpcomingPayments, getOverduePayments } = usePaymentStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPayments();
    setRefreshing(false);
  };

  const upcomingPayments = getUpcomingPayments();
  const overduePayments = getOverduePayments();
  const totalUpcoming = upcomingPayments.reduce((sum, p) => sum + p.amount, 0);
  const totalOverdue = overduePayments.reduce((sum, p) => sum + p.amount, 0);

  const getDateLabel = (date: Date): string => {
    if (isToday(date)) return 'Today';
    if (isTomorrow(date)) return 'Tomorrow';
    const days = differenceInDays(date, new Date());
    if (days <= 7) return `in ${days} days`;
    return format(date, 'MMM dd');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <View>
          <Text style={[styles.greeting, { color: theme.textSecondary }]}>Welcome back</Text>
          <Text style={[styles.title, { color: theme.text }]}>Payment Overview</Text>
        </View>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('AddPayment')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />
        }
      >
        <View style={styles.statsContainer}>
          <StatCard
            icon="wallet"
            label="Total Upcoming"
            value={`$${totalUpcoming.toFixed(2)}`}
            color={theme.info}
            backgroundColor={theme.info + '15'}
          />
          <StatCard
            icon="alert-circle"
            label="Overdue"
            value={`$${totalOverdue.toFixed(2)}`}
            color={theme.error}
            backgroundColor={theme.error + '15'}
          />
        </View>

        <View style={styles.statsContainer}>
          <StatCard
            icon="calendar"
            label="This Month"
            value={payments.filter(p => !p.isPaid).length.toString()}
            color={theme.primary}
            backgroundColor={theme.primary + '15'}
            subtitle="payments"
          />
          <StatCard
            icon="checkmark-circle"
            label="Paid"
            value={payments.filter(p => p.isPaid).length.toString()}
            color={theme.success}
            backgroundColor={theme.success + '15'}
            subtitle="payments"
          />
        </View>

        {overduePayments.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Overdue</Text>
              <View style={[styles.badge, { backgroundColor: theme.error + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.error }]}>
                  {overduePayments.length}
                </Text>
              </View>
            </View>
            {overduePayments.slice(0, 3).map((payment) => (
              <PaymentCard key={payment.id} payment={payment} onPress={() => {}} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Payments</Text>
            {upcomingPayments.length > 0 && (
              <View style={[styles.badge, { backgroundColor: theme.primary + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.primary }]}>
                  {upcomingPayments.length}
                </Text>
              </View>
            )}
          </View>

          {upcomingPayments.length === 0 ? (
            <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
              <Ionicons name="checkmark-done-circle-outline" size={64} color={theme.textTertiary} />
              <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
                No upcoming payments
              </Text>
              <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
                All caught up! Add a payment to get started.
              </Text>
            </View>
          ) : (
            upcomingPayments.slice(0, 5).map((payment) => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => navigation.navigate('EditPayment', { paymentId: payment.id })}
                dateLabel={getDateLabel(payment.dueDate)}
              />
            ))
          )}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZE.sm,
    marginBottom: 4,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginTop: SPACING.lg,
  },
  section: {
    marginTop: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  badge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
  },
  badgeText: {
    fontSize: FONT_SIZE.xs,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
  },
  emptyText: {
    fontSize: FONT_SIZE.lg,
    fontWeight: '600',
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
