import React from "react";
import { Link } from "react-router-dom";
import {
  Settings,
  CreditCard,
  HelpCircle,
  Users,
  ShieldCheck,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { Drawer } from "../ui/Drawer";
import { useAuthStore } from "../../store/auth.store";
import { getUserInitials, getRoleLabel } from "../../utils/branding.utils";

export interface MobileProfileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileProfileDrawer: React.FC<MobileProfileDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { user, logout } = useAuthStore();

  const menuLinks = [
    {
      label: "Account Settings",
      description: "Profile, security & preferences",
      href: "/settings",
      icon: Settings,
      color: "text-blue-600 bg-blue-50",
    },
    {
      label: "Credits & Wallet",
      description: "View balance, top-up & transaction logs",
      href: "/credits",
      icon: CreditCard,
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Support & Helpdesk",
      description: "Knowledge base & ticket support",
      href: "/support",
      icon: HelpCircle,
      color: "text-amber-600 bg-amber-50",
    },
    {
      label: "Staff & Permissions",
      description: "Directory & role assignments",
      href: "/staff",
      icon: Users,
      color: "text-purple-600 bg-purple-50",
    },
  ];

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      side="right"
      size="sm"
      title="My Account"
    >
      <div className="space-y-6 text-left font-sans pb-6">
        {/* Profile Card Header */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-md space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 text-white font-bold text-lg flex items-center justify-center shadow-md shrink-0">
              {getUserInitials(user?.full_name)}
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-bold truncate">
                {user?.full_name || "Academy User"}
              </h4>
              <p className="text-xs text-slate-300 truncate">
                {user?.email || ""}
              </p>

              <div className="inline-flex items-center gap-1 mt-1 text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/60">
                <ShieldCheck className="w-3 h-3" />
                <span>{getRoleLabel(user?.role, user?.assigned_role_name)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Menu Links */}
        <div className="space-y-2">
          <p className="px-1 text-[11px] font-bold text-slate-400 dark:text-[#7CA9DB] uppercase tracking-wider">
            Preferences & Tools
          </p>
          <div className="space-y-1">
            {menuLinks.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={onClose}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-[#172033] border border-transparent hover:border-slate-200/80 dark:hover:border-[#263244] transition-all group min-h-[44px]"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}
                  >
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                      {item.label}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.description}
                    </p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Sign Out Button */}
        <div className="pt-4 border-t border-slate-100 dark:border-[#1E293B]">
          <button
            type="button"
            onClick={() => {
              onClose();
              logout();
            }}
            className="w-full min-h-[44px] px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-[rgba(239,68,68,0.08)] dark:hover:bg-[rgba(239,68,68,0.14)] dark:text-rose-400 dark:border dark:border-[rgba(239,68,68,0.20)] font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Account</span>
          </button>
        </div>
      </div>
    </Drawer>
  );
};


