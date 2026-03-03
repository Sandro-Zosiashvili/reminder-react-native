import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';

interface StatCardProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
  color: string;
  backgroundColor: string;
  subtitle?: string;
}

export default function StatCard({
  icon,
  label,
  value,
  color,
  backgroundColor,
  subtitle,
}: StatCardProps) {
  const { theme } = useThemeStore();

  return (
    <View style={[styles.container, { backgroundColor: theme.surface }]}>
      <View style={[styles.iconContainer, { backgroundColor }]}>
        <Ionicons name={icon} size={20} color={color} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.label, { color: theme.textSecondary }]}>{label}</Text>
        <View style={styles.valueRow}>
          <Text style={[styles.value, { color }]}>{value}</Text>
          {subtitle && (
            <Text style={[styles.subtitle, { color: theme.textTertiary }]}>{subtitle}</Text>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  label: {
    fontSize: FONT_SIZE.xs,
    fontWeight: '600',
    marginBottom: 4,
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  value: {
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: FONT_SIZE.xs,
  },
});
