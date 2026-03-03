# Quick Start Guide - PayReminder

## Setup (5 minutes)

### 1. Install Dependencies
```bash
cd PayReminder
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Run on Device
- **iOS**: Press `i` or run `npm run ios`
- **Android**: Press `a` or run `npm run android`
- **Physical Device**: Scan QR code with Expo Go app

## First Time Using the App

1. **Onboarding**: Complete the 4-slide intro
2. **Add Payment**: Tap the + button on Dashboard
3. **Fill Details**:
   - Title: "Electricity Bill"
   - Amount: 150
   - Due Date: Pick tomorrow
   - Category: Utilities
   - Remind me: Select "1d" and "3d"
   - Toggle "Recurring Payment" if needed
4. **Save**: Tap "Save Payment"

## Testing Features

### Test Notifications
1. Settings → "Test Notification" button
2. Should see notification immediately

### Test Payment Notifications
1. Add payment due tomorrow
2. Set reminder to 1 day before
3. Should get notification (check notification center)

### Test Biometric Lock
1. Settings → Enable "Face ID Lock" / "Fingerprint Lock"
2. Close and reopen app
3. Should require authentication

### Test Recurring Payments
1. Add payment with "Recurring Payment" enabled
2. Set to "Monthly"
3. Mark as paid
4. Check calendar - next month's payment auto-created

### Test Calendar
1. Add 3-4 payments with different dates
2. Go to Calendar tab
3. Tap dates with colored dots
4. Should see payments for that day

### Test History
1. Mark some payments as paid
2. Go to History tab
3. Search and filter payments

### Test Statistics
1. After marking payments as paid
2. Go to Stats tab
3. View charts and analytics

## Key Screens

- **Dashboard**: Overview, upcoming, overdue
- **Calendar**: Visual date view
- **History**: Paid payments log
- **Stats**: Charts and analytics
- **Settings**: Theme, security, data management

## Common Actions

### Add Payment
Dashboard → + button → Fill form → Save

### Edit Payment
Tap any payment card → Modify → Save Changes

### Mark as Paid
Edit payment → "Mark as Paid" button

### Delete Payment
Edit payment → Scroll down → "Delete Payment"

### Change Theme
Settings → Toggle "Dark Mode"

### Search History
History → Search bar at top

## Troubleshooting

### App won't start
```bash
rm -rf node_modules
npm install
npm start -- --clear
```

### Notifications not working
1. Check device settings for notification permissions
2. On iOS, test on physical device (simulator has limitations)
3. Try Settings → "Test Notification"

### Date picker not showing
- Ensure @react-native-community/datetimepicker is installed
- On Android, may need to restart app

### Biometric not available
- Device must have Face ID/Fingerprint configured
- Check Settings → Security

## Development Tips

### Hot Reloading
- Save file → App auto-refreshes
- Press `r` in terminal to reload manually
- Press `j` to open debugger

### Debug Menu
- iOS: Cmd + D
- Android: Cmd/Ctrl + M
- Physical device: Shake

### View Logs
```bash
# Terminal shows logs automatically
# Or use:
npx react-native log-ios    # iOS
npx react-native log-android # Android
```

## Production Build

### Before Building
1. Create proper app icons in `assets/`
2. Update app.json with correct bundle IDs
3. Test all features thoroughly

### Build Commands
```bash
# iOS
expo build:ios

# Android
expo build:android
```

## Features Checklist

- [x] Add payments with all fields
- [x] Edit payments
- [x] Delete payments
- [x] Mark as paid
- [x] Recurring payments
- [x] Custom reminder days
- [x] Notifications (day before + due date)
- [x] Calendar view
- [x] Search & filter
- [x] Payment history
- [x] Statistics & charts
- [x] Dark/Light theme
- [x] Biometric lock
- [x] Data export
- [x] Onboarding
- [x] Smooth animations

Enjoy using PayReminder! 🎉
