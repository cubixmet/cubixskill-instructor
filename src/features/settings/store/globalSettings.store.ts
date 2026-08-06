import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PaymentGatewayItem {
  id: 'razorpay' | 'stripe' | 'paypal';
  name: string;
  isEnabled: boolean;
  isTestMode: boolean;
  keyId: string;
  keySecret: string;
  webhookSecret: string;
  currency: string;
  status: 'connected' | 'not_connected' | 'failed';
}

export interface GlobalSettingsConfig {
  // 1. Profile
  profile: {
    fullName: string;
    displayName: string;
    email: string;
    phone: string;
    twoFactorEnabled: boolean;
    language: string;
    timeZone: string;
  };

  // 2. Academy Information
  academy: {
    name: string;
    logoUrl: string;
    faviconUrl: string;
    supportEmail: string;
    supportPhone: string;
    address: string;
    gstDetails: string;
    businessRegNumber: string;
  };

  // 3. Payment Gateways
  paymentGateways: Record<'razorpay' | 'stripe' | 'paypal', PaymentGatewayItem>;

  // 4. Notifications
  notifications: {
    emailEnrollments: boolean;
    emailAssignments: boolean;
    emailSecurityAlerts: boolean;
    pushLiveReminders: boolean;
  };

  // 5. Preferences
  preferences: {
    themeMode: 'light' | 'dark' | 'system';
    currency: string;
    dateFormat: string;
  };
}

export const DEFAULT_GLOBAL_SETTINGS: GlobalSettingsConfig = {
  profile: {
    fullName: 'Dr. Vikramaditya Rao',
    displayName: 'Dr. Vikram',
    email: 'vikram@cubixskill.com',
    phone: '+91 98765 43210',
    twoFactorEnabled: true,
    language: 'English (US)',
    timeZone: 'Asia/Kolkata (GMT+5:30)',
  },

  academy: {
    name: 'Bright Academy of Technology',
    logoUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=100',
    faviconUrl: '',
    supportEmail: 'support@brightacademy.com',
    supportPhone: '+91 98765 43210',
    address: 'Building 4, Tech Park, Bengaluru, India',
    gstDetails: '29ABCDE1234F1Z5',
    businessRegNumber: 'CIN-U72200KA2024PTC123456',
  },

  paymentGateways: {
    razorpay: {
      id: 'razorpay',
      name: 'Razorpay (India & Global)',
      isEnabled: true,
      isTestMode: false,
      keyId: 'rzp_live_9876543210',
      keySecret: '••••••••••••••••••••',
      webhookSecret: 'whsec_rzp_998877',
      currency: 'INR',
      status: 'connected',
    },
    stripe: {
      id: 'stripe',
      name: 'Stripe (Global Payments)',
      isEnabled: true,
      isTestMode: true,
      keyId: 'pk_test_51Mz1234567890',
      keySecret: '••••••••••••••••••••',
      webhookSecret: 'whsec_stripe_112233',
      currency: 'USD',
      status: 'connected',
    },
    paypal: {
      id: 'paypal',
      name: 'PayPal Checkout',
      isEnabled: false,
      isTestMode: true,
      keyId: '',
      keySecret: '',
      webhookSecret: '',
      currency: 'USD',
      status: 'not_connected',
    },
  },

  notifications: {
    emailEnrollments: true,
    emailAssignments: true,
    emailSecurityAlerts: true,
    pushLiveReminders: true,
  },

  preferences: {
    themeMode: 'light',
    currency: 'INR',
    dateFormat: 'DD/MM/YYYY',
  },
};

interface GlobalSettingsStoreState {
  settings: GlobalSettingsConfig;
  updateProfile: (profile: Partial<GlobalSettingsConfig['profile']>) => void;
  updateAcademy: (academy: Partial<GlobalSettingsConfig['academy']>) => void;
  updatePaymentGateway: (gatewayId: 'razorpay' | 'stripe' | 'paypal', updates: Partial<PaymentGatewayItem>) => void;
  updateNotifications: (notifications: Partial<GlobalSettingsConfig['notifications']>) => void;
  updatePreferences: (preferences: Partial<GlobalSettingsConfig['preferences']>) => void;
  resetGlobalSettings: () => void;
}

export const useGlobalSettingsStore = create<GlobalSettingsStoreState>()(
  persist(
    (set) => ({
      settings: DEFAULT_GLOBAL_SETTINGS,

      updateProfile: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            profile: { ...state.settings.profile, ...updates },
          },
        }));
      },

      updateAcademy: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            academy: { ...state.settings.academy, ...updates },
          },
        }));
      },

      updatePaymentGateway: (gatewayId, updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            paymentGateways: {
              ...state.settings.paymentGateways,
              [gatewayId]: { ...state.settings.paymentGateways[gatewayId], ...updates },
            },
          },
        }));
      },

      updateNotifications: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...updates },
          },
        }));
      },

      updatePreferences: (updates) => {
        set((state) => ({
          settings: {
            ...state.settings,
            preferences: { ...state.settings.preferences, ...updates },
          },
        }));
      },

      resetGlobalSettings: () => {
        set({ settings: DEFAULT_GLOBAL_SETTINGS });
      },
    }),
    {
      name: 'cubixskill_global_settings_store_v1',
    }
  )
);
