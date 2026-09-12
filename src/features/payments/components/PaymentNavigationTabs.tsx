import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Receipt, Landmark, Settings } from 'lucide-react';

export const PaymentNavigationTabs: React.FC = () => {
  const tabs = [
    { to: '/payments', label: 'Overview', icon: LayoutDashboard },
    { to: '/payments/transactions', label: 'Transactions', icon: Receipt },
    { to: '/payments/settlements', label: 'Settlements', icon: Landmark },
    { to: '/settings/payments', label: 'Payment Settings', icon: Settings },
  ];

  return (
    <div className="border-b border-slate-200 dark:border-[#263244] pb-2 min-w-0 w-full">
      <nav className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 text-xs font-medium min-w-0">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              end={tab.to === '/payments'}
              className={({ isActive }) =>
                `px-3.5 py-2.5 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer min-h-[44px] ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-2xs font-semibold dark:bg-[rgba(37,99,235,0.2)] dark:text-[#60A5FA] dark:border dark:border-[#3B82F6]'
                    : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263244]'
                }`
              }
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
};
