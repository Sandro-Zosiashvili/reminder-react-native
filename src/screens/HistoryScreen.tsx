import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';
import { SPACING, FONT_SIZE, BORDER_RADIUS, CATEGORIES } from '../theme/theme';
import { format, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

export default function HistoryScreen() {
  const { theme } = useThemeStore();
  const { history, loadPayments } = usePaymentStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    loadPayments();
  }, []);

  const filteredHistory = history.filter(h => {
    const matchesSearch = h.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || h.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const groupedByMonth = filteredHistory.reduce((acc, item) => {
    const monthKey = format(item.paidDate, 'MMMM yyyy');
    if (!acc[monthKey]) {
      acc[monthKey] = [];
    }
    acc[monthKey].push(item);
    return acc;
  }, {} as Record<string, typeof history>);

  const totalPaid = filteredHistory.reduce((sum, h) => sum + h.amount, 0);

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Payment History</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Total Paid: ${totalPaid.toFixed(2)}
        </Text>
      </View>

      <View style={styles.filters}>
        <View style={[styles.searchContainer, { backgroundColor: theme.surface }]}>
          <Ionicons name="search" size={20} color={theme.textTertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text }]}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search payments..."
            placeholderTextColor={theme.textTertiary}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color={theme.textTertiary} />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categories}
          contentContainerStyle={{ paddingHorizontal: SPACING.lg }}
        >
          <TouchableOpacity
            style={[
              styles.categoryChip,
              {
                backgroundColor: !selectedCategory ? theme.primary + '20' : theme.surface,
                borderColor: !selectedCategory ? theme.primary : theme.border,
              },
            ]}
            onPress={() => setSelectedCategory(null)}
          >
            <Text
              style={[
                styles.categoryText,
                { color: !selectedCategory ? theme.primary : theme.textSecondary },
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          {CATEGORIES.map(cat => (
            <TouchableOpacity
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === cat.id ? cat.color + '20' : theme.surface,
                  borderColor: selectedCategory === cat.id ? cat.color : theme.border,
                },
              ]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Ionicons
                name={cat.icon as any}
                size={16}
                color={selectedCategory === cat.id ? cat.color : theme.textSecondary}
              />
              <Text
                style={[
                  styles.categoryText,
                  { color: selectedCategory === cat.id ? cat.color : theme.textSecondary },
                ]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {filteredHistory.length === 0 ? (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Ionicons name="calendar-outline" size={64} color={theme.textTertiary} />
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No payment history
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Paid payments will appear here
            </Text>
          </View>
        ) : (
          Object.entries(groupedByMonth).map(([month, items]) => (
            <View key={month} style={styles.monthSection}>
              <View style={styles.monthHeader}>
                <Text style={[styles.monthTitle, { color: theme.text }]}>{month}</Text>
                <Text style={[styles.monthTotal, { color: theme.textSecondary }]}>
                  ${items.reduce((sum, i) => sum + i.amount, 0).toFixed(2)}
                </Text>
              </View>

              {items.map((item, index) => {
                const category = CATEGORIES.find(c => c.id === item.category);
                return (
                  <View
                    key={`${item.paymentId}-${index}`}
                    style={[styles.historyCard, { backgroundColor: theme.surface }]}
                  >
                    <View style={styles.historyCardLeft}>
                      <View
                        style={[
                          styles.categoryIcon,
                          { backgroundColor: category?.color + '20' || theme.primary + '20' },
                        ]}
                      >
                        <Ionicons
                          name={(category?.icon as any) || 'cash'}
                          size={20}
                          color={category?.color || theme.primary}
                        />
                      </View>
                      <View>
                        <Text style={[styles.historyTitle, { color: theme.text }]}>
                          {item.title}
                        </Text>
                        <Text style={[styles.historyDate, { color: theme.textSecondary }]}>
                          Paid on {format(item.paidDate, 'MMM dd, yyyy')}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.historyCardRight}>
                      <Text style={[styles.historyAmount, { color: theme.success }]}>
                        ${item.amount.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

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
  filters: {
    paddingTop: SPACING.md,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.md,
    gap: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FONT_SIZE.md,
    paddingVertical: SPACING.xs,
  },
  categories: {
    marginTop: SPACING.md,
    marginBottom: SPACING.md,
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.xxl,
    borderRadius: BORDER_RADIUS.lg,
    marginTop: SPACING.lg,
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
  monthSection: {
    marginTop: SPACING.lg,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  monthTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  monthTotal: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
  },
  historyCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  historyCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
    flex: 1,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  historyDate: {
    fontSize: FONT_SIZE.xs,
  },
  historyCardRight: {
    alignItems: 'flex-end',
  },
  historyAmount: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
});
