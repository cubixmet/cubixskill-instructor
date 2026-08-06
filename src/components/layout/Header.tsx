import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Bell,
  MessageSquare,
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
  Menu,
  Coins,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../features/auth/hooks/useAuth";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { Link, useLocation } from "react-router-dom";

export interface HeaderProps {
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMobileMenu }) => {
  const { user } = useAuth();
  const { logout } = useLogout();
  const location = useLocation();
  const [profileOpen, setProfileOpen] = useState(false);
  const [quickActionOpen, setQuickActionOpen] = useState(false);
  const [dateRange, setDateRange] = useState("Last 30 Days");

  const profileRef = useRef<HTMLDivElement>(null);
  const quickActionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (quickActionRef.current && !quickActionRef.current.contains(e.target as Node)) {
        setQuickActionOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = (pathname: string) => {
    if (pathname.startsWith("/dashboard")) return "Dashboard Overview";
    if (pathname.startsWith("/courses")) return "Course Management";
    if (pathname.startsWith("/credits")) return "Credits & Billing";
    if (pathname.startsWith("/students")) return "Student Directory";
    if (pathname.startsWith("/website-builder")) return "Website Builder";
    if (pathname.startsWith("/staff") || pathname.startsWith("/roles")) return "Staff & Permissions";
    if (pathname.startsWith("/support")) return "Support Desk";
    return "Instructor Workspace";
  };

  return (
    <header className="h-16 bg-white/85 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 transition-all text-left">
      {/* Left: Mobile Toggle & Page Breadcrumb */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="hidden sm:block">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
            CubixSkill Platform
          </p>
          <h2 className="text-sm font-bold text-slate-900 leading-tight">
            {getPageTitle(location.pathname)}
          </h2>
        </div>
      </div>

      {/* Center: Global Search Bar */}
      <div className="flex-1 max-w-md mx-4 hidden md:flex items-center">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search courses, students, reports..."
            className="w-full h-9 pl-9 pr-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2.5">
        {/* Credits Balance Quick Pill */}
        <Link
          to="/credits"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50/80 border border-blue-200/60 text-blue-700 hover:bg-blue-100/80 transition-colors text-xs font-semibold"
        >
          <Coins className="w-3.5 h-3.5 text-blue-600" />
          <span>1,250 Credits</span>
        </Link>

        {/* Date Selector */}
        <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-slate-800">
          <Calendar className="w-3.5 h-3.5 text-blue-600" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-transparent focus:outline-none cursor-pointer text-xs font-semibold text-slate-700"
          >
            <option value="Today">Today</option>
            <option value="Last 7 Days">Last 7 Days</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="This Quarter">This Quarter</option>
            <option value="This Year">This Year</option>
          </select>
        </div>

        {/* Quick Action Dropdown */}
        <div className="relative" ref={quickActionRef}>
          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={() => setQuickActionOpen((prev) => !prev)}
            className="h-9 px-3.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm shadow-blue-600/20 flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Create</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </motion.button>

          <AnimatePresence>
            {quickActionOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-52 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 text-left"
              >
                <Link
                  to="/courses/create"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Create New Course</span>
                </Link>
                <Link
                  to="/students"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <UserPlus className="w-4 h-4 text-emerald-600" />
                  <span>Add Student</span>
                </Link>
                <Link
                  to="/courses"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <FilePlus className="w-4 h-4 text-amber-600" />
                  <span>Create Assignment</span>
                </Link>
                <Link
                  to="/support"
                  onClick={() => setQuickActionOpen(false)}
                  className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  <Megaphone className="w-4 h-4 text-purple-600" />
                  <span>New Announcement</span>
                </Link>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Icon Button */}
        <Link
          to="/support"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white" />
        </Link>

        {/* Messages Icon Button */}
        <Link
          to="/support"
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors relative hidden sm:block"
          title="Messages"
        >
          <MessageSquare className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white" />
        </Link>

        {/* Profile Dropdown */}
        <div className="relative pl-1 border-l border-slate-200" ref={profileRef}>
          <button
            type="button"
            onClick={() => setProfileOpen((prev) => !prev)}
            className="flex items-center space-x-2 p-1 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.full_name?.charAt(0).toUpperCase() || "R"}
            </div>
            <div className="hidden lg:block text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                {user?.full_name || "Dr. Rajesh Varma"}
              </p>
              <p className="text-[10px] font-medium text-slate-500">Instructor</p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </button>

          <AnimatePresence>
            {profileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-slate-200 shadow-xl p-1.5 z-50 text-left"
              >
                <div className="px-3 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">
                    {user?.full_name || "Dr. Rajesh Varma"}
                  </p>
                  <p className="text-[11px] text-slate-500 truncate">
                    {user?.email || "instructor@example.com"}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    to="/dashboard"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50 rounded-xl"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                    <span>Account Settings</span>
                  </Link>
                  <div className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Verified Instructor</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    type="button"
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-xl text-left cursor-pointer"
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
    </header>
  );
};
