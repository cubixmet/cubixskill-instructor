import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../../store/auth.store';
import {
  HardDrive,
  Database,
  Clock,
  DollarSign,
  Calendar,
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Settings,
  Save,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import {
  storageService,
  StorageSummaryDashboard,
  StorageSnapshotItem,
  StorageUsageChargeItem,
  ControlPanelStorageSettings,
} from '../../../services/storage.service';

export const StorageBillingPage: React.FC = () => {
  const { role } = useAuthStore();
  const isPlatformAdmin = role === 'SUPER_ADMIN' || role === 'SUPER_ADMIN_STAFF';
  const [summary, setSummary] = useState<StorageSummaryDashboard | null>(null);
  const [snapshots, setSnapshots] = useState<StorageSnapshotItem[]>([]);
  const [charges, setCharges] = useState<StorageUsageChargeItem[]>([]);
  const [cpSettings, setCpSettings] = useState<ControlPanelStorageSettings | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingCp, setIsSavingCp] = useState<boolean>(false);
  const [cpSuccessMsg, setCpSuccessMsg] = useState<string | null>(null);
  const [cpErrorMsg, setCpErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'control-panel' | 'snapshots' | 'history'>('overview');

  // Form states for Control Panel Settings
  const [cpEnabled, setCpEnabled] = useState<boolean>(false);
  const [cpInterval, setCpInterval] = useState<'10_SECONDS' | '6_HOURS' | '12_HOURS' | '18_HOURS' | '1_DAY'>('12_HOURS');
  const [cpRate, setCpRate] = useState<string>('1.00');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Super Admins may have no academy assigned. A failed academy summary
      // must not prevent authorized platform pricing settings from loading.
      const [summaryResult, snapshotsResult, chargesResult, settingsResult] = await Promise.allSettled([
        storageService.getSummaryDashboard(),
        storageService.getSnapshots(),
        storageService.getChargesHistory(),
        isPlatformAdmin ? storageService.getControlPanelSettings() : Promise.resolve(null),
      ]);
      const sumData = summaryResult.status === 'fulfilled' ? summaryResult.value : null;
      const snapData = snapshotsResult.status === 'fulfilled' ? snapshotsResult.value : [];
      const chargeData = chargesResult.status === 'fulfilled' ? chargesResult.value : [];
      const settingsData = settingsResult.status === 'fulfilled' ? settingsResult.value : null;
      setSummary(sumData);
      setSnapshots(snapData);
      setCharges(chargeData);
      if (settingsData) {
        setCpSettings(settingsData);
        setCpEnabled(settingsData.storage_billing_enabled ?? settingsData.billing_enabled ?? false);
        setCpInterval(settingsData.storage_billing_interval || '12_HOURS');
        setCpRate(settingsData.storage_credit_rate_per_gb || '1.0000');
      }
    } catch (err) {
      console.error('Failed to load storage billing dashboard data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isPlatformAdmin]);

  const handleSaveCpSettings = async () => {
    if (!isPlatformAdmin) return;
    const amount = Number(cpRate);
    if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
      setCpErrorMsg('Enter a valid nonnegative credit rate per GB per interval.');
      return;
    }
    setIsSavingCp(true);
    setCpSuccessMsg(null);
    setCpErrorMsg(null);
    try {
      const updated = await storageService.updateControlPanelSettings({
        storage_billing_enabled: cpEnabled,
        storage_billing_interval: cpInterval,
        storage_credit_rate_per_gb: cpRate,
      });
      setCpSettings(updated);
      setCpSuccessMsg('Storage billing settings updated successfully.');
      setTimeout(() => setCpSuccessMsg(null), 3000);
      fetchData();
    } catch (err) {
      console.error('Failed to update control panel settings:', err);
      setCpErrorMsg('Could not save storage settings. Check your access and rate, then retry.');
    } finally {
      setIsSavingCp(false);
    }
  };

  const formatDate = (isoStr: string | null | undefined) => {
    if (!isoStr) return 'N/A';
    return new Date(isoStr).toLocaleString('en-US', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <HardDrive className="w-7 h-7 text-indigo-600" />
            Storage Rental & Interval Billing
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Authoritative continuous storage rental billing metered at configurable recurring intervals.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchData}
          disabled={isLoading}
          className="flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 flex gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Storage Usage Overview
        </button>
        {isPlatformAdmin && <button
          onClick={() => setActiveTab('control-panel')}
          className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors flex items-center gap-1.5 ${
            activeTab === 'control-panel'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Settings className="w-4 h-4" /> Control Panel Settings
        </button>}
        <button
          onClick={() => setActiveTab('snapshots')}
          className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'snapshots'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Periodic Snapshots ({snapshots.length})
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'history'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          Storage Billing History ({charges.length})
        </button>
      </div>

      {isLoading ? (
        <Card className="p-8 text-center text-gray-500">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-2 text-indigo-600 text-center" />
          Loading storage billing metrics...
        </Card>
      ) : (summary || (isPlatformAdmin && activeTab === 'control-panel' && cpSettings)) ? (
        <>
          {activeTab === 'overview' && summary && (
            <div className="space-y-6">
              {/* Primary Metric Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card className="p-5 border-l-4 border-l-indigo-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Current Storage
                    </span>
                    <Database className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {summary.current_storage_gb} GB
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {summary.current_storage_bytes?.toLocaleString() || 0} bytes
                    {summary.file_count !== undefined ? ` (${summary.file_count} files)` : ''}
                  </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-blue-500">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Billing Interval & Rate
                    </span>
                    <Clock className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="mt-2 text-xl font-bold text-gray-900">
                    {summary.billing_interval_label}
                  </div>
                  <div className="text-xs font-semibold text-indigo-600 mt-1">
                    Rate: {summary.credit_rate_per_gb} Credits / GB
                  </div>
                </Card>

                <Card className="p-5 border-l-4 border-l-purple-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                      Estimated Next Charge
                    </span>
                    <DollarSign className="w-5 h-5 text-purple-600" />
                  </div>
                  <div className="mt-2 text-2xl font-bold text-gray-900">
                    {summary.estimated_next_charge} Credits
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Calculated per interval
                  </div>
                </Card>
              </div>

              {/* Detailed Breakdown Card */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Storage Rental Status & Next Billing Schedule
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Billing Status</span>
                    <div className="mt-1 flex items-center gap-2">
                      {summary.billing_enabled ? (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Storage Billing: ON
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Storage Billing: OFF
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Billing Interval</span>
                    <div className="mt-1 text-sm font-semibold text-gray-900">
                      {summary.billing_interval_label}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Credit Rate per GB</span>
                    <div className="mt-1 text-sm font-semibold text-indigo-600">
                      {summary.credit_rate_per_gb} Credits / GB
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Last Storage Credit Debit</span>
                    <div className="mt-1 text-sm text-gray-700 flex items-center gap-1.5 font-medium">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      {formatDate(summary.last_debited_at)}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Next Charge</span>
                    <div className="mt-1 text-sm text-gray-700 flex items-center gap-1.5 font-medium">
                      <Calendar className="w-4 h-4 text-indigo-500" />
                      {formatDate(summary.next_billing_at)}
                    </div>
                  </div>

                  <div>
                    <span className="text-xs text-gray-500 uppercase font-semibold">Billing Currency</span>
                    <div className="mt-1 text-sm font-semibold text-indigo-600">
                      Platform Credits
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-indigo-50 rounded-lg text-xs text-indigo-800 leading-relaxed border border-indigo-100">
                  <strong>Helper:</strong> The academy is charged according to its current stored data at each billing interval.
                  All physical stored data is billable. Deleting files before the next billing interval reduces current storage and reduces subsequent charges.
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'control-panel' && isPlatformAdmin && (
            <Card className="p-6 max-w-2xl">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-200">
                <Settings className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-semibold text-gray-900">Storage Billing Control Panel</h3>
              </div>

              {cpErrorMsg && (
                <div role="alert" className="mb-4 p-3 bg-red-50 text-red-800 text-xs rounded-md border border-red-200">
                  {cpErrorMsg}
                </div>
              )}

              {cpSuccessMsg && (
                <div className="mb-4 p-3 bg-emerald-50 text-emerald-800 text-xs rounded-md flex items-center gap-2 border border-emerald-200">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                  {cpSuccessMsg}
                </div>
              )}

              <div className="space-y-5">
                {/* Toggle Storage Billing */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Storage Billing
                  </label>
                  <div className="flex items-center gap-3 mt-1">
                    <button
                      type="button"
                      onClick={() => setCpEnabled(!cpEnabled)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        cpEnabled ? 'bg-indigo-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          cpEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                    <span className="text-sm font-medium text-gray-900">
                      [{cpEnabled ? 'ON' : 'OFF'}]
                    </span>
                  </div>
                </div>

                {/* Billing Interval Dropdown */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Billing Interval
                  </label>
                  <select
                    value={cpInterval}
                    onChange={(e) => setCpInterval(e.target.value as '10_SECONDS' | '6_HOURS' | '12_HOURS' | '18_HOURS' | '1_DAY')}
                    className="w-full max-w-xs border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="10_SECONDS">10 Seconds — Test</option>
                    <option value="6_HOURS">6 Hours</option>
                    <option value="12_HOURS">12 Hours</option>
                    <option value="18_HOURS">18 Hours</option>
                    <option value="1_DAY">1 Day</option>
                  </select>
                </div>

                {/* Credit Rate per GB */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Credit Rate per GB per Metering Interval
                  </label>
                  <div className="flex items-center gap-2 max-w-xs">
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={cpRate}
                      onChange={(e) => setCpRate(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <span className="text-sm text-gray-600 font-medium">Credits</span>
                  </div>
                </div>

                {/* Helper text */}
                <div className="p-3 bg-gray-50 rounded border border-gray-200 text-xs text-gray-600">
                  The academy accumulates credits for its current stored data at each billing interval. Wallet debits occur at monthly settlement. The rate is per GB per metering interval, not per GB per month.
                </div>

                {/* Save button */}
                <div className="pt-2">
                  <Button
                    onClick={handleSaveCpSettings}
                    disabled={isSavingCp}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <Save className="w-4 h-4" />
                    {isSavingCp ? 'Saving Settings...' : 'Save Settings'}
                  </Button>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'snapshots' && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Periodic Storage Usage Snapshots
                </h3>
                <span className="text-xs text-gray-500">
                  Showing last {snapshots.length} readings
                </span>
              </div>
              {snapshots.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No snapshots recorded yet. Readings are captured automatically during scheduled metering.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-3 px-4">Captured At</th>
                        <th className="py-3 px-4">Storage Usage (GB)</th>
                        <th className="py-3 px-4">Storage Usage (Bytes)</th>
                        <th className="py-3 px-4">File Count</th>
                        <th className="py-3 px-4">Source</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {snapshots.map((snap) => (
                        <tr key={snap.id} className="hover:bg-gray-50">
                          <td className="py-3 px-4 font-medium text-gray-900">
                            {formatDate(snap.captured_at)}
                          </td>
                          <td className="py-3 px-4 font-semibold text-indigo-600">
                            {snap.used_gb} GB
                          </td>
                          <td className="py-3 px-4 text-xs font-mono text-gray-500">
                            {snap.used_bytes.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">{snap.file_count}</td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-700">
                              {snap.source}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}

          {activeTab === 'history' && (
            <Card className="overflow-hidden">
              <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 text-sm">
                  Storage Interval Charge History
                </h3>
              </div>
              {charges.length === 0 ? (
                <div className="p-8 text-center text-gray-500 text-sm">
                  No storage charge records recorded yet. Charges occur automatically at each configured interval.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-gray-600">
                    <thead className="bg-gray-100 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="py-3 px-4">Date & Time</th>
                        <th className="py-3 px-4">Storage</th>
                        <th className="py-3 px-4">Rate</th>
                        <th className="py-3 px-4">Credits Debited</th>
                        <th className="py-3 px-4">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {charges.map((charge) => {
                        const isSuccess = charge.status === 'SUCCESS' || charge.status === 'CHARGED';
                        const debitTime = isSuccess ? charge.debited_at || charge.billing_ended_at || charge.created_at : null;
                        return (
                          <tr key={charge.id} className="hover:bg-gray-50">
                            <td className="py-3 px-4 font-medium text-gray-900">
                              {formatDate(debitTime)}
                            </td>
                            <td className="py-3 px-4 font-semibold text-indigo-600">
                              {charge.storage_gb || charge.used_gb || '0.00'} GB
                            </td>
                            <td className="py-3 px-4 text-xs text-gray-600">
                              {charge.credit_rate_per_gb || charge.rate_per_gb || '0.00'} / GB
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {isSuccess ? (
                                <span className="text-rose-600">
                                  -{Math.abs(Number(charge.charged_credits || charge.credits_debited || 0)).toFixed(2)} Credits
                                </span>
                              ) : (
                                <span className="text-gray-400 font-normal">0 Credits</span>
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isSuccess
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {isSuccess ? 'SUCCESS' : 'FAILED'}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </>
      ) : (
        <Card className="p-8 text-center text-gray-500">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-2" />
          Could not load storage billing information.
        </Card>
      )}
    </div>
  );
};

export default StorageBillingPage;
