import React from 'react';
import {
  User,
  Building2,
  Palette,
  Layout,
  CreditCard,
  Bell,
  Shield,
  Users,
  Globe,
  Key,
  Sliders,
  Download,
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
  { id: 'security', label: '7. Security & 2FA', icon: Shield },
  { id: 'team-members', label: '8. Team Members & Roles', icon: Users },
  { id: 'domains', label: '9. Custom Domains & SSL', icon: Globe },
  { id: 'api-webhooks', label: '10. API & Webhooks', icon: Key },
  { id: 'preferences', label: '11. Preferences', icon: Sliders },
  { id: 'backup-export', label: '12. Backup & Export', icon: Download },
  { id: 'danger-zone', label: '13. Danger Zone', icon: AlertTriangle },
];

export interface GlobalSettingsNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
}

export const GlobalSettingsNav: React.FC<GlobalSettingsNavProps> = ({
  activeSection,
  onSelectSection,
}) => {
  return (
    <nav className="w-full space-y-1 font-sans text-xs text-left">
      {GLOBAL_SETTINGS_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isSelected = activeSection === sec.id;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`w-full px-3 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{sec.label}</span>
            </div>
          </button>
        );
      })}
    </nav>
  );
};
