import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Video,
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

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "Students", href: "/students", icon: Users },
    { label: "Live Class", href: "/live-classes", icon: Video },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-white/95 dark:bg-[#0B1120]/95 backdrop-blur-md border-t border-slate-200/90 dark:border-[#16223A] px-2 flex items-center justify-around z-40 shadow-lg select-none pb-[env(safe-area-inset-bottom)]">
      {navItems.map((item) => {
        const active = isNavItemActive(item.href, location.pathname);

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={() =>
              cn(
                "flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all min-w-0 h-11 px-1 cursor-pointer",
                active
                  ? "text-[#2563EB] dark:text-[#60A5FA] font-bold"
                  : "text-slate-500 dark:text-[#94A3B8] font-medium hover:text-slate-900 dark:hover:text-[#F8FAFC]"
              )
            }
          >
            <item.icon className={cn("w-4 h-4 shrink-0", active && "stroke-[2.5]")} />
            <span className="truncate w-full text-center">{item.label}</span>
          </NavLink>
        );
      })}

      {/* Item 5: Menu (Sidebar Drawer trigger) */}
      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] transition-all min-w-0 h-11 px-1 cursor-pointer text-slate-500 dark:text-[#94A3B8] font-medium hover:text-slate-900 dark:hover:text-[#F8FAFC]"
      >
        <Menu className="w-4 h-4 shrink-0" />
        <span className="truncate w-full text-center">Menu</span>
      </button>
    </nav>
  );
};
