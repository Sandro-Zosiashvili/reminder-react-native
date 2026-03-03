import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { BiometricService } from '../services/BiometricService';
import { SPACING, FONT_SIZE } from '../theme/theme';

interface BiometricLockScreenProps {
  onAuthenticate: () => void;
}

export default function BiometricLockScreen({ onAuthenticate }: BiometricLockScreenProps) {
  const { theme } = useThemeStore();
  const [biometricType, setBiometricType] = useState('Biometric');
  const [error, setError] = useState('');

  useEffect(() => {
    loadBiometricType();
    authenticate();
  }, []);

  const loadBiometricType = async () => {
    const type = await BiometricService.getBiometricTypeName();
    setBiometricType(type);
  };

  const authenticate = async () => {
    setError('');
    const success = await BiometricService.authenticate('Unlock PayReminder');
    
    if (success) {
      onAuthenticate();
    } else {
      setError('Authentication failed. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
          <Ionicons name="lock-closed" size={60} color={theme.primary} />
        </View>

        <Text style={[styles.title, { color: theme.text }]}>PayReminder</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Unlock with {biometricType}
        </Text>

        {error ? (
          <Text style={[styles.error, { color: theme.error }]}>{error}</Text>
        ) : null}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={authenticate}
        >
          <Ionicons name="finger-print" size={24} color="#FFFFFF" />
          <Text style={styles.buttonText}>Authenticate</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    marginBottom: SPACING.sm,
  },
  subtitle: {
    fontSize: FONT_SIZE.md,
    marginBottom: SPACING.xl,
  },
  error: {
    fontSize: FONT_SIZE.sm,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: 12,
    gap: SPACING.sm,
    marginTop: SPACING.md,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.md,
    fontWeight: 'bold',
  },
});
