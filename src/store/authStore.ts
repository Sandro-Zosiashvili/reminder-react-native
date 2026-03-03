import { create } from 'zustand';
import { StorageService } from '../services/StorageService';

interface AuthState {
  isAuthenticated: boolean;
  biometricEnabled: boolean;
  authenticate: () => void;
  loadBiometricSetting: () => Promise<void>;
  toggleBiometric: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  isAuthenticated: false,
  biometricEnabled: false,
  
  authenticate: () => {
    set({ isAuthenticated: true });
  },
  
  loadBiometricSetting: async () => {
    try {
      const enabled = await StorageService.getItem('biometricEnabled');
      set({ biometricEnabled: enabled === 'true' });
    } catch (error) {
      console.error('Error loading biometric setting:', error);
    }
  },
  
  toggleBiometric: async () => {
    const newValue = !get().biometricEnabled;
    set({ biometricEnabled: newValue });
    await StorageService.setItem('biometricEnabled', newValue ? 'true' : 'false');
  },
}));
