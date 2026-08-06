import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Coins,
  Menu,
} from "lucide-react";
import { cn } from "../../lib/cn";
import { isNavItemActive } from "./Sidebar";

export interface MobileNavProps {
  onOpenSidebar: () => void;
}

export const MobileBottomNav: React.FC<MobileNavProps> = ({ onOpenSidebar }) => {
  const location = useLocation();

  const navItems = [
    { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { label: "Courses", href: "/courses", icon: BookOpen },
    { label: "Students", href: "/students", icon: Users },
    { label: "Credits", href: "/credits", icon: Coins },
  ];

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 px-3 flex items-center justify-around z-40 shadow-lg select-none">
      {navItems.map((item) => {
        const active = isNavItemActive(item.href, location.pathname);

        return (
          <NavLink
            key={item.href}
            to={item.href}
            className={() =>
              cn(
                "flex flex-col items-center justify-center gap-1 text-[10px] font-semibold transition-all min-w-[48px] min-h-[48px] rounded-xl px-2",
                active ? "text-[#2563EB] font-bold bg-blue-50/80" : "text-slate-500 hover:text-slate-900"
              )
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}

      <button
        type="button"
        onClick={onOpenSidebar}
        className="flex flex-col items-center justify-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-slate-900 min-w-[48px] min-h-[48px] rounded-xl px-2 cursor-pointer"
      >
        <Menu className="w-5 h-5" />
        <span>Menu</span>
      </button>
    </div>
  );
};
