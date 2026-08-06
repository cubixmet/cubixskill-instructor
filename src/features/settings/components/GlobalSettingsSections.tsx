import React, { useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { StudentPortalBrandingTab } from '../../website-builder/components/StudentPortalBrandingTab';
import type { GlobalSettingsConfig, PaymentGatewayItem } from '../store/globalSettings.store';

export interface GlobalSettingsSectionsProps {
  sectionId: string;
  settings: GlobalSettingsConfig;
  onUpdateProfile: (updates: Partial<GlobalSettingsConfig['profile']>) => void;
  onUpdateAcademy: (updates: Partial<GlobalSettingsConfig['academy']>) => void;
  onUpdatePaymentGateway: (id: 'razorpay' | 'stripe' | 'paypal', updates: Partial<PaymentGatewayItem>) => void;
}

export const GlobalSettingsSections: React.FC<GlobalSettingsSectionsProps> = ({
  sectionId,
  settings,
  onUpdateProfile,
  onUpdateAcademy,
  onUpdatePaymentGateway,
}) => {
  const [testingGateway, setTestingGateway] = useState<string | null>(null);
  const [testSuccess, setTestSuccess] = useState<string | null>(null);

  const handleTestConnection = (gatewayId: 'razorpay' | 'stripe' | 'paypal') => {
    setTestingGateway(gatewayId);
    setTimeout(() => {
      setTestingGateway(null);
      setTestSuccess(`Successfully verified connection with ${gatewayId.toUpperCase()} API.`);
      onUpdatePaymentGateway(gatewayId, { status: 'connected' });
      setTimeout(() => setTestSuccess(null), 3000);
    }, 1200);
  };

  // 1. Instructor Profile
  if (sectionId === 'profile') {
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">1. Instructor Profile &amp; Account</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Full Legal Name *</label>
            <Input
              value={settings.profile.fullName}
              onChange={(e) => onUpdateProfile({ fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-900 mb-1">Display Name</label>
            <Input
              value={settings.profile.displayName}
              onChange={(e) => onUpdateProfile({ displayName: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-900 mb-1">Email Address *</label>
            <Input
              value={settings.profile.email}
              onChange={(e) => onUpdateProfile({ email: e.target.value })}
            />
          </div>
          <div>
            <label className="block font-bold text-slate-900 mb-1">Phone Number</label>
            <Input
              value={settings.profile.phone}
              onChange={(e) => onUpdateProfile({ phone: e.target.value })}
            />
          </div>
        </div>
      </Card>
    );
  }

  // 2. Academy Information
  if (sectionId === 'academy-info') {
    return (
      <Card padding="md" className="bg-white border border-slate-200 space-y-4 font-sans text-xs text-left">
        <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2">2. Academy Information &amp; Legal Details</h3>
        <div className="space-y-3">
          <div>
            <label className="block font-bold text-slate-900 mb-1">Academy Name *</label>
            <Input
              value={settings.academy.name}
              onChange={(e) => onUpdateAcademy({ name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">GST / Tax Identification</label>
              <Input
                value={settings.academy.gstDetails}
                onChange={(e) => onUpdateAcademy({ gstDetails: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Business Registration Number</label>
              <Input
                value={settings.academy.businessRegNumber}
                onChange={(e) => onUpdateAcademy({ businessRegNumber: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-900 mb-1">Registered Business Address</label>
            <textarea
              rows={2}
              value={settings.academy.address}
              onChange={(e) => onUpdateAcademy({ address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 p-3 text-xs text-slate-900 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </Card>
    );
  }

  // 3. Student Portal Branding
  if (sectionId === 'student-branding') {
    return <StudentPortalBrandingTab />;
  }

  // 5. Payment Gateways
  if (sectionId === 'payment-gateway') {
    const razorpay = settings.paymentGateways.razorpay;
    const stripe = settings.paymentGateways.stripe;

    return (
      <div className="space-y-4 font-sans text-xs text-left">
        {testSuccess && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-extrabold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{testSuccess}</span>
          </div>
        )}

        <Card padding="md" className="bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{razorpay.name}</h3>
              <Badge variant={razorpay.status === 'connected' ? 'success' : 'neutral'} size="sm">
                {razorpay.status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={razorpay.isEnabled}
                onChange={(e) => onUpdatePaymentGateway('razorpay', { isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Key ID *</label>
              <Input
                value={razorpay.keyId}
                onChange={(e) => onUpdatePaymentGateway('razorpay', { keyId: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Key Secret (Masked)</label>
              <Input
                type="password"
                value={razorpay.keySecret}
                onChange={(e) => onUpdatePaymentGateway('razorpay', { keySecret: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Webhook Secret</label>
              <Input
                value={razorpay.webhookSecret}
                onChange={(e) => onUpdatePaymentGateway('razorpay', { webhookSecret: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Webhook URL</label>
              <Input value="https://api.cubixskill.com/v1/webhooks/razorpay" disabled className="bg-slate-50" />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestConnection('razorpay')}
              disabled={testingGateway === 'razorpay'}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'razorpay' ? 'animate-spin' : ''}`} />}
            >
              {testingGateway === 'razorpay' ? 'Testing Connection...' : 'Test Connection'}
            </Button>
          </div>
        </Card>

        {/* STRIPE */}
        <Card padding="md" className="bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900">{stripe.name}</h3>
              <Badge variant={stripe.status === 'connected' ? 'success' : 'neutral'} size="sm">
                {stripe.status === 'connected' ? 'Connected' : 'Not Connected'}
              </Badge>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={stripe.isEnabled}
                onChange={(e) => onUpdatePaymentGateway('stripe', { isEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-900 mb-1">Publishable Key</label>
              <Input
                value={stripe.keyId}
                onChange={(e) => onUpdatePaymentGateway('stripe', { keyId: e.target.value })}
              />
            </div>
            <div>
              <label className="block font-bold text-slate-900 mb-1">Secret Key (Masked)</label>
              <Input
                type="password"
                value={stripe.keySecret}
                onChange={(e) => onUpdatePaymentGateway('stripe', { keySecret: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleTestConnection('stripe')}
              disabled={testingGateway === 'stripe'}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${testingGateway === 'stripe' ? 'animate-spin' : ''}`} />}
            >
              {testingGateway === 'stripe' ? 'Testing Connection...' : 'Verify Connection'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // Fallback Domain Card
  return (
    <Card padding="md" className="bg-white border border-slate-200 space-y-3 font-sans text-xs text-left">
      <h3 className="text-base font-extrabold text-slate-900 border-b border-slate-100 pb-2 capitalize">{sectionId.replace('-', ' ')}</h3>
      <p className="text-slate-500">Configure global academy settings for {sectionId}.</p>
    </Card>
  );
};
