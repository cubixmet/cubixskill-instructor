import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthStore } from "../../store/auth.store";
import { getFilteredNavigation, type NavItemConfig } from "../../config/navigation.config";
import { getUserInitials, getAcademyInitials, getRoleLabel } from "../../utils/branding.utils";
import { cn } from "../../lib/cn";

export interface SidebarProps {
  onCloseMobile?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isMobileDrawer?: boolean;
}

export function isNavItemActive(href: string, pathname: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname === "/";
  }

  if (href === "/courses") {
    return pathname.startsWith("/courses") && !pathname.startsWith("/courses/categories");
  }

  if (href === "/payments") {
    return pathname.startsWith("/payments") || pathname === "/settings/payments";
  }

  if (href === "/coupons") return pathname.startsWith("/coupons");
  if (href === "/students") return pathname.startsWith("/students");
  if (href === "/assignments") return pathname.startsWith("/assignments");
  if (href === "/quizzes") return pathname.startsWith("/quizzes");
  if (href === "/certificates") return pathname.startsWith("/certificates");
  if (href === "/discussions") return pathname.startsWith("/discussions");
  if (href === "/announcements") return pathname.startsWith("/announcements");
  if (href === "/live-classroom") return pathname.startsWith("/live-classroom");
  if (href === "/reports") return pathname.startsWith("/reports");
  if (href === "/credits") return pathname.startsWith("/credits");
  if (href === "/fees") return pathname.startsWith("/fees");
  if (href === "/media") return pathname.startsWith("/media");
  if (href === "/staff") return pathname.startsWith("/staff");
  if (href === "/roles") return pathname.startsWith("/roles");
  if (href === "/website-builder") return pathname.startsWith("/website-builder");
  if (href === "/support") return pathname.startsWith("/support");
  if (href === "/settings") return pathname.startsWith("/settings") && !pathname.startsWith("/settings/payments");

  return pathname === href || pathname.startsWith(`${href}/`);
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
}) => {
  const { user, academy, logout, isInitializing, isLoadingAcademyProfile } = useAuthStore();
  const location = useLocation();

  const collapsed = isMobileDrawer ? false : isCollapsed;
  const navSections = getFilteredNavigation();

  const isLoadingBranding = (isInitializing || isLoadingAcademyProfile) && !academy;

  return (
    <aside
      className={cn(
        "bg-white dark:bg-[#0B1120] border-r border-slate-200/80 dark:border-[#1E293B] flex flex-col shrink-0 select-none text-left transition-all duration-300 ease-in-out z-40",
        isMobileDrawer
          ? "w-full h-full"
          : "fixed top-0 left-0 bottom-0 h-screen",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] shrink-0">
        <div className={cn("flex items-center gap-3 min-w-0", collapsed && "justify-center w-full")}>
          {academy?.logo_url ? (
            <img
              src={academy.logo_url}
              alt={academy.name || "Academy Logo"}
              className="w-9 h-9 rounded-xl object-cover shrink-0 border border-slate-200/80 dark:border-[#263244] shadow-xs"
            />
          ) : (
            <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-md shadow-blue-600/20 shrink-0">
              {getAcademyInitials(academy?.name)}
            </div>
          )}

          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              {isLoadingBranding ? (
                <div className="space-y-1 py-1">
                  <div className="h-4 w-28 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
                  <div className="h-2.5 w-16 bg-slate-100 dark:bg-slate-800 animate-pulse rounded" />
                </div>
              ) : (
                <>
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50 tracking-tight block leading-tight truncate">
                    {academy?.name || "CubixSkill Academy"}
                  </h3>
                  <p className="text-[10px] font-medium text-blue-600 dark:text-blue-300 uppercase tracking-wider block truncate">
                    Academy Workspace
                  </p>
                </>
              )}
            </div>
          )}
        </div>

        {!isMobileDrawer && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/5 transition-colors cursor-pointer shrink-0",
              collapsed && "absolute right-2 top-4"
            )}
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Navigation Groups */}
      <nav className="flex-1 px-3 py-4 space-y-6 overflow-y-auto no-scrollbar">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed ? (
              <h4 className="px-3 text-[11px] font-semibold text-slate-400 dark:text-[#7CA9DB] uppercase tracking-wider mb-2">
                {section.group}
              </h4>
            ) : (
              <div className="h-px bg-slate-100 dark:bg-[#1E293B] my-3" />
            )}
            {section.items.map((item) => {
              const active = isNavItemActive(item.href, location.pathname);

              return (
                <div key={item.href} className="space-y-1">
                  <NavLink
                    to={item.href}
                    onClick={onCloseMobile}
                    title={collapsed ? item.label : undefined}
                    className={() =>
                      cn(
                        "flex items-center gap-3 min-h-[40px] px-3 rounded-xl text-xs font-medium transition-all duration-200 group cursor-pointer",
                        collapsed && "justify-center",
                        active
                          ? "bg-blue-50 text-blue-600 border border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 font-semibold"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-white/5 dark:hover:text-white border border-transparent"
                      )
                    }
                  >
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center">
                      <item.icon
                        className={cn(
                          "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                          active
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-slate-400 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-white"
                        )}
                      />
                    </div>
                    {!collapsed && (
                      <span className="flex-1 leading-none truncate">{item.label}</span>
                    )}
                  </NavLink>

                  {/* Sub-items for expanded menu */}
                  {!collapsed && active && item.children && item.children.length > 0 && (
                    <div className="pl-9 pr-2 space-y-1 py-1">
                      {item.children.map((child) => {
                        const childActive = location.pathname === child.href;
                        return (
                          <NavLink
                            key={child.href}
                            to={child.href}
                            onClick={onCloseMobile}
                            className={cn(
                              "block px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors cursor-pointer",
                              childActive
                                ? "bg-blue-100/60 dark:bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/50 dark:hover:bg-white/5"
                            )}
                          >
                            {child.label}
                          </NavLink>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile & Logout Footer */}
      <div className="p-3 border-t border-slate-100 dark:border-[#1E293B] bg-transparent space-y-2 shrink-0 mt-auto">
        <div
          className={cn(
            "flex items-center rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] shadow-xs",
            collapsed ? "justify-center p-2" : "gap-3 p-2.5"
          )}
          title={collapsed ? user?.full_name || "Maggie Mclaughlin" : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
            {getUserInitials(user?.full_name)}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-900 dark:text-slate-50 truncate">
                {user?.full_name || "Maggie Mclaughlin"}
              </p>
              <p className="text-[10px] font-normal text-slate-500 dark:text-slate-400 truncate">
                {getRoleLabel(user?.role, user?.assigned_role_name)}
              </p>
            </div>
          )}
        </div>

        <motion.button
          type="button"
          onClick={logout}
          whileTap={{ scale: 0.98 }}
          title={collapsed ? "Sign Out" : undefined}
          className={cn(
            "w-full flex items-center rounded-xl text-xs font-bold bg-[#FFF7F7] border border-[#FECACA] text-[#DC2626] dark:bg-[rgba(239,68,68,0.08)] dark:border-[rgba(239,68,68,0.20)] dark:text-[#F87171] hover:bg-rose-100 dark:hover:bg-[rgba(239,68,68,0.14)] transition-colors cursor-pointer",
            collapsed ? "justify-center p-2.5" : "justify-center gap-2 px-3 py-2"
          )}
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </motion.button>
      </div>
    </aside>
  );
};
