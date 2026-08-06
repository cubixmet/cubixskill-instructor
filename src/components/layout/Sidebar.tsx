import React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  FileCheck,
  HelpCircle,
  Award,
  BarChart3,
  CreditCard,
  Layers,
  MessageSquare,
  Megaphone,
  Video,
  Settings,
  HelpCircle as SupportIcon,
  Globe,
  UserCheck,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useLogout } from "../../features/auth/hooks/useLogout";
import { useAuth } from "../../features/auth/hooks/useAuth";
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
    const isSubFeature =
      pathname.includes("/discussions") ||
      pathname.includes("/announcements") ||
      pathname.includes("/assignments") ||
      pathname.includes("/quizzes") ||
      pathname.includes("/certificates") ||
      pathname.includes("/students") ||
      pathname.includes("/reports") ||
      pathname.includes("/settings");
    return !isSubFeature && pathname.startsWith("/courses");
  }

  if (href === "/students") return pathname.includes("/students");
  if (href === "/assignments") return pathname.includes("/assignments");
  if (href === "/quizzes") return pathname.includes("/quizzes");
  if (href === "/certificates") return pathname.includes("/certificates");
  if (href === "/discussions") return pathname.includes("/discussions");
  if (href === "/announcements") return pathname.includes("/announcements");
  if (href === "/live-classroom") return pathname.includes("/live-classroom");
  if (href === "/reports") return pathname.includes("/reports") && !pathname.startsWith("/students");
  if (href === "/credits") return pathname.startsWith("/credits");
  if (href === "/media") return pathname.startsWith("/media");
  if (href === "/staff") return pathname.startsWith("/staff");
  if (href === "/roles") return pathname.startsWith("/roles");
  if (href === "/website-builder") return pathname.startsWith("/website-builder");
  if (href === "/support") return pathname.startsWith("/support");
  if (href === "/settings") return pathname.includes("/settings") && !pathname.startsWith("/courses/create");

  return pathname.startsWith(href);
}

export const Sidebar: React.FC<SidebarProps> = ({
  onCloseMobile,
  isCollapsed = false,
  onToggleCollapse,
  isMobileDrawer = false,
}) => {
  const { logout } = useLogout();
  const { user } = useAuth();
  const location = useLocation();

  const collapsed = isMobileDrawer ? false : isCollapsed;

  const navSections = [
    {
      group: "Overview",
      items: [
        { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
        { label: "Courses", href: "/courses", icon: BookOpen },
        { label: "Students", href: "/students", icon: Users },
        { label: "Reports & Analytics", href: "/reports", icon: BarChart3 },
      ],
    },
    {
      group: "Teaching & Content",
      items: [
        { label: "Assignments", href: "/assignments", icon: FileCheck },
        { label: "Quizzes", href: "/quizzes", icon: HelpCircle },
        { label: "Certificates", href: "/certificates", icon: Award },
        { label: "Discussions", href: "/discussions", icon: MessageSquare },
        { label: "Announcements", href: "/announcements", icon: Megaphone },
        { label: "Live Classroom", href: "/live-classroom", icon: Video },
        { label: "Media Library", href: "/media", icon: Layers },
      ],
    },
    {
      group: "Credits & Finance",
      items: [
        { label: "Credits & Wallet", href: "/credits", icon: CreditCard },
      ],
    },
    {
      group: "Academy & Team",
      items: [
        { label: "Website Builder", href: "/website-builder", icon: Globe },
        { label: "Staff Directory", href: "/staff", icon: UserCheck },
        { label: "Roles & Access", href: "/roles", icon: ShieldAlert },
      ],
    },
    {
      group: "System & Help",
      items: [
        { label: "Support Desk", href: "/support", icon: SupportIcon },
        { label: "Settings", href: "/settings", icon: Settings },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        "bg-white border-r border-slate-200/80 flex flex-col shrink-0 select-none text-left transition-all duration-300 ease-in-out z-40",
        isMobileDrawer
          ? "w-full h-full"
          : "fixed top-0 left-0 bottom-0 h-screen",
        collapsed ? "w-20" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100 shrink-0">
        <div className={cn("flex items-center gap-3 min-w-0", collapsed && "justify-center w-full")}>
          <div className="w-9 h-9 bg-gradient-to-tr from-blue-700 via-blue-600 to-sky-400 rounded-xl flex items-center justify-center text-white font-extrabold text-lg shadow-md shadow-blue-600/20 shrink-0">
            C
          </div>
          {!collapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="text-lg font-bold text-slate-900 tracking-tight block leading-tight truncate">
                Cubix<span className="text-blue-600">Skill</span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest block truncate">
                Instructor Enterprise
              </span>
            </div>
          )}
        </div>

        {!isMobileDrawer && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className={cn(
              "hidden md:flex items-center justify-center p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0",
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
              <h4 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                {section.group}
              </h4>
            ) : (
              <div className="h-px bg-slate-100 my-3" />
            )}
            {section.items.map((item) => {
              const active = isNavItemActive(item.href, location.pathname);

              return (
                <NavLink
                  key={item.href}
                  to={item.href}
                  onClick={onCloseMobile}
                  title={collapsed ? item.label : undefined}
                  className={() =>
                    cn(
                      "relative flex items-center rounded-xl text-xs font-semibold transition-all duration-200 group min-h-[40px]",
                      collapsed ? "justify-center px-2 py-2.5" : "justify-between px-3.5 py-2.5",
                      active
                        ? "bg-[#2563EB] text-white shadow-sm shadow-blue-600/25 font-bold"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    )
                  }
                >
                  <div className={cn("flex items-center gap-3 z-10", collapsed && "justify-center")}>
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110",
                        active ? "text-white" : "text-slate-400 group-hover:text-[#2563EB]"
                      )}
                    />
                    {!collapsed && <span className="truncate">{item.label}</span>}
                  </div>
                </NavLink>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Instructor Profile & Logout Section */}
      <div className="p-3 border-t border-slate-100 bg-slate-50/50 space-y-2 shrink-0 mt-auto">
        <div
          className={cn(
            "flex items-center rounded-2xl bg-white border border-slate-200/80 shadow-xs",
            collapsed ? "justify-center p-2" : "gap-3 p-2.5"
          )}
          title={collapsed ? user?.full_name || "Dr. Vikramaditya Rao" : undefined}
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-xs">
            {user?.full_name?.charAt(0).toUpperCase() || "V"}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 truncate">
                {user?.full_name || "Dr. Vikramaditya Rao"}
              </p>
              <p className="text-[10px] font-medium text-slate-500 truncate">
                Senior Instructor
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
            "w-full flex items-center rounded-xl text-xs font-bold text-rose-600 bg-rose-50/80 hover:bg-rose-100/80 transition-colors cursor-pointer",
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
