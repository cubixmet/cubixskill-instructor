import React from 'react';
import { AppBottomSheet } from './AppBottomSheet';

export interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDanger?: boolean;
}

export interface AppActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  actions: ActionItem[];
}

export const AppActionSheet: React.FC<AppActionSheetProps> = ({
  isOpen,
  onClose,
  title = 'Actions',
  actions,
}) => {
  return (
    <AppBottomSheet isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-2 py-1">
        {actions.map((act, index) => {
          const isNextDanger = actions[index + 1]?.isDanger;
          return (
            <React.Fragment key={act.id}>
              <button
                type="button"
                onClick={() => {
                  act.onClick();
                  onClose();
                }}
                className={`w-full h-12 px-4 rounded-xl font-semibold text-[14px] flex items-center justify-between transition-colors cursor-pointer ${
                  act.isDanger
                    ? 'bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'bg-[#F8FAFC] text-[#0F172A] hover:bg-slate-100 border border-[#E2E8F0]'
                }`}
              >
                <span className="flex items-center gap-3">
                  {act.icon && <span className="w-5 h-5 flex items-center justify-center">{act.icon}</span>}
                  <span>{act.label}</span>
                </span>
              </button>

              {isNextDanger && <div className="border-t border-[#E2E8F0] my-2" />}
            </React.Fragment>
          );
        })}
      </div>
    </AppBottomSheet>
  );
};
