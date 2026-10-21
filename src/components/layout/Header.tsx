import React, { useState, useRef, useEffect } from "react";
import {
  Bell,
  Plus,
  ChevronDown,
  Calendar,
  ShieldCheck,
  LogOut,
  SlidersHorizontal,
  BookOpen,
  UserPlus,
  FilePlus,
  Megaphone,
  Coins,
  KeyRound,
  Sun,
  Moon,
  Search,
  GraduationCap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { useTheme } from "../../hooks/useTheme";
import { Link, useLocation } from "react-router-dom";
import { Drawer } from "../ui/Drawer";
import { DesktopGlobalSearch } from "../global-search/DesktopGlobalSearch";
import { MobileGlobalSearch } from "../global-search/MobileGlobalSearch";
import { getUserInitials, getRoleLabel } from "../../utils/branding.utils";

import { useCreditSummary } from "../../hooks/useCreditSummary";
import { useAcademyEventsSocket } from "../../hooks/useAcademyEventsSocket";

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  useAcademyEventsSocket();

  const { user, academy, logout } = useAuthStore();
  const { setTheme, resolvedTheme } = useTheme();
  const location = useLocation();

  const { summary } = useCreditSummary();
  const rawBalanceNum = Number(summary?.balance || 0);
  const creditBalance = summary ? rawBalanceNum.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 }) : "0";
  const isLowBalance = Boolean(summary?.is_low_balance);

  const [profileOpen, setProfileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [mobileCreateDrawerOpen, setMobileCreateDrawerOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  // Close popups on click outside & Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setProfileOpen(false);
        setQuickActionOpen(false);
        setMobileCreateDrawerOpen(false);
        setMobileSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/courses")) return "Course Management";
    if (pathname.startsWith("/credits")) return "Credits & Billing";
    if (pathname.startsWith("/fees")) return "Fees Collection";
    if (pathname.startsWith("/students")) return "Student Directory";
    if (pathname.startsWith("/website-builder")) return "Website Builder";
    if (pathname.startsWith("/staff")) return "Staff Directory";
    if (pathname.startsWith("/roles")) return "Roles & Access";
    if (pathname.startsWith("/support")) return "Support Desk";
    return "Academy Workspace";
  };

  const createActions = [
    {
      label: "Create New Course",
      description: "Wizard to build modules & lessons",
      href: "/courses/create",
      icon: BookOpen,
      iconColor: "text-blue-600 bg-blue-50",
    },
    {
      label: "Add Student",
      description: "Enroll or send invitation",
      href: "/students/create",
      icon: UserPlus,
      iconColor: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Create Assignment",
      description: "Add project prompt & rubric",
      href: "/assignments",
      icon: FilePlus,
      iconColor: "text-amber-600 bg-amber-50",
    },
    {
      label: "New Announcement",
      description: "Broadcast message to academy",
      href: "/announcements",
      icon: Megaphone,
      iconColor: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <header className="bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] sticky top-0 z-30 transition-all text-left font-sans">
      {/* ========================================== */}
      {/* MOBILE NAVBAR (COMPACT PREMIUM SAAS HEADER < lg) */}
      {/* ========================================== */}
      <div className="xl:hidden px-3.5 sm:px-4 py-2.5 flex items-center justify-between gap-2 min-h-[56px]">
        {/* Left: CubixSkill Logo Branding */}
        <Link to="/dashboard" className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2563EB] rounded-xl flex items-center justify-center text-white shadow-xs shrink-0">
            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left leading-none min-w-0">
            <span className="text-sm sm:text-lg font-bold tracking-tight whitespace-nowrap text-[var(--text-primary)]">
              Cubix<span className="text-[#2563EB]">Skill</span>
            </span>
            <span className="block text-[9px] font-semibold text-[var(--text-muted)] tracking-wider uppercase mt-0.5">
              Instructor
            </span>
          </div>
        </Link>

        {/* Right: [search] [theme] [notification] [avatar] */}
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          <button
            type="button"
            onClick={() => setMobileSearchOpen((prev) => !prev)}
            aria-label="Search"
            className="min-h-10 min-w-10 flex items-center justify-center p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl transition-colors cursor-pointer"
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle Theme"
            className="min-h-10 min-w-10 flex items-center justify-center p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl transition-colors cursor-pointer"
          >
            {resolvedTheme === 'dark' ? (
              <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
            )}
          </button>

          <Link
            to="/support"
            aria-label="Notifications"
            className="min-h-10 min-w-10 flex items-center justify-center p-2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl transition-colors relative cursor-pointer"
          >
            <Bell className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white dark:ring-[#0B1120]" />
          </Link>

          <button
            type="button"
            onClick={onOpenMobileMenu}
            aria-label="User Profile & Menu"
            className="w-10 h-10 shrink-0 rounded-full bg-[#2563EB] text-white font-bold text-xs sm:text-sm flex items-center justify-center shadow-xs cursor-pointer ml-0.5"
          >
            {getUserInitials(user?.full_name) || "S"}
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="xl:hidden px-3.5 pb-2.5">
          <MobileGlobalSearch />
        </div>
      )}

      {/* ========================================== */}
      {/* DESKTOP NAVBAR (SINGLE-ROW STRUCTURE >= lg) */}
      {/* ========================================== */}
      <div className="hidden xl:flex h-16 px-6 items-center justify-between">
        {/* Desktop Page Title Breadcrumb */}
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] truncate">
            {academy?.name || "CubixSkill Academy"}
          </p>

          <h2 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-tight truncate">
            {getPageTitle(location.pathname)}
          </h2>
        </div>

        {/* Desktop Global Search Bar */}
        <div className="flex-1 max-w-md mx-6 flex items-center">
          <DesktopGlobalSearch />
        </div>

        {/* Desktop Actions & Profile */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Credits Pill */}
          <Link
            to="/credits"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-colors text-xs font-semibold shrink-0 ${
              isLowBalance
                ? "bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400"
                : "bg-blue-50 border border-blue-200/80 text-blue-700 hover:bg-blue-100/80"
            }`}
            title={isLowBalance ? "Low Credit Balance - Click to Buy" : "View Credits Wallet"}
          >
            <Coins className={`w-3.5 h-3.5 shrink-0 ${isLowBalance ? "text-amber-600 dark:text-amber-400" : "text-blue-600"}`} />
            <span className="text-xs">{creditBalance}</span>
            <span className="text-[11px]">Credits</span>
          </Link>

          {/* Date Selector */}
          <div className="hidden xl:flex items-center gap-1.5 bg-slate-50 dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC]">
            <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold text-slate-700 dark:text-[#F8FAFC]"
            >
              <option value="Today" className="dark:bg-[#111827]">Today</option>
              <option value="Last 7 Days" className="dark:bg-[#111827]">Last 7 Days</option>
              <option value="Last 30 Days" className="dark:bg-[#111827]">Last 30 Days</option>
              <option value="This Quarter" className="dark:bg-[#111827]">This Quarter</option>
              <option value="This Year" className="dark:bg-[#111827]">This Year</option>
            </select>
          </div>

          {/* Quick Create Dropdown */}
          <div className="relative" ref={quickActionRef}>
            <motion.button
              type="button"
              whileTap={{ scale: 0.98 }}
              onClick={() => setQuickActionOpen((prev) => !prev)}
              className="h-9 px-3.5 bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Create</span>
              <ChevronDown className="w-3 h-3 opacity-80" />
            </motion.button>

            <AnimatePresence>
              {quickActionOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-64 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/90 dark:border-[#263244] shadow-xl p-1.5 z-50 text-left max-h-[80vh] overflow-y-auto"
                >
                  <div className="px-3 py-1.5 border-b border-slate-100 dark:border-[#263244]">
                    <p className="text-[11px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                      Quick Actions
                    </p>
                  </div>
                  <div className="py-1 space-y-0.5">
                    {createActions.map((action) => (
                      <Link
                        key={action.href}
                        to={action.href}
                        onClick={() => setQuickActionOpen(false)}
                        className="flex items-center gap-3 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033] rounded-xl transition-colors group"
                      >
                        <div className={`p-1.5 rounded-lg shrink-0 ${action.iconColor}`}>
                          <action.icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-900 dark:text-[#F8FAFC] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                            {action.label}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-[#94A3B8] font-normal truncate">
                            {action.description}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Theme Mode Quick Switcher */}
          <button
            type="button"
            onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#172033] rounded-xl transition-colors flex items-center justify-center min-h-[38px] min-w-[38px] cursor-pointer"
            title={`Switch to ${resolvedTheme === 'dark' ? 'Light' : 'Dark'} Mode`}
            aria-label="Toggle Theme"
          >
            {resolvedTheme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Notifications Icon */}
          <Link
            to="/support"
            className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-[#172033] rounded-xl transition-colors relative flex items-center justify-center min-h-[38px] min-w-[38px]"
            title="Notifications Desk"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-[#0B1120]" />
          </Link>

          {/* Profile Dropdown */}
          <div className="relative pl-1 border-l border-slate-200 dark:border-slate-800" ref={profileRef}>
            <button
              type="button"
              onClick={() => setProfileOpen((prev) => !prev)}
              className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
                {getUserInitials(user?.full_name)}
              </div>
              <div className="text-left min-w-0 max-w-36">
                <p className="truncate text-xs font-medium text-slate-900 dark:text-slate-50 leading-tight">
                  {user?.full_name || "Maggie Mclaughlin"}
                </p>
                <p className="text-[10px] font-normal text-slate-500 dark:text-slate-400">
                  {getRoleLabel(user?.role, user?.assigned_role_name)}
                </p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-500 dark:text-[#94A3B8] group-hover:text-slate-900 dark:group-hover:text-white transition-colors" />
            </button>

            <AnimatePresence>
              {profileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.96 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-xl p-1.5 z-50 text-left"
                >
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-[#263244]">
                    <p className="text-xs font-semibold text-slate-900 dark:text-slate-50">
                      {user?.full_name || "Maggie Mclaughlin"}
                    </p>
                    <p className="text-[11px] font-normal text-slate-500 dark:text-slate-400 truncate">
                      {user?.email || ""}
                    </p>
                  </div>

                  <div className="py-1 space-y-0.5">
                    <Link
                      to="/settings"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033] rounded-xl transition-colors"
                    >
                      <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Account Settings</span>
                    </Link>
                    <Link
                      to="/change-password"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-[#F8FAFC] hover:bg-slate-50 dark:hover:bg-[#172033] rounded-xl transition-colors"
                    >
                      <KeyRound className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                      <span>Change Password</span>
                    </Link>
                    <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Verified Account</span>
                    </div>
                  </div>

                  <div className="border-t border-slate-100 dark:border-[#263244] pt-1">
                    <button
                      type="button"
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl text-left cursor-pointer transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* MOBILE CREATE BOTTOM SHEET DRAWER */}
      <Drawer
        isOpen={mobileCreateDrawerOpen}
        onClose={() => setMobileCreateDrawerOpen(false)}
        side="right"
        size="sm"
        title="Quick Creation Menu"
      >
        <div className="space-y-3 text-left font-sans pb-6">
          <p className="text-xs text-slate-500">
            Select an action to launch creation wizards or registration forms.
          </p>
          <div className="space-y-2">
            {createActions.map((action) => (
              <Link
                key={action.href}
                to={action.href}
                onClick={() => setMobileCreateDrawerOpen(false)}
                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/80 border border-slate-200/80 transition-all group"
              >
                <div className={`p-2 rounded-xl ${action.iconColor} shrink-0`}>
                  <action.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                    {action.label}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {action.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Drawer>
    </header>
  );
};

