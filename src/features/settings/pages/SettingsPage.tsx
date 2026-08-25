import React, { useState, useEffect } from 'react';
import {
  User,
  Building,
  CheckCircle2,
  AlertCircle,
  Save,
  Lock,
  Mail,
  Shield,
  Clock,
  Globe,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { authService } from '../../../services/auth.service';
import { resolveMediaUrl } from '../../../utils/media.utils';

function initials(name: string) {
  if (!name) return 'US';
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'profile' | 'general'>('profile');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSavingProfile, setIsSavingProfile] = useState<boolean>(false);
  const [isSavingAcademy, setIsSavingAcademy] = useState<boolean>(false);
  const [isSavingPassword, setIsSavingPassword] = useState<boolean>(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Profile Form States
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [roleCode, setRoleCode] = useState('');
  const [roleName, setRoleName] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Password States
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // General Academy Configuration States
  const [academyName, setAcademyName] = useState('');
  const [academyEmail, setAcademyEmail] = useState('');
  const [academyPhone, setAcademyPhone] = useState('');
  const [academyWebsite, setAcademyWebsite] = useState('');
  const [academyLogoUrl, setAcademyLogoUrl] = useState<string | null>(null);
  const [timezone, setTimezone] = useState('Asia/Kolkata');
  const [currency, setCurrency] = useState('INR');
  const [dateFormat, setDateFormat] = useState('DD/MM/YYYY');
  const [timeFormat, setTimeFormat] = useState('12h');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Load initial User & Academy data from real backend
  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        setIsLoading(true);
        setErrorMessage(null);

        const [userData, academyData] = await Promise.all([
          authService.getCurrentUser().catch(() => null),
          authService.getAcademyProfile().catch(() => null),
        ]);

        if (isMounted) {
          if (userData?.user) {
            const u = userData.user as any;
            setFullName(u.full_name || u.name || '');
            setEmail(u.email || '');
            setPhone(u.phone || '');
            setRoleCode(u.role_code || 'ACADEMY_ADMIN');
            setRoleName(u.role_code === 'ACADEMY_ADMIN' ? 'Academy Admin' : 'Academy Staff');
            if (u.avatar || u.avatar_url) {
              setAvatarUrl(u.avatar_url || u.avatar);
            }
          }

          if (academyData) {
            setAcademyName(academyData.name || '');
            setAcademyEmail(academyData.email || '');
            setAcademyPhone(academyData.phone || '');
            setAcademyWebsite(academyData.slug ? `https://${academyData.slug}.cubixskill.com` : '');
            if (academyData.logo_url) {
              setAcademyLogoUrl(academyData.logo_url);
            }
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setErrorMessage('Failed to load settings data from server.');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  // Save Profile Handler
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingProfile(true);
      await authService.updateUserProfile({
        full_name: fullName.trim(),
        phone: phone.trim(),
      });
      showToast('Profile information updated successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      alert('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }
    try {
      setIsSavingPassword(true);
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword,
      });
      showToast('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Save General Configuration Handler
  const handleSaveAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingAcademy(true);
      await authService.updateAcademyProfile({
        name: academyName.trim(),
        email: academyEmail.trim(),
        phone: academyPhone.trim(),
      });
      showToast('General Academy configuration saved successfully!');
    } catch (err: any) {
      alert(err?.response?.data?.detail || err?.message || 'Failed to update academy configuration.');
    } finally {
      setIsSavingAcademy(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4 pb-24 md:pb-8 text-left font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-normal">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[#0F172A] dark:bg-[#1E293B] text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="px-0.5 min-w-0">
        <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-tight truncate">
          Settings
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal mt-0.5 truncate">
          Manage your personal profile information and Academy configuration.
        </p>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 2. TABS */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#263244] gap-6 overflow-x-auto scrollbar-hide pt-1">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'profile'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] font-bold'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <User className="w-4 h-4" />
          Profile
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 ${
            activeTab === 'general'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] font-bold'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Building className="w-4 h-4" />
          General Configuration
        </button>
      </div>

      {/* 3. TAB 1: PROFILE */}
      {activeTab === 'profile' && (
        <div className="space-y-4 max-w-3xl min-w-0">
          {/* PROFILE SUMMARY HEADER */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0">
            {avatarUrl ? (
              <img src={resolveMediaUrl(avatarUrl)} alt={fullName} className="w-14 h-14 rounded-2xl object-cover border border-[#CBD5E1] dark:border-[#334155]" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.14)] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[rgba(59,130,246,0.22)] font-bold text-lg flex items-center justify-center shrink-0 select-none shadow-2xs">
                {initials(fullName)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                  {fullName || 'Staff User'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]">
                  {roleName}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal truncate mt-0.5">{email}</p>
            </div>
          </div>

          {/* PERSONAL DETAILS FORM */}
          <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Personal Information</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Vikramaditya Roy"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />

              <Input
                label="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] flex items-center justify-between">
                  <span>Work Email</span>
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Read-only login identity</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-xs text-[#64748B] dark:text-[#94A3B8] font-medium cursor-not-allowed"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Assigned System Role</label>
                <div className="relative">
                  <Shield className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={roleName}
                    disabled
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-xs text-[#64748B] dark:text-[#94A3B8] font-medium cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSavingProfile}
                leftIcon={<Save className="w-4 h-4" />}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium h-[40px] px-5 rounded-xl shadow-xs cursor-pointer"
              >
                {isSavingProfile ? 'Saving Profile...' : 'Save Profile'}
              </Button>
            </div>
          </form>

          {/* CHANGE PASSWORD FORM */}
          <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Security &amp; Change Password</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input
                label="Current Password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />

              <Input
                label="New Password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />

              <Input
                label="Confirm New Password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <Button
                type="submit"
                disabled={isSavingPassword}
                variant="outline"
                className="font-medium h-[38px] px-4 rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] cursor-pointer"
              >
                {isSavingPassword ? 'Updating Password...' : 'Change Password'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* 4. TAB 2: GENERAL CONFIGURATION */}
      {activeTab === 'general' && (
        <form onSubmit={handleSaveAcademy} className="space-y-4 max-w-3xl min-w-0">
          {/* ACADEMY INFORMATION */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
            <div className="flex items-center gap-3">
              {academyLogoUrl ? (
                <img src={resolveMediaUrl(academyLogoUrl)} alt={academyName} className="w-10 h-10 rounded-xl object-contain border border-[#E2E8F0] dark:border-[#334155]" />
              ) : (
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                  <Building className="w-5 h-5" />
                </div>
              )}
              <div>
                <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Academy Information</h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Configure primary academy details and contact metadata.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Academy Name"
                value={academyName}
                onChange={(e) => setAcademyName(e.target.value)}
                placeholder="e.g. CubixSkill Academy"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />

              <Input
                label="Academy Support Email"
                type="email"
                value={academyEmail}
                onChange={(e) => setAcademyEmail(e.target.value)}
                placeholder="support@cubixskill.com"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Contact Phone"
                value={academyPhone}
                onChange={(e) => setAcademyPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
              />

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Storefront Website URL</label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={academyWebsite}
                    onChange={(e) => setAcademyWebsite(e.target.value)}
                    placeholder="https://academy.cubixskill.com"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* REGIONAL & APP DEFAULTS */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0">
            <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
              Regional &amp; Application Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+05:30)</option>
                  <option value="UTC">UTC (Universal Coordinated Time)</option>
                  <option value="America/New_York">America/New_York (EST, UTC-05:00)</option>
                  <option value="Europe/London">Europe/London (GMT, UTC+00:00)</option>
                  <option value="Asia/Dubai">Asia/Dubai (GST, UTC+04:00)</option>
                  <option value="Asia/Singapore">Asia/Singapore (SGT, UTC+08:00)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Default Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="INR">INR (₹ - Indian Rupee)</option>
                  <option value="USD">USD ($ - US Dollar)</option>
                  <option value="EUR">EUR (€ - Euro)</option>
                  <option value="GBP">GBP (£ - British Pound)</option>
                  <option value="AED">AED (AED - UAE Dirham)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Date Format</label>
                <select
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="DD/MM/YYYY">DD/MM/YYYY (e.g. 22/08/2026)</option>
                  <option value="MM/DD/YYYY">MM/DD/YYYY (e.g. 08/22/2026)</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD (e.g. 2026-08-22)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Time Format</label>
                <select
                  value={timeFormat}
                  onChange={(e) => setTimeFormat(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="12h">12-hour (e.g. 02:30 PM)</option>
                  <option value="24h">24-hour (e.g. 14:30)</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={isSavingAcademy}
              leftIcon={<Save className="w-4 h-4" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium h-[40px] px-5 rounded-xl shadow-xs cursor-pointer"
            >
              {isSavingAcademy ? 'Saving Configuration...' : 'Save Configuration'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
