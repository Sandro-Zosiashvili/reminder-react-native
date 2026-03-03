import { create } from 'zustand';
import { Theme, DarkTheme, LightTheme } from '../theme/theme';
import { StorageService } from '../services/StorageService';

interface ThemeState {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  theme: DarkTheme,
  isDark: true,
  
  toggleTheme: async () => {
    const newIsDark = !get().isDark;
    const newTheme = newIsDark ? DarkTheme : LightTheme;
    
    set({ theme: newTheme, isDark: newIsDark });
    await StorageService.setItem('theme', newIsDark ? 'dark' : 'light');
  },
  
  loadTheme: async () => {
    try {
      const savedTheme = await StorageService.getItem('theme');
      const isDark = savedTheme !== 'light';
      const theme = isDark ? DarkTheme : LightTheme;
      
      set({ theme, isDark });
    } catch (error) {
      console.error('Error loading theme:', error);
    }
  },
}));
