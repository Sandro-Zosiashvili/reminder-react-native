import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import OnboardingScreen from './src/screens/OnboardingScreen';
import BiometricLockScreen from './src/screens/BiometricLockScreen';
import { useThemeStore } from './src/store/themeStore';
import { useAuthStore } from './src/store/authStore';
import { NotificationService } from './src/services/NotificationService';
import { StorageService } from './src/services/StorageService';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const { theme } = useThemeStore();
  const { isAuthenticated, biometricEnabled, authenticate } = useAuthStore();

  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      // Initialize notification service
      await NotificationService.initialize();

      // Check if first time user
      const hasCompletedOnboarding = await StorageService.getItem('hasCompletedOnboarding');
      
      if (!hasCompletedOnboarding) {
        setShowOnboarding(true);
      }

      // Reschedule all pending notifications
      await NotificationService.rescheduleAllNotifications();

      setIsLoading(false);
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsLoading(false);
    }
  };

  const handleOnboardingComplete = async () => {
    await StorageService.setItem('hasCompletedOnboarding', 'true');
    setShowOnboarding(false);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  if (showOnboarding) {
    return <OnboardingScreen onComplete={handleOnboardingComplete} />;
  }

  if (biometricEnabled && !isAuthenticated) {
    return <BiometricLockScreen onAuthenticate={authenticate} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1}}>
      <SafeAreaProvider>
        <NavigationContainer>
          <AppNavigator />
          <StatusBar style={theme.statusBar} />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
