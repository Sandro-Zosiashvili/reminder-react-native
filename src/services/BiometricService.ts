import * as LocalAuthentication from 'expo-local-authentication';

export class BiometricService {
  /**
   * Check if device has biometric hardware
   */
  static async hasHardware(): Promise<boolean> {
    try {
      return await LocalAuthentication.hasHardwareAsync();
    } catch (error) {
      console.error('Error checking biometric hardware:', error);
      return false;
    }
  }

  /**
   * Check if biometric is enrolled
   */
  static async isEnrolled(): Promise<boolean> {
    try {
      return await LocalAuthentication.isEnrolledAsync();
    } catch (error) {
      console.error('Error checking biometric enrollment:', error);
      return false;
    }
  }

  /**
   * Get supported authentication types
   */
  static async getSupportedTypes(): Promise<LocalAuthentication.AuthenticationType[]> {
    try {
      return await LocalAuthentication.supportedAuthenticationTypesAsync();
    } catch (error) {
      console.error('Error getting supported types:', error);
      return [];
    }
  }

  /**
   * Authenticate user with biometrics
   */
  static async authenticate(promptMessage?: string): Promise<boolean> {
    try {
      const hasHardware = await this.hasHardware();
      if (!hasHardware) {
        console.log('No biometric hardware available');
        return false;
      }

      const isEnrolled = await this.isEnrolled();
      if (!isEnrolled) {
        console.log('No biometric enrolled');
        return false;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: promptMessage || 'Unlock PayReminder',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
        fallbackLabel: 'Use Passcode',
      });

      return result.success;
    } catch (error) {
      console.error('Error authenticating:', error);
      return false;
    }
  }

  /**
   * Get biometric type name for UI
   */
  static async getBiometricTypeName(): Promise<string> {
    try {
      const types = await this.getSupportedTypes();
      
      if (types.includes(LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION)) {
        return 'Face ID';
      } else if (types.includes(LocalAuthentication.AuthenticationType.FINGERPRINT)) {
        return 'Fingerprint';
      } else if (types.includes(LocalAuthentication.AuthenticationType.IRIS)) {
        return 'Iris';
      }
      
      return 'Biometric';
    } catch (error) {
      console.error('Error getting biometric type name:', error);
      return 'Biometric';
    }
  }
}
