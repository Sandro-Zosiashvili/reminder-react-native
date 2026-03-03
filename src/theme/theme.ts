export interface Theme {
  primary: string;
  secondary: string;
  background: string;
  surface: string;
  surfaceLight: string;
  text: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  gradient: string[];
  shadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  cardShadow: {
    shadowColor: string;
    shadowOffset: { width: number; height: number };
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
  statusBar: 'light' | 'dark';
}

export const DarkTheme: Theme = {
  primary: '#5B63D3',
  secondary: '#7C83DB',
  background: '#0A0E27',
  surface: '#151A3D',
  surfaceLight: '#1E2548',
  text: '#FFFFFF',
  textSecondary: '#A0A6C5',
  textTertiary: '#6B7199',
  border: '#2A2F52',
  success: '#00D9A5',
  warning: '#FFB020',
  error: '#FF6B6B',
  info: '#4DA6FF',
  gradient: ['#5B63D3', '#7C83DB'],
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBar: 'light',
};

export const LightTheme: Theme = {
  primary: '#5B63D3',
  secondary: '#7C83DB',
  background: '#F5F7FA',
  surface: '#FFFFFF',
  surfaceLight: '#F9FAFB',
  text: '#1A1F36',
  textSecondary: '#4F5672',
  textTertiary: '#8F95B2',
  border: '#E4E7EB',
  success: '#00C48C',
  warning: '#FFA800',
  error: '#F03738',
  info: '#0066FF',
  gradient: ['#5B63D3', '#7C83DB'],
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  cardShadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  statusBar: 'dark',
};

export const CATEGORIES = [
  { id: 'utilities', name: 'Utilities', icon: 'flash', color: '#FFB020' },
  { id: 'housing', name: 'Housing', icon: 'home', color: '#5B63D3' },
  { id: 'internet', name: 'Internet', icon: 'wifi', color: '#00D9A5' },
  { id: 'subscription', name: 'Subscription', icon: 'sync', color: '#7C83DB' },
  { id: 'insurance', name: 'Insurance', icon: 'shield', color: '#4DA6FF' },
  { id: 'loan', name: 'Loan', icon: 'card', color: '#FF6B6B' },
  { id: 'other', name: 'Other', icon: 'ellipsis-horizontal', color: '#A0A6C5' },
];

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const FONT_SIZE = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 24,
  xxl: 32,
  xxxl: 40,
};

export const BORDER_RADIUS = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
};
