import React from 'react';
import { motion } from 'framer-motion';
import { FolderOpen, Plus, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DashboardEmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
  onAction?: () => void;
}

export const DashboardEmptyState: React.FC<DashboardEmptyStateProps> = ({
  title,
  description,
  actionText,
  actionHref,
  onAction,
}) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 text-center shadow-2xs">
      <div className="w-16 h-16 rounded-2xl bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] mx-auto flex items-center justify-center mb-4">
        <FolderOpen className="w-8 h-8" />
      </div>

      <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">{title}</h3>
      <p className="text-xs text-[#64748B] font-medium max-w-sm mx-auto mt-1 mb-5">
        {description}
      </p>

      {actionText && (
        actionHref ? (
          <Link
            to={actionHref}
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </Link>
        ) : (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center gap-1.5 h-10 px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{actionText}</span>
          </button>
        )
      )}
    </div>
  );
};
