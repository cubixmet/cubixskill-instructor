import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Trash2,
  Save,
  Check,
  Search,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  paymentSettingsService,
  type PaymentMode,
  type PaymentSettingsData,
  type PaymentTransactionItem,
  type AcademySettlementItem,
} from '../../../services/paymentSettings.service';

export const PaymentSettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'settings' | 'transactions' | 'settlements'>('settings');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const [settings, setSettings] = useState<PaymentSettingsData>({
    payment_mode: 'CUBIXSKILL_RAZORPAY',
    razorpay_key_id: '',
    razorpay_environment: 'test',
    settlement_method: 'UPI',
    beneficiary_name: '',
  });

  // Secret Form Inputs (temporary only during editing)
  const [keyIdInput, setKeyIdInput] = useState('');
  const [keySecretInput, setKeySecretInput] = useState('');
  const [webhookSecretInput, setWebhookSecretInput] = useState('');
  const [envInput, setEnvInput] = useState<'test' | 'live'>('test');

  const [showSecretKey, setShowSecretKey] = useState(false);
  const [showWebhookSecret, setShowWebhookSecret] = useState(false);

  // Settlement Form Inputs
  const [beneficiaryInput, setBeneficiaryInput] = useState('');
  const [settlementMethodInput, setSettlementMethodInput] = useState<'UPI' | 'BANK_TRANSFER'>('UPI');
  const [vpaInput, setVpaInput] = useState('');
  const [accountInput, setAccountInput] = useState('');
  const [confirmAccountInput, setConfirmAccountInput] = useState('');
  const [ifscInput, setIfscInput] = useState('');

  // Status & Notifications
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Confirmation Modals
  const [pendingModeChange, setPendingModeChange] = useState<PaymentMode | null>(null);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);

  // Ledger Data
  const [transactions, setTransactions] = useState<PaymentTransactionItem[]>([]);
  const [settlements, setSettlements] = useState<AcademySettlementItem[]>([]);
  const [txSearch, setTxSearch] = useState('');

  // Refund Modal State
  const [selectedTxForRefund, setSelectedTxForRefund] = useState<PaymentTransactionItem | null>(null);
  const [refundAmount, setRefundAmount] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [refunding, setRefunding] = useState(false);

  useEffect(() => {
    loadSettings();
    loadTransactions();
    loadSettlements();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await paymentSettingsService.getPaymentSettings();
      setSettings(data);
      setKeyIdInput(data.razorpay_key_id || '');
      setEnvInput(data.razorpay_environment || 'test');
      setBeneficiaryInput(data.beneficiary_name || '');
      setSettlementMethodInput((data.settlement_method as any) || 'UPI');
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to load payment settings.' });
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      const data = await paymentSettingsService.getTransactions();
      setTransactions(data);
    } catch {
      setTransactions([]);
    }
  };

  const loadSettlements = async () => {
    try {
      const data = await paymentSettingsService.getSettlements();
      setSettlements(data);
    } catch {
      setSettlements([]);
    }
  };

  const handleSelectMode = (mode: PaymentMode) => {
    if (mode === settings.payment_mode) return;
    setPendingModeChange(mode);
  };

  const confirmModeChange = async () => {
    if (!pendingModeChange) return;
    const newMode = pendingModeChange;
    setPendingModeChange(null);

    try {
      setSaving(true);
      const updated = await paymentSettingsService.updatePaymentSettings({ payment_mode: newMode });
      setSettings(updated);
      setStatusMessage({ type: 'success', text: `Payment mode updated to ${newMode === 'ACADEMY_RAZORPAY' ? 'Own Razorpay' : 'CubixSkill Payments'}.` });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to update payment mode.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveRazorpayConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    try {
      setSaving(true);
      const payload: Partial<PaymentSettingsData> = {
        payment_mode: 'ACADEMY_RAZORPAY',
        razorpay_key_id: keyIdInput.trim(),
        razorpay_environment: envInput,
      };

      if (keySecretInput.trim()) {
        payload.razorpay_key_secret = keySecretInput.trim();
      }
      if (webhookSecretInput.trim()) {
        payload.razorpay_webhook_secret = webhookSecretInput.trim();
      }

      const updated = await paymentSettingsService.updatePaymentSettings(payload);
      setSettings(updated);

      // Immediately clear secret inputs from memory
      setKeySecretInput('');
      setWebhookSecretInput('');

      setStatusMessage({ type: 'success', text: 'Razorpay configuration saved securely.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to save Razorpay configuration.' });
    } finally {
      setSaving(false);
    }
  };

  const handleVerifyRazorpay = async () => {
    setStatusMessage(null);
    try {
      setVerifying(true);
      const result = await paymentSettingsService.verifyRazorpay();
      if (result.verified) {
        setStatusMessage({ type: 'success', text: 'Razorpay connection verified successfully!' });
        loadSettings();
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.response?.data?.message || 'Unable to verify Razorpay configuration. Please check your credentials.' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDisconnectRazorpay = async () => {
    setShowDisconnectModal(false);
    try {
      setSaving(true);
      await paymentSettingsService.disconnectRazorpay();
      await loadSettings();
      setKeyIdInput('');
      setKeySecretInput('');
      setWebhookSecretInput('');
      setStatusMessage({ type: 'success', text: 'Academy Razorpay account disconnected.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to disconnect Razorpay account.' });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettlement = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);

    if (settlementMethodInput === 'BANK_TRANSFER' && accountInput && accountInput !== confirmAccountInput) {
      setStatusMessage({ type: 'error', text: 'Bank account numbers do not match.' });
      return;
    }

    try {
      setSaving(true);
      const payload: Partial<PaymentSettingsData> = {
        payment_mode: 'CUBIXSKILL_RAZORPAY',
        beneficiary_name: beneficiaryInput.trim(),
        settlement_method: settlementMethodInput,
      };

      if (settlementMethodInput === 'UPI' && vpaInput.trim()) {
        payload.settlement_vpa = vpaInput.trim();
      }
      if (settlementMethodInput === 'BANK_TRANSFER') {
        if (accountInput.trim()) payload.settlement_account = accountInput.trim();
        if (ifscInput.trim()) payload.settlement_ifsc = ifscInput.trim();
      }

      const updated = await paymentSettingsService.updatePaymentSettings(payload);
      setSettings(updated);

      setVpaInput('');
      setAccountInput('');
      setConfirmAccountInput('');
      setIfscInput('');

      setStatusMessage({ type: 'success', text: 'Settlement details saved securely.' });
    } catch {
      setStatusMessage({ type: 'error', text: 'Failed to save settlement details.' });
    } finally {
      setSaving(false);
    }
  };

  const handleExecuteRefund = async () => {
    if (!selectedTxForRefund) return;
    const amt = parseFloat(refundAmount);
    if (!amt || amt <= 0) {
      alert('Enter a valid refund amount.');
      return;
    }

    try {
      setRefunding(true);
      await paymentSettingsService.refundTransaction(selectedTxForRefund.uuid, amt, refundReason);
      alert('Refund processed successfully!');
      setSelectedTxForRefund(null);
      loadTransactions();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to process refund.');
    } finally {
      setRefunding(false);
    }
  };

  const filteredTransactions = transactions.filter((tx) => {
    const query = txSearch.toLowerCase();
    return (
      (tx.gateway_payment_id || '').toLowerCase().includes(query) ||
      (tx.gateway_order_id || '').toLowerCase().includes(query) ||
      (tx.payer_email || '').toLowerCase().includes(query) ||
      (tx.course_title || '').toLowerCase().includes(query)
    );
  });

  const totalSalesAmount = transactions.filter((t) => t.status === 'SUCCESS').reduce((acc, t) => acc + Number(t.amount || 0), 0);
  const totalSettledAmount = settlements.filter((s) => s.status === 'PAID').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);
  const pendingSettlementAmount = settlements.filter((s) => s.status === 'PENDING').reduce((acc, s) => acc + Number(s.net_amount || 0), 0);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-left font-sans min-w-0">
      {/* PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC]">
            Payment Settings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-[#94A3B8] font-normal">
            Choose how student payments are processed for your academy.
          </p>
        </div>

        {/* TABS NAVIGATION */}
        <div className="inline-flex bg-slate-100 dark:bg-[#172033] p-1 rounded-xl border border-slate-200 dark:border-[#263244] self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveTab('settings')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'settings'
                ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Settings
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('transactions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'transactions'
                ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Transactions ({transactions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('settlements')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
              activeTab === 'settlements'
                ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
            }`}
          >
            Settlements ({settlements.length})
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-xl text-xs font-medium flex items-center justify-between gap-3 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] text-emerald-800 dark:text-[#6EE7B7]'
              : 'bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-[#DC2626] dark:text-[#F87171]'
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#6EE7B7] shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-[#DC2626] dark:text-[#F87171] shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
          <button type="button" onClick={() => setStatusMessage(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">
            Dismiss
          </button>
        </div>
      )}

      {/* TAB 1: SETTINGS */}
      {activeTab === 'settings' && (
        loading ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            Loading payment settings...
          </div>
        ) : (
        <div className="space-y-8">
          {/* PAYMENT MODE SELECTION CARDS */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">Payment Processing Mode</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* CARD 1: OWN RAZORPAY */}
              <div
                className={`p-6 rounded-[14px] border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  settings.payment_mode === 'ACADEMY_RAZORPAY'
                    ? 'bg-white dark:bg-[#111827] border-[#2563EB] dark:border-[#60A5FA] ring-2 ring-[#2563EB]/10 dark:ring-[#60A5FA]/10 shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] hover:border-slate-300 dark:hover:border-[#334155]'
                }`}
                onClick={() => handleSelectMode('ACADEMY_RAZORPAY')}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA]">
                      Direct Payment
                    </span>
                    {settings.payment_mode === 'ACADEMY_RAZORPAY' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                        <Check className="w-4 h-4" /> Selected
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Use My Razorpay Account</h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed mt-1">
                      Connect your academy's Razorpay account. Student payments will be processed directly through your Razorpay account.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMode('ACADEMY_RAZORPAY');
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                    settings.payment_mode === 'ACADEMY_RAZORPAY'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#263244]'
                  }`}
                >
                  {settings.payment_mode === 'ACADEMY_RAZORPAY' ? 'Selected' : 'Select'}
                </button>
              </div>

              {/* CARD 2: CUBIXSKILL PAYMENTS */}
              <div
                className={`p-6 rounded-[14px] border transition-all cursor-pointer flex flex-col justify-between space-y-4 ${
                  settings.payment_mode === 'CUBIXSKILL_RAZORPAY'
                    ? 'bg-white dark:bg-[#111827] border-[#2563EB] dark:border-[#60A5FA] ring-2 ring-[#2563EB]/10 dark:ring-[#60A5FA]/10 shadow-xs'
                    : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] hover:border-slate-300 dark:hover:border-[#334155]'
                }`}
                onClick={() => handleSelectMode('CUBIXSKILL_RAZORPAY')}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]">
                      Managed by CubixSkill
                    </span>
                    {settings.payment_mode === 'CUBIXSKILL_RAZORPAY' && (
                      <span className="flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                        <Check className="w-4 h-4" /> Selected
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Use CubixSkill Payments</h3>
                    <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed mt-1">
                      Student payments are processed through CubixSkill and your eligible balance is settled to your configured payout method.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectMode('CUBIXSKILL_RAZORPAY');
                  }}
                  className={`w-full py-2.5 rounded-xl font-medium text-xs transition-colors cursor-pointer ${
                    settings.payment_mode === 'CUBIXSKILL_RAZORPAY'
                      ? 'bg-[#2563EB] text-white'
                      : 'bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#263244]'
                  }`}
                >
                  {settings.payment_mode === 'CUBIXSKILL_RAZORPAY' ? 'Selected' : 'Select'}
                </button>
              </div>
            </div>
          </div>

          {/* MODE 1 FORM: ACADEMY OWN RAZORPAY CONFIGURATION */}
          {settings.payment_mode === 'ACADEMY_RAZORPAY' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#263244] pb-4">
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Razorpay Configuration</h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
                    Enter your official API Key ID and Secret from the Razorpay Dashboard.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      settings.credentials_verified
                        ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                        : settings.credentials_configured
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                        : 'bg-slate-100 dark:bg-[#172033] text-slate-500 dark:text-[#94A3B8]'
                    }`}
                  >
                    {settings.credentials_verified
                      ? 'Connected & Verified'
                      : settings.credentials_configured
                      ? 'Configuration Saved'
                      : 'Configuration Required'}
                  </span>
                </div>
              </div>

              {/* CREDENTIAL DISPLAY SUMMARY */}
              {settings.credentials_configured && (
                <div className="bg-slate-50 dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-[#263244] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Razorpay Key ID</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{settings.razorpay_key_id || 'rzp_live_********'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Key Secret</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{settings.key_secret_preview || '••••••••••••••••'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Webhook Secret</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{settings.webhook_secret_preview || '••••••••••••••••'}</span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveRazorpayConfig} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Razorpay Key ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="rzp_live_..."
                      value={keyIdInput}
                      onChange={(e) => setKeyIdInput(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                      Razorpay Key Secret {settings.credentials_configured ? '(Enter new to update)' : '*'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showSecretKey ? 'text' : 'password'}
                        placeholder={settings.credentials_configured ? '••••••••••••••••' : 'Enter Secret Key'}
                        value={keySecretInput}
                        onChange={(e) => setKeySecretInput(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecretKey((p) => !p)}
                        className="absolute right-3 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        {showSecretKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                      Webhook Secret {settings.credentials_configured ? '(Enter new to update)' : '(Optional)'}
                    </label>
                    <div className="relative flex items-center">
                      <input
                        type={showWebhookSecret ? 'text' : 'password'}
                        placeholder={settings.credentials_configured ? '••••••••••••••••' : 'Enter Webhook Secret'}
                        value={webhookSecretInput}
                        onChange={(e) => setWebhookSecretInput(e.target.value)}
                        className="w-full h-11 pl-3.5 pr-10 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowWebhookSecret((p) => !p)}
                        className="absolute right-3 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-[#F8FAFC] cursor-pointer"
                      >
                        {showWebhookSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Environment Mode</label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] cursor-pointer">
                        <input
                          type="radio"
                          name="env"
                          value="test"
                          checked={envInput === 'test'}
                          onChange={() => setEnvInput('test')}
                          className="w-4 h-4 text-[#2563EB]"
                        />
                        <span>Test Mode (Sandbox)</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] cursor-pointer">
                        <input
                          type="radio"
                          name="env"
                          value="live"
                          checked={envInput === 'live'}
                          onChange={() => setEnvInput('live')}
                          className="w-4 h-4 text-[#2563EB]"
                        />
                        <span>Live Production Mode</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleVerifyRazorpay}
                    disabled={verifying || !settings.credentials_configured}
                    className="px-5 py-2.5 border border-slate-200 dark:border-[#263244] hover:bg-slate-50 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] font-medium text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${verifying ? 'animate-spin' : ''}`} />
                    <span>{verifying ? 'Verifying...' : 'Verify Connection'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDisconnectModal(true)}
                    disabled={!settings.credentials_configured}
                    className="px-5 py-2.5 border border-red-200 dark:border-red-900/50 hover:bg-red-50 dark:hover:bg-red-950/40 text-[#DC2626] dark:text-[#F87171] font-medium text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    <span>Disconnect</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* MODE 2 FORM: CUBIXSKILL SETTLEMENT CONFIGURATION */}
          {settings.payment_mode === 'CUBIXSKILL_RAZORPAY' && (
            <div className="bg-white dark:bg-[#111827] p-6 sm:p-8 rounded-[14px] border border-slate-200 dark:border-[#263244] space-y-6 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-[#263244] pb-4">
                <div>
                  <h3 className="font-semibold text-base text-slate-900 dark:text-[#F8FAFC]">Settlement Details</h3>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
                    Provide payout account information for receiving settled student course payments.
                  </p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]">
                  Settlement Setup Active
                </span>
              </div>

              {/* MASKED SETTLEMENT SUMMARY */}
              {(settings.settlement_vpa_preview || settings.settlement_account_preview) && (
                <div className="bg-slate-50 dark:bg-[#0F172A] p-4 rounded-xl border border-slate-200 dark:border-[#263244] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Beneficiary Name</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{settings.beneficiary_name || 'Academy Owner'}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Settlement Method</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{settings.settlement_method}</span>
                  </div>
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[11px]">Configured Account</span>
                    <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
                      {settings.settlement_method === 'UPI' ? settings.settlement_vpa_preview : settings.settlement_account_preview}
                    </span>
                  </div>
                </div>
              )}

              <form onSubmit={handleSaveSettlement} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Beneficiary / Account Holder Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="Official Bank Account Name"
                      value={beneficiaryInput}
                      onChange={(e) => setBeneficiaryInput(e.target.value)}
                      className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                    />
                  </div>

                  <div className="space-y-1 sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Settlement Method</label>
                    <div className="flex items-center gap-4 pt-1">
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] cursor-pointer">
                        <input
                          type="radio"
                          name="settlementMethod"
                          value="UPI"
                          checked={settlementMethodInput === 'UPI'}
                          onChange={() => setSettlementMethodInput('UPI')}
                          className="w-4 h-4 text-[#2563EB]"
                        />
                        <span>UPI ID / VPA</span>
                      </label>
                      <label className="inline-flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] cursor-pointer">
                        <input
                          type="radio"
                          name="settlementMethod"
                          value="BANK_TRANSFER"
                          checked={settlementMethodInput === 'BANK_TRANSFER'}
                          onChange={() => setSettlementMethodInput('BANK_TRANSFER')}
                          className="w-4 h-4 text-[#2563EB]"
                        />
                        <span>Direct Bank Account</span>
                      </label>
                    </div>
                  </div>

                  {settlementMethodInput === 'UPI' ? (
                    <div className="space-y-1 sm:col-span-2">
                      <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">UPI ID / VPA *</label>
                      <input
                        type="text"
                        placeholder="example@upi"
                        value={vpaInput}
                        onChange={(e) => setVpaInput(e.target.value)}
                        className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Bank Account Number *</label>
                        <input
                          type="password"
                          placeholder="•••• •••• 4821"
                          value={accountInput}
                          onChange={(e) => setAccountInput(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Confirm Bank Account Number *</label>
                        <input
                          type="text"
                          placeholder="Confirm Account Number"
                          value={confirmAccountInput}
                          onChange={(e) => setConfirmAccountInput(e.target.value)}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                      <div className="space-y-1 sm:col-span-2">
                        <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">IFSC Code *</label>
                        <input
                          type="text"
                          placeholder="HDFC0001234"
                          value={ifscInput}
                          onChange={(e) => setIfscInput(e.target.value.toUpperCase())}
                          className="w-full h-11 px-3.5 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6]"
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-5 py-2.5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer transition-colors"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save Settlement Details'}</span>
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
        )
      )}

      {/* TAB 2: TRANSACTIONS LEDGER */}
      {activeTab === 'transactions' && (
        <div className="space-y-6">
          {/* STATS OVERVIEW CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Total Volume</span>
              <span className="text-xl font-semibold text-slate-900 dark:text-[#F8FAFC]">₹{totalSalesAmount.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Successful Transactions</span>
              <span className="text-xl font-semibold text-emerald-600 dark:text-[#6EE7B7]">
                {transactions.filter((t) => t.status === 'SUCCESS').length}
              </span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Pending</span>
              <span className="text-xl font-semibold text-amber-600 dark:text-amber-400">
                {transactions.filter((t) => t.status === 'PENDING' || t.status === 'CREATED').length}
              </span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Refunded</span>
              <span className="text-xl font-semibold text-slate-600 dark:text-[#CBD5E1]">
                {transactions.filter((t) => t.status === 'REFUNDED').length}
              </span>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="relative flex items-center">
            <Search className="w-4 h-4 absolute left-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by Payment ID, Order ID, or Student Email..."
              value={txSearch}
              onChange={(e) => setTxSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-slate-900 dark:text-[#F8FAFC] focus:outline-none"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium">
                  <th className="p-3.5">Payment ID</th>
                  <th className="p-3.5">Student / Course</th>
                  <th className="p-3.5">Mode</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                      No payment transactions recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr key={tx.id || tx.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                      <td className="p-3.5 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                        {tx.gateway_payment_id || tx.uuid.slice(0, 8)}
                      </td>
                      <td className="p-3.5 space-y-0.5">
                        <span className="font-semibold text-slate-900 dark:text-[#F8FAFC] block">{tx.payer_email || 'Student'}</span>
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] block">{tx.course_title || 'Course'}</span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 dark:bg-[#172033] text-slate-700 dark:text-[#CBD5E1]">
                          {tx.payment_mode === 'ACADEMY_RAZORPAY' ? 'Direct' : 'CubixSkill'}
                        </span>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-900 dark:text-[#F8FAFC]">
                        ₹{Number(tx.amount).toLocaleString()}
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.status === 'SUCCESS'
                              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                              : tx.status === 'REFUNDED'
                              ? 'bg-slate-100 dark:bg-[#172033] text-slate-600 dark:text-[#94A3B8]'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">
                        {new Date(tx.paid_at || tx.initiated_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        {tx.status === 'SUCCESS' && (
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTxForRefund(tx);
                              setRefundAmount(String(tx.amount));
                            }}
                            className="px-2.5 py-1 text-[11px] font-medium border border-slate-200 dark:border-[#334155] rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] text-slate-700 dark:text-[#CBD5E1] cursor-pointer"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: SETTLEMENTS LEDGER */}
      {activeTab === 'settlements' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Total Settled</span>
              <span className="text-xl font-semibold text-emerald-600 dark:text-[#6EE7B7]">₹{totalSettledAmount.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Pending Settlement</span>
              <span className="text-xl font-semibold text-amber-600 dark:text-amber-400">₹{pendingSettlementAmount.toLocaleString()}</span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-5 rounded-[14px] border border-slate-200 dark:border-[#263244]">
              <span className="text-[11px] text-slate-500 dark:text-[#94A3B8] font-medium block">Settlement Method</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] block mt-1">{settings.settlement_method}</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-[14px] border border-slate-200 dark:border-[#263244] overflow-x-auto shadow-2xs">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 dark:border-[#263244] bg-slate-50 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] font-medium">
                  <th className="p-3.5">Settlement ID</th>
                  <th className="p-3.5">Gross Amount</th>
                  <th className="p-3.5">Platform &amp; Gateway Fees</th>
                  <th className="p-3.5">Net Amount</th>
                  <th className="p-3.5">Method</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Created Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-500 dark:text-[#94A3B8]">
                      No settlements generated yet. Settlements are created when payments are processed via CubixSkill.
                    </td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id || s.uuid} className="hover:bg-slate-50/50 dark:hover:bg-[#172033]/50">
                      <td className="p-3.5 font-mono text-[11px] text-slate-900 dark:text-[#F8FAFC]">
                        {s.uuid.slice(0, 8)}
                      </td>
                      <td className="p-3.5 text-slate-900 dark:text-[#F8FAFC]">₹{Number(s.gross_amount).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">₹{(Number(s.platform_fee) + Number(s.gateway_fee)).toLocaleString()}</td>
                      <td className="p-3.5 font-semibold text-emerald-600 dark:text-[#6EE7B7]">₹{Number(s.net_amount).toLocaleString()}</td>
                      <td className="p-3.5 text-slate-700 dark:text-[#CBD5E1]">{s.settlement_method}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            s.status === 'PAID'
                              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.08)] text-emerald-700 dark:text-[#6EE7B7]'
                              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {s.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">{new Date(s.created_at).toLocaleDateString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODE CHANGE CONFIRMATION MODAL */}
      {pendingModeChange && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Change Payment Mode?</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              New student course purchases will be processed using{' '}
              <strong>{pendingModeChange === 'ACADEMY_RAZORPAY' ? 'Your Connected Razorpay Account' : 'CubixSkill Payments'}</strong>.
              Existing transactions will retain their original payment mode.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPendingModeChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmModeChange}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                Confirm Mode Change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DISCONNECT CONFIRMATION MODAL */}
      {showDisconnectModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Disconnect Razorpay Account?</h3>
            <p className="text-xs text-slate-600 dark:text-[#94A3B8] leading-relaxed">
              Disconnecting your account will switch your payment mode to CubixSkill Payments until you reconnect a Razorpay account.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDisconnectModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDisconnectRazorpay}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#DC2626] text-white hover:bg-red-700"
              >
                Disconnect Account
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REFUND MODAL */}
      {selectedTxForRefund && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-md w-full p-6 space-y-4 shadow-xl text-left">
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Issue Payment Refund</h3>
            <div className="text-xs text-slate-600 dark:text-[#94A3B8] space-y-1">
              <p>Transaction: <span className="font-mono text-slate-900 dark:text-[#F8FAFC]">{selectedTxForRefund.gateway_payment_id || selectedTxForRefund.uuid}</span></p>
              <p>Original Amount: <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">₹{selectedTxForRefund.amount}</span></p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Refund Amount (₹)</label>
                <input
                  type="number"
                  value={refundAmount}
                  onChange={(e) => setRefundAmount(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">Refund Reason</label>
                <input
                  type="text"
                  placeholder="Student requested refund..."
                  value={refundReason}
                  onChange={(e) => setRefundReason(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-medium text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedTxForRefund(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-[#263244] text-slate-700 dark:text-[#CBD5E1]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleExecuteRefund}
                disabled={refunding}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8]"
              >
                {refunding ? 'Processing...' : 'Confirm Refund'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
