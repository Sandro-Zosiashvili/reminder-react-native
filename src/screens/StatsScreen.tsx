import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LineChart, BarChart, PieChart } from 'react-native-chart-kit';
import { useThemeStore } from '../store/themeStore';
import { usePaymentStore } from '../store/paymentStore';
import { SPACING, FONT_SIZE, BORDER_RADIUS, CATEGORIES } from '../theme/theme';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';

const screenWidth = Dimensions.get('window').width;

export default function StatsScreen() {
  const { theme } = useThemeStore();
  const { payments, history, loadPayments } = usePaymentStore();

  useEffect(() => {
    loadPayments();
  }, []);

  // Calculate monthly spending for last 6 months
  const getMonthlyData = () => {
    const months = [];
    const data = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i);
      const monthStart = startOfMonth(monthDate);
      const monthEnd = endOfMonth(monthDate);
      
      const monthHistory = history.filter(h =>
        isWithinInterval(h.paidDate, { start: monthStart, end: monthEnd })
      );
      
      const total = monthHistory.reduce((sum, h) => sum + h.amount, 0);
      
      months.push(format(monthDate, 'MMM'));
      data.push(total);
    }
    
    return { months, data };
  };

  // Calculate category breakdown
  const getCategoryData = () => {
    const categoryTotals: Record<string, number> = {};
    
    history.forEach(h => {
      if (!categoryTotals[h.category]) {
        categoryTotals[h.category] = 0;
      }
      categoryTotals[h.category] += h.amount;
    });

    return Object.entries(categoryTotals).map(([id, total]) => {
      const category = CATEGORIES.find(c => c.id === id);
      return {
        name: category?.name || id,
        amount: total,
        color: category?.color || theme.primary,
        legendFontColor: theme.textSecondary,
        legendFontSize: 12,
      };
    });
  };

  const monthlyData = getMonthlyData();
  const categoryData = getCategoryData();
  
  const totalPaid = history.reduce((sum, h) => sum + h.amount, 0);
  const totalUpcoming = payments.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0);
  const averagePayment = history.length > 0 ? totalPaid / history.length : 0;

  const chartConfig = {
    backgroundColor: theme.surface,
    backgroundGradientFrom: theme.surface,
    backgroundGradientTo: theme.surface,
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(91, 99, 211, ${opacity})`,
    labelColor: (opacity = 1) => theme.textSecondary,
    style: {
      borderRadius: BORDER_RADIUS.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.primary,
    },
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Statistics</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Your payment insights
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Paid</Text>
            <Text style={[styles.statValue, { color: theme.success }]}>
              ${totalPaid.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Upcoming</Text>
            <Text style={[styles.statValue, { color: theme.warning }]}>
              ${totalUpcoming.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Average</Text>
            <Text style={[styles.statValue, { color: theme.primary }]}>
              ${averagePayment.toFixed(2)}
            </Text>
          </View>

          <View style={[styles.statCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.statLabel, { color: theme.textSecondary }]}>Total Count</Text>
            <Text style={[styles.statValue, { color: theme.info }]}>
              {history.length}
            </Text>
          </View>
        </View>

        {monthlyData.data.length > 0 && monthlyData.data.some(d => d > 0) && (
          <View style={[styles.chartSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Monthly Spending (Last 6 Months)
            </Text>
            <LineChart
              data={{
                labels: monthlyData.months,
                datasets: [{ data: monthlyData.data.length > 0 ? monthlyData.data : [0] }],
              }}
              width={screenWidth - SPACING.lg * 4}
              height={220}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withVerticalLabels={true}
              withHorizontalLabels={true}
              fromZero={true}
            />
          </View>
        )}

        {categoryData.length > 0 && (
          <View style={[styles.chartSection, { backgroundColor: theme.surface }]}>
            <Text style={[styles.chartTitle, { color: theme.text }]}>
              Spending by Category
            </Text>
            <PieChart
              data={categoryData}
              width={screenWidth - SPACING.lg * 4}
              height={220}
              chartConfig={chartConfig}
              accessor="amount"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        )}

        {history.length === 0 && (
          <View style={[styles.emptyState, { backgroundColor: theme.surface }]}>
            <Text style={[styles.emptyText, { color: theme.textSecondary }]}>
              No data available yet
            </Text>
            <Text style={[styles.emptySubtext, { color: theme.textTertiary }]}>
              Start tracking payments to see statistics
            </Text>
          </View>
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
  content: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  statCard: {
    flex: 1,
    minWidth: '47%',
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.xs,
  },
  statValue: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
  },
  chartSection: {
    marginTop: SPACING.lg,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
  },
  chartTitle: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
    marginBottom: SPACING.md,
  },
  chart: {
    borderRadius: BORDER_RADIUS.md,
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
  },
  emptySubtext: {
    fontSize: FONT_SIZE.sm,
    marginTop: SPACING.xs,
  },
});
