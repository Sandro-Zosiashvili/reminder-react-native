import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { useAuthStore } from '../store/authStore';
import { BiometricService } from '../services/BiometricService';
import { NotificationService } from '../services/NotificationService';
import { StorageService } from '../services/StorageService';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';

export default function SettingsScreen() {
  const { theme, isDark, toggleTheme } = useThemeStore();
  const { biometricEnabled, toggleBiometric } = useAuthStore();
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [biometricType, setBiometricType] = useState('Biometric');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    checkBiometricAvailability();
  }, []);

  const checkBiometricAvailability = async () => {
    const hasHardware = await BiometricService.hasHardware();
    const isEnrolled = await BiometricService.isEnrolled();
    const available = hasHardware && isEnrolled;
    setBiometricAvailable(available);
    
    if (available) {
      const type = await BiometricService.getBiometricTypeName();
      setBiometricType(type);
    }
  };

  const handleToggleBiometric = async () => {
    if (!biometricAvailable) {
      Alert.alert(
        'Not Available',
        'Biometric authentication is not available on this device or not set up.'
      );
      return;
    }

    if (!biometricEnabled) {
      // Authenticate before enabling
      const success = await BiometricService.authenticate(`Enable ${biometricType}`);
      if (success) {
        await toggleBiometric();
      }
    } else {
      await toggleBiometric();
    }
  };

  const handleTestNotification = async () => {
    await NotificationService.sendImmediateNotification(
      'Test Notification',
      'PayReminder notifications are working!'
    );
    Alert.alert('Success', 'Test notification sent!');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will delete all your payments and history. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: async () => {
            await StorageService.clear();
            await NotificationService.cancelAllNotifications();
            Alert.alert('Success', 'All data cleared. Please restart the app.');
          },
        },
      ]
    );
  };

  const handleExportData = async () => {
    try {
      const payments = await StorageService.getItem('payments');
      const history = await StorageService.getItem('paymentHistory');
      
      Alert.alert(
        'Export Data',
        'Data export feature - In a full implementation, this would share a JSON file with your payment data.',
        [{ text: 'OK' }]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to export data');
    }
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightElement,
  }: {
    icon: keyof typeof Ionicons.glyphMap;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
  }) => (
    <TouchableOpacity
      style={[styles.settingItem, { backgroundColor: theme.surface }]}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={styles.settingLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name={icon} size={20} color={theme.primary} />
        </View>
        <View style={styles.settingText}>
          <Text style={[styles.settingTitle, { color: theme.text }]}>{title}</Text>
          {subtitle && (
            <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
              {subtitle}
            </Text>
          )}
        </View>
      </View>
      {rightElement}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.header, { backgroundColor: theme.surface }]}>
        <Text style={[styles.title, { color: theme.text }]}>Settings</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Customize your experience
        </Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Appearance</Text>
          
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Toggle dark/light theme"
            rightElement={
              <Switch
                value={isDark}
                onValueChange={toggleTheme}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={isDark ? theme.primary : theme.textTertiary}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Security</Text>
          
          <SettingItem
            icon="finger-print"
            title={`${biometricType} Lock`}
            subtitle={
              biometricAvailable
                ? 'Require authentication to open app'
                : 'Not available on this device'
            }
            rightElement={
              <Switch
                value={biometricEnabled}
                onValueChange={handleToggleBiometric}
                disabled={!biometricAvailable}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={biometricEnabled ? theme.primary : theme.textTertiary}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Notifications</Text>
          
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive payment reminders"
            rightElement={
              <Switch
                value={notificationsEnabled}
                onValueChange={setNotificationsEnabled}
                trackColor={{ false: theme.border, true: theme.primary + '50' }}
                thumbColor={notificationsEnabled ? theme.primary : theme.textTertiary}
              />
            }
          />

          <SettingItem
            icon="megaphone"
            title="Test Notification"
            subtitle="Send a test notification"
            onPress={handleTestNotification}
            rightElement={
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>Data</Text>
          
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your payment data"
            onPress={handleExportData}
            rightElement={
              <Ionicons name="chevron-forward" size={20} color={theme.textTertiary} />
            }
          />

          <SettingItem
            icon="trash"
            title="Clear All Data"
            subtitle="Delete all payments and history"
            onPress={handleClearData}
            rightElement={
              <Ionicons name="chevron-forward" size={20} color={theme.error} />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textSecondary }]}>About</Text>
          
          <View style={[styles.infoCard, { backgroundColor: theme.surface }]}>
            <Text style={[styles.appName, { color: theme.text }]}>PayReminder</Text>
            <Text style={[styles.version, { color: theme.textSecondary }]}>Version 1.0.0</Text>
            <Text style={[styles.description, { color: theme.textTertiary }]}>
              Smart payment reminder app to help you never miss a bill.
            </Text>
          </View>
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
  section: {
    marginTop: SPACING.lg,
  },
  sectionTitle: {
    fontSize: FONT_SIZE.sm,
    fontWeight: '600',
    marginBottom: SPACING.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: SPACING.md,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BORDER_RADIUS.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: FONT_SIZE.md,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: FONT_SIZE.xs,
  },
  infoCard: {
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
  },
  appName: {
    fontSize: FONT_SIZE.xl,
    fontWeight: 'bold',
    marginBottom: SPACING.xs,
  },
  version: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.sm,
    textAlign: 'center',
    lineHeight: 20,
  },
});
