import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  IndianRupee,
  MessageSquare,
  Layers,
  Menu,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { isNavItemActive } from "./Sidebar";

export interface MobileNavProps {
  onOpenSidebar: () => void;
  onOpenProfile: () => void;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({
  onOpenSidebar,
}) => {
  const location = useLocation();

  // Exactly 7 items as required by specification
  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "Students", href: "/students", icon: Users },
    { label: "Fees", href: "/fees", icon: IndianRupee },
    { label: "Discussions", href: "/discussions", icon: MessageSquare },
    { label: "Media", href: "/media", icon: Layers },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0B1120] backdrop-blur-md border-t border-slate-200/90 dark:border-[#1E293B] px-1 flex items-center justify-between z-40 shadow-lg select-none pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const active = isNavItemActive(item.href, location.pathname);

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={() =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] transition-all min-w-0 h-11 px-0.5 cursor-pointer",
                active
                  ? "text-[#2563EB] dark:text-[#60A5FA] font-medium"
                  : "text-slate-500 dark:text-[#94A3B8] font-normal hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              )
            }
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="truncate w-full text-center">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Item 7: More (Sidebar Drawer trigger) */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className={cn(
          "flex-1 flex flex-col items-center justify-center gap-0.5 text-[9px] transition-all min-w-0 h-11 px-0.5 cursor-pointer text-slate-500 dark:text-[#94A3B8] font-normal hover:text-slate-900 dark:hover:text-[#F8FAFC]"
        )}
      >
        <Menu className="w-4 h-4 shrink-0" />
        <span className="truncate w-full text-center">More</span>
      </button>
    </nav>
  );
};
