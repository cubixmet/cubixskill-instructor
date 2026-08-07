import React from 'react';
import {
  User,
  Building2,
  Palette,
  Layout,
  CreditCard,
  Bell,
  Sparkles,
  ShieldCheck,
  Globe,
  Database,
  Users,
  AlertTriangle,
} from 'lucide-react';

export interface GlobalSettingsSectionItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const GLOBAL_SETTINGS_SECTIONS: GlobalSettingsSectionItem[] = [
  { id: 'profile', label: '1. Instructor Profile', icon: User },
  { id: 'academy-info', label: '2. Academy Information', icon: Building2 },
  { id: 'student-branding', label: '3. Student Portal Branding', icon: Palette },
  { id: 'website-settings', label: '4. Website Settings', icon: Layout },
  { id: 'payment-gateway', label: '5. Payment Gateways', icon: CreditCard },
  { id: 'notifications', label: '6. Notifications', icon: Bell },
  { id: 'credits-billing', label: '7. Credits & Billing Wallet', icon: Sparkles },
  { id: 'security', label: '8. Security & Passwords', icon: ShieldCheck },
  { id: 'custom-domain', label: '9. Domain & SSL Status', icon: Globe },
  { id: 'team-members', label: '10. Team & Role Permissions', icon: Users },
  { id: 'storage', label: '11. Media Storage & CDN', icon: Database },
  { id: 'danger-zone', label: '12. Academy Account Reset', icon: AlertTriangle },
];
