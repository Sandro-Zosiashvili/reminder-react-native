import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';

// Screens
import DashboardScreen from '../screens/DashboardScreen';
import CalendarScreen from '../screens/CalendarScreen';
import AddPaymentScreen from '../screens/AddPaymentScreen';
import EditPaymentScreen from '../screens/EditPaymentScreen';
import HistoryScreen from '../screens/HistoryScreen';
import SettingsScreen from '../screens/SettingsScreen';
import StatsScreen from '../screens/StatsScreen';

export type RootStackParamList = {
  MainTabs: undefined;
  AddPayment: undefined;
  EditPayment: { paymentId: string };
};

export type TabParamList = {
  Dashboard: undefined;
  Calendar: undefined;
  History: undefined;
  Stats: undefined;
  Settings: undefined;
};

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  const { theme } = useThemeStore();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Calendar') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Stats') {
            iconName = focused ? 'stats-chart' : 'stats-chart-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.border,
          borderTopWidth: 1,
          height: 80,
          paddingBottom: 25,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Calendar" component={CalendarScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Stats" component={StatsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { theme } = useThemeStore();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.surface,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: theme.border,
        },
        headerTintColor: theme.text,
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 18,
        },

      }}
    >
      <Stack.Screen 
        name="MainTabs" 
        component={TabNavigator} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="AddPayment" 
        component={AddPaymentScreen}
        options={{
          headerTitle: 'Add Payment',
          presentation: 'modal',
        }}
      />
      <Stack.Screen 
        name="EditPayment" 
        component={EditPaymentScreen}
        options={{
          headerTitle: 'Edit Payment',
          presentation: 'modal',
        }}
      />
    </Stack.Navigator>
  );
}
