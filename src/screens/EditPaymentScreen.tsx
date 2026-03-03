import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';
import { CATEGORIES } from '../theme/theme';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';
import { RecurringInterval } from '../types/payment';
import { RootStackParamList } from '../navigation/AppNavigator';
import { format } from 'date-fns';

type EditPaymentRouteProp = RouteProp<RootStackParamList, 'EditPayment'>;

export default function EditPaymentScreen() {
  const { theme } = useThemeStore();
  const navigation = useNavigation();
  const route = useRoute<EditPaymentRouteProp>();
  const { payments, updatePayment, deletePayment, markAsPaid } = usePaymentStore();

  const payment = payments.find(p => p.id === route.params.paymentId);

  const [title, setTitle] = useState(payment?.title || '');
  const [amount, setAmount] = useState(payment?.amount.toString() || '');
  const [dueDate, setDueDate] = useState(payment?.dueDate || new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [category, setCategory] = useState(payment?.category || 'utilities');
  const [notes, setNotes] = useState(payment?.notes || '');
  const [isRecurring, setIsRecurring] = useState(payment?.isRecurring || false);
  const [recurringInterval, setRecurringInterval] = useState<RecurringInterval>(
    payment?.recurringInterval || 'monthly'
  );
  const [customIntervalDays, setCustomIntervalDays] = useState(
    payment?.customIntervalDays?.toString() || '30'
  );
  const [reminderDays, setReminderDays] = useState<number[]>(payment?.reminderDaysBefore || [1, 3]);

  if (!payment) {
    return (
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <Text style={[styles.errorText, { color: theme.text }]}>Payment not found</Text>
      </View>
    );
  }

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a title');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    try {
      await updatePayment(payment.id, {
        title: title.trim(),
        amount: parseFloat(amount),
        dueDate,
        category,
        notes: notes.trim(),
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,
        customIntervalDays: recurringInterval === 'custom' ? parseInt(customIntervalDays) : undefined,
        reminderDaysBefore: reminderDays,
      });

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to update payment');
    }
  };

  const handleDelete = () => {
    Alert.alert('Delete Payment', 'Are you sure you want to delete this payment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deletePayment(payment.id);
          navigation.goBack();
        },
      },
    ]);
  };

  const handleMarkAsPaid = async () => {
    await markAsPaid(payment.id);
    navigation.goBack();
  };

  const toggleReminderDay = (day: number) => {
    if (reminderDays.includes(day)) {
      setReminderDays(reminderDays.filter(d => d !== day));
    } else {
      setReminderDays([...reminderDays, day].sort((a, b) => a - b));
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!payment.isPaid && (
          <TouchableOpacity
            style={[styles.paidButton, { backgroundColor: theme.success }]}
            onPress={handleMarkAsPaid}
          >
            <Ionicons name="checkmark-circle" size={24} color="#FFFFFF" />
            <Text style={styles.paidButtonText}>Mark as Paid</Text>
          </TouchableOpacity>
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Title</Text>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g., Electricity Bill"
            placeholderTextColor={theme.textTertiary}
          />
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Amount</Text>
          <TextInput
            style={[styles.input, { color: theme.text }]}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor={theme.textTertiary}
            keyboardType="decimal-pad"
          />
        </View>

        <TouchableOpacity
          style={[styles.inputContainer, { backgroundColor: theme.surface }]}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={[styles.label, { color: theme.textSecondary }]}>Due Date</Text>
          <View style={styles.dateRow}>
            <Text style={[styles.dateText, { color: theme.text }]}>
              {format(dueDate, 'MMMM dd, yyyy')}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={theme.primary} />
          </View>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={(event, selectedDate) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selectedDate) {
                setDueDate(selectedDate);
              }
            }}
          />
        )}

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Category</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categories}>
            {CATEGORIES.map((cat) => (
              <TouchableOpacity
                key={cat.id}
                style={[
                  styles.categoryChip,
                  {
                    backgroundColor: category === cat.id ? cat.color + '20' : theme.surfaceLight,
                    borderColor: category === cat.id ? cat.color : theme.border,
                  },
                ]}
                onPress={() => setCategory(cat.id)}
              >
                <Ionicons
                  name={cat.icon as any}
                  size={16}
                  color={category === cat.id ? cat.color : theme.textSecondary}
                />
                <Text
                  style={[
                    styles.categoryText,
                    { color: category === cat.id ? cat.color : theme.textSecondary },
                  ]}
                >
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Remind me</Text>
          <View style={styles.reminderDays}>
            {[1, 3, 7, 14].map((day) => (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: reminderDays.includes(day)
                      ? theme.primary + '20'
                      : theme.surfaceLight,
                    borderColor: reminderDays.includes(day) ? theme.primary : theme.border,
                  },
                ]}
                onPress={() => toggleReminderDay(day)}
              >
                <Text
                  style={[
                    styles.dayText,
                    { color: reminderDays.includes(day) ? theme.primary : theme.textSecondary },
                  ]}
                >
                  {day}d
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <View style={styles.switchRow}>
            <View>
              <Text style={[styles.label, { color: theme.text }]}>Recurring Payment</Text>
              <Text style={[styles.hint, { color: theme.textTertiary }]}>
                Auto-create next payment
              </Text>
            </View>
            <Switch
              value={isRecurring}
              onValueChange={setIsRecurring}
              trackColor={{ false: theme.border, true: theme.primary + '50' }}
              thumbColor={isRecurring ? theme.primary : theme.textTertiary}
            />
          </View>

          {isRecurring && (
            <View style={styles.recurringOptions}>
              {(['monthly', 'yearly', 'custom'] as RecurringInterval[]).map((interval) => (
                <TouchableOpacity
                  key={interval}
                  style={[
                    styles.intervalChip,
                    {
                      backgroundColor:
                        recurringInterval === interval ? theme.primary + '20' : theme.surfaceLight,
                      borderColor:
                        recurringInterval === interval ? theme.primary : theme.border,
                    },
                  ]}
                  onPress={() => setRecurringInterval(interval)}
                >
                  <Text
                    style={[
                      styles.intervalText,
                      {
                        color:
                          recurringInterval === interval ? theme.primary : theme.textSecondary,
                      },
                    ]}
                  >
                    {interval.charAt(0).toUpperCase() + interval.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}

              {recurringInterval === 'custom' && (
                <TextInput
                  style={[styles.customInput, { color: theme.text, borderColor: theme.border }]}
                  value={customIntervalDays}
                  onChangeText={setCustomIntervalDays}
                  placeholder="Days"
                  placeholderTextColor={theme.textTertiary}
                  keyboardType="number-pad"
                />
              )}
            </View>
          )}
        </View>

        <View style={[styles.inputContainer, { backgroundColor: theme.surface }]}>
          <Text style={[styles.label, { color: theme.textSecondary }]}>Notes (Optional)</Text>
          <TextInput
            style={[styles.textArea, { color: theme.text }]}
            value={notes}
            onChangeText={setNotes}
            placeholder="Add any notes..."
            placeholderTextColor={theme.textTertiary}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        <TouchableOpacity
          style={[styles.deleteButton, { borderColor: theme.error }]}
          onPress={handleDelete}
        >
          <Ionicons name="trash-outline" size={20} color={theme.error} />
          <Text style={[styles.deleteText, { color: theme.error }]}>Delete Payment</Text>
        </TouchableOpacity>

        <View style={{ height: SPACING.xxl }} />
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.surface, borderTopColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.cancelButton, { borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.cancelText, { color: theme.textSecondary }]}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.saveButton, { backgroundColor: theme.primary }]}
          onPress={handleSave}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  errorText: {
    fontSize: FONT_SIZE.lg,
    textAlign: 'center',
    marginTop: SPACING.xxl,
  },
  paidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  paidButtonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
  inputContainer: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
  },
  label: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
  },
  input: {
    fontSize: FONT_SIZE.md,
    paddingVertical: SPACING.xs,
  },
  dateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: FONT_SIZE.md,
  },
  categories: {
    marginTop: SPACING.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginRight: SPACING.sm,
    borderWidth: 1,
    gap: SPACING.xs,
  },
  categoryText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  reminderDays: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.sm,
  },
  dayChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  dayText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  hint: {
    fontSize: FONT_SIZE.xs,
    marginTop: 2,
  },
  recurringOptions: {
    flexDirection: 'row',
    gap: SPACING.sm,
    marginTop: SPACING.md,
    flexWrap: 'wrap',
  },
  intervalChip: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
  },
  intervalText: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
  },
  customInput: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZE.sm,
    width: 80,
  },
  textArea: {
    fontSize: FONT_SIZE.md,
    minHeight: 80,
    paddingTop: SPACING.xs,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 2,
    marginTop: SPACING.md,
    gap: SPACING.sm,
  },
  deleteText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  footer: {
    flexDirection: 'row',
    gap: SPACING.md,
    padding: SPACING.lg,
    borderTopWidth: 1,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelText: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  saveButton: {
    flex: 2,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  saveText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});
