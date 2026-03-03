# PayReminder - Smart Payment Reminder App

A production-ready React Native (Expo) mobile application for managing bill payments and reminders.

## Features

### Core Features
- ✅ Add, edit, and delete payments
- ✅ Set custom reminder days (1, 3, 7, 14 days before)
- ✅ Automatic notifications on due dates
- ✅ Recurring payments (monthly, yearly, custom intervals)
- ✅ Mark payments as paid
- ✅ Payment history tracking
- ✅ Calendar view with visual indicators
- ✅ Dashboard with statistics
- ✅ Search and filter functionality
- ✅ Category-based organization

### Advanced Features
- ✅ Dark/Light theme toggle
- ✅ Biometric authentication (Face ID/Fingerprint)
- ✅ Local notifications
- ✅ Monthly expense charts
- ✅ Category breakdown charts
- ✅ Swipe gestures
- ✅ Onboarding for first-time users
- ✅ Secure local storage

## Tech Stack

- **Framework**: Expo SDK 50
- **Language**: TypeScript
- **Navigation**: React Navigation 6
- **State Management**: Zustand
- **Storage**: AsyncStorage
- **Notifications**: Expo Notifications
- **Authentication**: Expo Local Authentication
- **Charts**: React Native Chart Kit
- **Calendar**: React Native Calendar Picker
- **Date Utilities**: date-fns

## Installation

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development) or Android Emulator

### Steps

1. **Clone the repository**
```bash
cd PayReminder
```

2. **Install dependencies**
```bash
npm install
```

3. **Start the development server**
```bash
npm start
```

4. **Run on device/simulator**

For iOS:
```bash
npm run ios
```

For Android:
```bash
npm run android
```

For Web:
```bash
npm run web
```

## Project Structure

```
PayReminder/
├── App.tsx                 # Main entry point
├── app.json                # Expo configuration
├── package.json            # Dependencies
├── tsconfig.json           # TypeScript configuration
├── src/
│   ├── components/         # Reusable components
│   │   ├── PaymentCard.tsx
│   │   └── StatCard.tsx
│   ├── navigation/         # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── screens/            # Screen components
│   │   ├── OnboardingScreen.tsx
│   │   ├── BiometricLockScreen.tsx
│   │   ├── DashboardScreen.tsx
│   │   ├── AddPaymentScreen.tsx
│   │   ├── EditPaymentScreen.tsx
│   │   ├── CalendarScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── StatsScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/           # Business logic
│   │   ├── StorageService.ts
│   │   ├── NotificationService.ts
│   │   └── BiometricService.ts
│   ├── store/              # Zustand state management
│   │   ├── paymentStore.ts
│   │   ├── themeStore.ts
│   │   └── authStore.ts
│   ├── theme/              # Theme configuration
│   │   └── theme.ts
│   └── types/              # TypeScript types
│       └── payment.ts
```

## Key Features Implementation

### Notifications
- Automatic scheduling when payments are added
- Notifications sent at configured days before due date
- Additional notification on due date
- Automatic rescheduling for recurring payments
- Works locally without backend

### Recurring Payments
- Monthly, yearly, or custom intervals
- Automatically creates next payment when marked as paid
- Maintains payment history
- Cancels old notifications and schedules new ones

### Data Persistence
- All data stored locally using AsyncStorage
- Secure and private - no cloud storage
- Export functionality for backup

### Biometric Security
- Optional Face ID/Fingerprint lock
- Protects app on launch
- Uses native device security

## Theme Customization

The app includes a complete dark and light theme system:
- Dark theme (default) - Luxury fintech style
- Light theme - Clean and minimal
- Toggle in Settings

## Notifications Setup

### iOS
1. Notifications work out of the box in development
2. For production, ensure proper entitlements in app.json

### Android
1. Notifications are configured with a dedicated channel
2. High priority for visibility
3. Custom sound and vibration patterns

## Testing Notifications

1. Go to Settings
2. Tap "Test Notification"
3. Check if notification appears

To test payment notifications:
1. Add a payment with due date tomorrow
2. Set reminder to 1 day before
3. Wait for notification (or change device time for testing)

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

## Common Issues & Solutions

### Notifications not working
- Check device notification permissions
- Ensure notifications are enabled in Settings
- On iOS, test on physical device (not simulator)

### Biometric not available
- Ensure device has Face ID/Fingerprint configured
- Grant permission when prompted
- Check Settings > Security

### Date picker not showing
- On Android, ensure DateTimePicker is properly installed
- Check that dates are valid Date objects

## Future Enhancements

Potential features for advanced versions:
- Firebase sync for multi-device support
- Cloud backup
- AI-based spending predictions
- Smart reminder suggestions
- Bill splitting with friends
- Receipt scanning (OCR)
- Bank account integration
- Budget planning tools

## License

MIT License - feel free to use for personal or commercial projects

## Support

For issues or questions, please check:
1. Dependencies are properly installed
2. Expo CLI is up to date
3. Device permissions are granted

## Credits

Built with ❤️ using Expo and React Native
Icons by Ionicons
Charts by React Native Chart Kit
# reminder-react-native
