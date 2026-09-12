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
  Loader2,
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

  // Video Processing & Feature Settings State
  const [hlsVideoEnabled, setHlsVideoEnabled] = useState<boolean>(true);
  const [lessonLockingEnabled, setLessonLockingEnabled] = useState<boolean>(true);
  const [studentReportsEnabled, setStudentReportsEnabled] = useState<boolean>(true);

  const [isSavingHls, setIsSavingHls] = useState<boolean>(false);
  const [isSavingLessonLocking, setIsSavingLessonLocking] = useState<boolean>(false);
  const [isSavingStudentReports, setIsSavingStudentReports] = useState<boolean>(false);

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

        const [userData, academyData, settingsData] = await Promise.all([
          authService.getCurrentUser().catch(() => null),
          authService.getAcademyProfile().catch(() => null),
          authService.getAcademySettings().catch(() => null),
        ]);

        if (isMounted) {
          if (userData?.user) {
            const u = userData.user as any;
            setFullName(u.full_name || u.name || '');
            setEmail(u.email || '');
            setPhone(u.phone || '');
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
            if (typeof academyData.hls_video_enabled === 'boolean') {
              setHlsVideoEnabled(academyData.hls_video_enabled);
            }
          }

          if (settingsData) {
            if (typeof settingsData.hls_video_enabled === 'boolean') {
              setHlsVideoEnabled(settingsData.hls_video_enabled);
            }
            if (typeof settingsData.lesson_locking === 'boolean') {
              setLessonLockingEnabled(settingsData.lesson_locking);
            }
            if (typeof settingsData.student_reports === 'boolean') {
              setStudentReportsEnabled(settingsData.student_reports);
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

  const handleToggleHls = async (nextVal: boolean) => {
    const prevVal = hlsVideoEnabled;
    setHlsVideoEnabled(nextVal);
    try {
      setIsSavingHls(true);
      await authService.updateAcademySettings({ hls_video_enabled: nextVal });
      showToast(`HLS Video Processing turned ${nextVal ? 'ON' : 'OFF'}.`);
    } catch {
      setHlsVideoEnabled(prevVal);
      setErrorMessage('Failed to update video settings.');
    } finally {
      setIsSavingHls(false);
    }
  };

  const handleToggleLessonLocking = async (nextVal: boolean) => {
    const prevVal = lessonLockingEnabled;
    setLessonLockingEnabled(nextVal);
    try {
      setIsSavingLessonLocking(true);
      await authService.updateAcademySettings({ lesson_locking: nextVal });
      showToast(`Lesson Locking turned ${nextVal ? 'ON' : 'OFF'}.`);
    } catch {
      setLessonLockingEnabled(prevVal);
      setErrorMessage('Failed to update Lesson Locking setting.');
    } finally {
      setIsSavingLessonLocking(false);
    }
  };

  const handleToggleStudentReports = async (nextVal: boolean) => {
    const prevVal = studentReportsEnabled;
    setStudentReportsEnabled(nextVal);
    try {
      setIsSavingStudentReports(true);
      await authService.updateAcademySettings({ student_reports: nextVal });
      showToast(`Student Reports turned ${nextVal ? 'ON' : 'OFF'}.`);
    } catch {
      setStudentReportsEnabled(prevVal);
      setErrorMessage('Failed to update Student Reports setting.');
    } finally {
      setIsSavingStudentReports(false);
    }
  };

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
      setErrorMessage(err?.response?.data?.detail || err?.message || 'Failed to update profile.');
    } finally {
      setIsSavingProfile(false);
    }
  };

  // Change Password Handler
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage('Please fill in all password fields.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('New password and confirm password do not match.');
      return;
    }
    try {
      setIsSavingPassword(true);
      setErrorMessage(null);
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
      setErrorMessage(err?.response?.data?.detail || err?.message || 'Failed to change password.');
    } finally {
      setIsSavingPassword(false);
    }
  };

  // Save General Configuration Handler
  const handleSaveAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSavingAcademy(true);
      setErrorMessage(null);
      await authService.updateAcademyProfile({
        name: academyName.trim(),
        email: academyEmail.trim(),
        phone: academyPhone.trim(),
      });
      showToast('General Academy configuration saved successfully!');
    } catch (err: any) {
      setErrorMessage(err?.response?.data?.detail || err?.message || 'Failed to update academy configuration.');
    } finally {
      setIsSavingAcademy(false);
    }
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip px-3 sm:px-6 py-4 space-y-4 pb-28 md:pb-8 text-left font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-normal">
      {/* TOAST NOTIFICATION */}
      {toastMessage && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 bg-[#0F172A] dark:bg-[#1E293B] text-white font-medium text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-[#334155] animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <div className="px-0.5 min-w-0 w-full">
        <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-tight truncate">
          Settings
        </h1>
        <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal mt-0.5 break-words">
          Manage your personal profile information and Academy configuration.
        </p>
      </div>

      {/* ERROR BANNER */}
      {errorMessage && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2 min-w-0">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span className="break-words text-xs">{errorMessage}</span>
          </div>
          <button type="button" onClick={() => setErrorMessage(null)} className="text-xs font-semibold underline shrink-0 min-h-[44px] px-2">
            Dismiss
          </button>
        </div>
      )}

      {/* 2. TABS */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#263244] gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pt-1 min-w-0 w-full">
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeTab === 'profile'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] font-bold'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('general')}
          className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center gap-2 min-h-[44px] ${
            activeTab === 'general'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] font-bold'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>General Configuration</span>
        </button>
      </div>

      {isLoading ? (
        <div className="p-12 text-center text-[#64748B] dark:text-[#94A3B8] w-full">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2563EB]" />
          <p className="mt-2 text-xs font-medium">Loading settings configuration...</p>
        </div>
      ) : (
        <>
          {/* 3. TAB 1: PROFILE */}
          {activeTab === 'profile' && (
            <div className="space-y-4 max-w-3xl min-w-0 w-full">
              {/* PROFILE SUMMARY HEADER */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center gap-4 min-w-0 w-full">
                {avatarUrl ? (
                  <img src={resolveMediaUrl(avatarUrl)} alt={fullName} className="w-14 h-14 rounded-2xl object-cover border border-[#CBD5E1] dark:border-[#334155] shrink-0" />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.14)] text-[#2563EB] dark:text-[#60A5FA] border border-[#BFDBFE] dark:border-[rgba(59,130,246,0.22)] font-bold text-lg flex items-center justify-center shrink-0 select-none shadow-2xs">
                    {initials(fullName)}
                  </div>
                )}
                <div className="min-w-0 flex-1 w-full">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words">
                      {fullName || 'Staff User'}
                    </h2>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]">
                      {roleName}
                    </span>
                  </div>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal break-words mt-0.5">{email}</p>
                </div>
              </div>

              {/* PERSONAL DETAILS FORM */}
              <form onSubmit={handleSaveProfile} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Personal Information</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Input
                    label="Full Name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Vikramaditya Roy"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />

                  <Input
                    label="Phone Number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1] flex items-center justify-between gap-1 flex-wrap">
                      <span>Work Email</span>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">Read-only login identity</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={email}
                        disabled
                        className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-base sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-medium cursor-not-allowed min-h-[44px]"
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
                        className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-slate-100 dark:bg-[#0F172A] text-base sm:text-xs text-[#64748B] dark:text-[#94A3B8] font-medium cursor-not-allowed min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2 w-full">
                  <Button
                    type="submit"
                    disabled={isSavingProfile}
                    leftIcon={isSavingProfile ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[44px] sm:min-h-[40px] px-5 rounded-xl shadow-xs cursor-pointer w-full sm:w-auto text-sm"
                  >
                    {isSavingProfile ? 'Saving Profile...' : 'Save Profile'}
                  </Button>
                </div>
              </form>

              {/* CHANGE PASSWORD FORM */}
              <form onSubmit={handleChangePassword} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Security &amp; Change Password</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                  <Input
                    label="Current Password"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />

                  <Input
                    label="New Password"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />

                  <Input
                    label="Confirm New Password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />
                </div>

                <div className="flex justify-end pt-1 w-full">
                  <Button
                    type="submit"
                    disabled={isSavingPassword}
                    variant="outline"
                    className="font-medium min-h-[44px] sm:min-h-[38px] px-4 rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] cursor-pointer w-full sm:w-auto text-sm"
                  >
                    {isSavingPassword ? 'Updating Password...' : 'Change Password'}
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* 4. TAB 2: GENERAL CONFIGURATION */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveAcademy} className="space-y-4 max-w-3xl min-w-0 w-full">
              {/* ACADEMY INFORMATION */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                <div className="flex items-center gap-3">
                  {academyLogoUrl ? (
                    <img src={resolveMediaUrl(academyLogoUrl)} alt={academyName} className="w-10 h-10 rounded-xl object-contain border border-[#E2E8F0] dark:border-[#334155] shrink-0" />
                  ) : (
                    <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                      <Building className="w-5 h-5" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Academy Information</h3>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] break-words">Configure primary academy details and contact metadata.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Input
                    label="Academy Name"
                    value={academyName}
                    onChange={(e) => setAcademyName(e.target.value)}
                    placeholder="e.g. CubixSkill Academy"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />

                  <Input
                    label="Academy Support Email"
                    type="email"
                    value={academyEmail}
                    onChange={(e) => setAcademyEmail(e.target.value)}
                    placeholder="support@cubixskill.com"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <Input
                    label="Contact Phone"
                    value={academyPhone}
                    onChange={(e) => setAcademyPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
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
                        className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* REGIONAL & APP DEFAULTS */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-4 min-w-0 w-full">
                <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>Regional &amp; Application Defaults</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Timezone</label>
                    <select
                      value={timezone}
                      onChange={(e) => setTimezone(e.target.value)}
                      className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
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
                      className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
                    >
                      <option value="INR">INR (₹ - Indian Rupee)</option>
                      <option value="USD">USD ($ - US Dollar)</option>
                      <option value="EUR">EUR (€ - Euro)</option>
                      <option value="GBP">GBP (£ - British Pound)</option>
                      <option value="AED">AED (AED - UAE Dirham)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Date Format</label>
                    <select
                      value={dateFormat}
                      onChange={(e) => setDateFormat(e.target.value)}
                      className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
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
                      className="w-full h-11 sm:h-10 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
                    >
                      <option value="12h">12-hour (e.g. 02:30 PM)</option>
                      <option value="24h">24-hour (e.g. 14:30)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* VIDEO PROCESSING & STREAMING SETTINGS */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Video Processing</h3>
                      {hlsVideoEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          HLS ON
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          HLS OFF (Direct MP4)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed break-words">
                      {hlsVideoEnabled
                        ? 'Convert newly uploaded academy videos to HLS for reliable browser and mobile streaming.'
                        : 'Videos will be stored and played directly without HLS conversion.'}
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-[#263244] min-h-[44px]">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                      HLS Video Upload
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none min-h-[44px] min-w-[44px] flex items-center">
                      <input
                        type="checkbox"
                        checked={hlsVideoEnabled}
                        disabled={isSavingHls}
                        onChange={(e) => handleToggleHls(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]" />
                    </label>
                  </div>
                </div>
              </div>

              {/* LESSON LOCKING FEATURE SETTING */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Lesson Locking</h3>
                      {lessonLockingEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          ON (Sequential Unlock)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          OFF (Free Access)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed break-words">
                      Require students to complete lessons sequentially before unlocking subsequent lessons.
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-[#263244] min-h-[44px]">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                      Lesson Locking
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none min-h-[44px] min-w-[44px] flex items-center">
                      <input
                        type="checkbox"
                        checked={lessonLockingEnabled}
                        disabled={isSavingLessonLocking}
                        onChange={(e) => handleToggleLessonLocking(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]" />
                    </label>
                  </div>
                </div>
              </div>

              {/* STUDENT REPORTS FEATURE SETTING */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 shadow-2xs space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Student Reports & Progress Visibility</h3>
                      {studentReportsEnabled ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40">
                          ON (Progress Visible)
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40">
                          OFF (Progress Hidden)
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed break-words">
                      Display course completion percentages and progress bars in instructor student tables and student portals.
                    </p>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-[#E2E8F0] dark:border-[#263244] min-h-[44px]">
                    <span className="text-xs font-semibold text-[#0F172A] dark:text-[#CBD5E1]">
                      Student Reports
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer select-none min-h-[44px] min-w-[44px] flex items-center">
                      <input
                        type="checkbox"
                        checked={studentReportsEnabled}
                        disabled={isSavingStudentReports}
                        onChange={(e) => handleToggleStudentReports(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-12 h-6 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#2563EB]" />
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2 w-full">
                <Button
                  type="submit"
                  disabled={isSavingAcademy}
                  leftIcon={isSavingAcademy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[44px] sm:min-h-[40px] px-5 rounded-xl shadow-xs cursor-pointer w-full sm:w-auto text-sm"
                >
                  {isSavingAcademy ? 'Saving Configuration...' : 'Save Configuration'}
                </Button>
              </div>
            </form>
          )}
        </>
      )}
    </div>
  );
};

export default SettingsPage;
