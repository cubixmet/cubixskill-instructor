import React, { useState } from 'react';
import {
  Settings,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

import { useGlobalSettingsStore } from '../store/globalSettings.store';
import { GlobalSettingsNav, GLOBAL_SETTINGS_SECTIONS } from '../components/GlobalSettingsNav';
import { GlobalSettingsSections } from '../components/GlobalSettingsSections';

export const SettingsPage: React.FC = () => {
  const settings = useGlobalSettingsStore((state) => state.settings);
  const updateProfile = useGlobalSettingsStore((state) => state.updateProfile);
  const updateAcademy = useGlobalSettingsStore((state) => state.updateAcademy);
  const updatePaymentGateway = useGlobalSettingsStore((state) => state.updatePaymentGateway);
  const resetGlobalSettings = useGlobalSettingsStore((state) => state.resetGlobalSettings);

  const [activeSection, setActiveSection] = useState<string>('profile');
  const [mobileExpandedSection, setMobileExpandedSection] = useState<string | null>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleSaveSettings = () => {
    setToastMessage('Global academy settings saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetSettings = () => {
    resetGlobalSettings();
    setToastMessage('Reset global settings to academy defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-6 text-left font-sans pb-24">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER BANNER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Global Academy Settings</h1>
              <Badge variant="info" size="sm" className="font-bold">
                Academy Wide
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Manage instructor profile, academy metadata, student portal branding, website settings, and payment gateways.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSettings}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Reset Defaults
            </Button>

            <Button
              size="sm"
              onClick={handleSaveSettings}
              className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-5 shadow-xs hover:bg-blue-700"
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Settings
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. MAIN LAYOUT: DESKTOP (260px Left Nav + Form) vs MOBILE (Accordions) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* DESKTOP LEFT SIDEBAR NAV */}
        <div className="hidden md:block md:col-span-4 lg:col-span-3 space-y-2 shrink-0">
          <Card padding="sm" className="bg-white border border-slate-200 sticky top-4">
            <GlobalSettingsNav
              activeSection={activeSection}
              onSelectSection={(id) => setActiveSection(id)}
            />
          </Card>
        </div>

        {/* DESKTOP ACTIVE FORM VIEW */}
        <div className="hidden md:block md:col-span-8 lg:col-span-9">
          <GlobalSettingsSections
            sectionId={activeSection}
            settings={settings}
            onUpdateProfile={updateProfile}
            onUpdateAcademy={updateAcademy}
            onUpdatePaymentGateway={updatePaymentGateway}
          />
        </div>

        {/* MOBILE ACCORDION VIEW */}
        <div className="block md:hidden col-span-1 space-y-3 font-sans text-xs">
          {GLOBAL_SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isExpanded = mobileExpandedSection === sec.id;

            return (
              <Card key={sec.id} padding="none" className="bg-white border border-slate-200 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setMobileExpandedSection(isExpanded ? null : sec.id)}
                  className="w-full p-3.5 flex items-center justify-between font-extrabold text-slate-900 bg-slate-50 border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-blue-600" />
                    <span>{sec.label}</span>
                  </div>
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                </button>

                {isExpanded && (
                  <div className="p-3">
                    <GlobalSettingsSections
                      sectionId={sec.id}
                      settings={settings}
                      onUpdateProfile={updateProfile}
                      onUpdateAcademy={updateAcademy}
                      onUpdatePaymentGateway={updatePaymentGateway}
                    />
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
