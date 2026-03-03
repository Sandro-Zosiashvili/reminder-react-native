import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  FlatList,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../store/themeStore';
import { SPACING, FONT_SIZE, BORDER_RADIUS } from '../theme/theme';

const { width } = Dimensions.get('window');

interface OnboardingSlide {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  description: string;
}

const slides: OnboardingSlide[] = [
  {
    id: '1',
    icon: 'notifications',
    title: 'Never Miss a Payment',
    description: 'Get timely reminders before your bills are due. Stay on top of your finances effortlessly.',
  },
  {
    id: '2',
    icon: 'calendar',
    title: 'Visual Calendar',
    description: 'See all your upcoming payments in a beautiful calendar view. Plan your finances better.',
  },
  {
    id: '3',
    icon: 'stats-chart',
    title: 'Track Your Spending',
    description: 'Analyze your payment history with detailed statistics and insights.',
  },
  {
    id: '4',
    icon: 'shield-checkmark',
    title: 'Secure & Private',
    description: 'Your data stays on your device. Optional biometric lock for extra security.',
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export default function OnboardingScreen({ onComplete }: OnboardingScreenProps) {
  const { theme } = useThemeStore();
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < slides.length - 1) {
      slidesRef.current?.scrollToIndex({ index: currentIndex + 1 });
    } else {
      onComplete();
    }
  };

  const renderItem = ({ item }: { item: OnboardingSlide }) => (
    <View style={[styles.slide, { width }]}>
      <View style={[styles.iconContainer, { backgroundColor: theme.primary + '20' }]}>
        <Ionicons name={item.icon} size={80} color={theme.primary} />
      </View>
      <Text style={[styles.title, { color: theme.text }]}>{item.title}</Text>
      <Text style={[styles.description, { color: theme.textSecondary }]}>
        {item.description}
      </Text>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.content}>
        <FlatList
          ref={slidesRef}
          data={slides}
          renderItem={renderItem}
          horizontal
          showsHorizontalScrollIndicator={false}
          pagingEnabled
          bounces={false}
          keyExtractor={(item) => item.id}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={32}
          onViewableItemsChanged={viewableItemsChanged}
          viewabilityConfig={viewConfig}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.pagination}>
          {slides.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.3, 1, 0.3],
              extrapolate: 'clamp',
            });

            return (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    width: dotWidth,
                    opacity,
                    backgroundColor: theme.primary,
                  },
                ]}
              />
            );
          })}
        </View>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: theme.primary }]}
          onPress={scrollTo}
        >
          <Text style={styles.buttonText}>
            {currentIndex === slides.length - 1 ? 'Get Started' : 'Next'}
          </Text>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {currentIndex < slides.length - 1 && (
          <TouchableOpacity onPress={onComplete} style={styles.skipButton}>
            <Text style={[styles.skipText, { color: theme.textSecondary }]}>Skip</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 3,
  },
  slide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  iconContainer: {
    width: 160,
    height: 160,
    borderRadius: 80,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
  },
  title: {
    fontSize: FONT_SIZE.xxl,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: SPACING.md,
  },
  description: {
    fontSize: FONT_SIZE.md,
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: SPACING.md,
  },
  footer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
    paddingBottom: SPACING.xxl,
  },
  pagination: {
    flexDirection: 'row',
    height: 10,
    marginBottom: SPACING.xl,
  },
  dot: {
    height: 10,
    borderRadius: 5,
    marginHorizontal: 4,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.md,
    paddingHorizontal: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
    width: '100%',
    gap: SPACING.sm,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: FONT_SIZE.lg,
    fontWeight: 'bold',
  },
  skipButton: {
    marginTop: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  skipText: {
    fontSize: FONT_SIZE.md,
  },
});
