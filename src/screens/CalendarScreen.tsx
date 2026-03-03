import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// @ts-ignore
import CalendarPicker from 'react-native-calendar-picker';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';
import { RootStackParamList } from '../navigation/AppNavigator';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';
import { format, isSameDay } from 'date-fns';
import { Payment } from '../types/payment';
import PaymentCard from '../components/PaymentCard';

type NavigationProp = StackNavigationProp<RootStackParamList>;

export default function CalendarScreen() {
  const { theme } = useThemeStore();
  const navigation = useNavigation<NavigationProp>();
  const { payments, loadPayments } = usePaymentStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadPayments();
  }, []);

  const getPaymentsForDate = (date: Date): Payment[] => {
    return payments.filter(p => isSameDay(p.dueDate, date));
  };

  const getMarkedDates = () => {
    const marked: any = {};

    payments.forEach(payment => {
      const dateStr = format(payment.dueDate, 'yyyy-MM-dd');
      if (!marked[dateStr]) {
        marked[dateStr] = {
          marked: true,
          dotColor: payment.isPaid ? theme.success : theme.error,
        };
      }
    });

    return marked;
  };

  const handleDateSelect = (date: any) => {
    const selectedDate = date.toDate();
    setSelectedDate(selectedDate);
    const paymentsForDate = getPaymentsForDate(selectedDate);
    if (paymentsForDate.length > 0) {
      setShowModal(true);
    }
  };

  const renderPaymentsModal = () => {
    if (!selectedDate) return null;
    const paymentsForDate = getPaymentsForDate(selectedDate);

    return (
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowModal(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
            <View style={styles.modalHandle} />

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: theme.text }]}>
                {format(selectedDate, 'MMMM dd, yyyy')}
              </Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={theme.textSecondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalPayments} showsVerticalScrollIndicator={false}>
              {paymentsForDate.map(payment => (
                <PaymentCard
                  key={payment.id}
                  payment={payment}
                  onPress={() => {
                    setShowModal(false);
                    navigation.navigate('EditPayment', { paymentId: payment.id });
                  }}
                />
              ))}
              <View style={{ height: SPACING.xxl }} />
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Payment Calendar</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Tap any date to see payments
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.calendarContainer, { backgroundColor: theme.surface }]}>
          <CalendarPicker
            onDateChange={handleDateSelect}
            selectedDayColor={theme.primary}
            selectedDayTextColor="#FFFFFF"
            todayBackgroundColor={theme.primary + '30'}
            todayTextStyle={{ color: theme.text }}
            textStyle={{ color: theme.text }}
            monthTitleStyle={{ color: theme.text, fontSize: FONT_SIZE.lg, fontWeight: 'bold' }}
            yearTitleStyle={{ color: theme.text, fontSize: FONT_SIZE.lg, fontWeight: 'bold' }}
            previousTitleStyle={{ color: theme.primary }}
            nextTitleStyle={{ color: theme.primary }}
            dayLabelsWrapper={{ borderTopWidth: 0, borderBottomWidth: 0 }}
            customDatesStyles={payments.map(p => ({
              date: p.dueDate,
              style: { backgroundColor: p.isPaid ? theme.success + '20' : theme.error + '20' },
              textStyle: { color: theme.text, fontWeight: 'bold' },
            }))}
          />
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.error }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Due</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.success }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Paid</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: theme.primary }]} />
            <Text style={[styles.legendText, { color: theme.textSecondary }]}>Today</Text>
          </View>
        </View>

        <View style={styles.upcomingSection}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>Upcoming Payments</Text>
          {payments
            .filter(p => !p.isPaid)
            .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())
            .slice(0, 5)
            .map(payment => (
              <PaymentCard
                key={payment.id}
                payment={payment}
                onPress={() => navigation.navigate('EditPayment', { paymentId: payment.id })}
                dateLabel={format(payment.dueDate, 'MMM dd')}
              />
            ))}
        </View>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      {renderPaymentsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xxl,
    paddingBottom: SPACING.lg,
  },
  title: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: FONT_SIZE.sm,
  },
  content: {
    flex: 1,
  },
  calendarContainer: {
    margin: SPACING.lg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: SPACING.lg,
    marginHorizontal: SPACING.lg,
    marginBottom: SPACING.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  legendText: {
    fontSize: FONT_SIZE.sm,
  },
  upcomingSection: {
    paddingHorizontal: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: '70%',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#C4C4C4',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: SPACING.sm,
    marginBottom: SPACING.md,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  modalTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  modalPayments: {
    paddingHorizontal: SPACING.lg,
  },
});
