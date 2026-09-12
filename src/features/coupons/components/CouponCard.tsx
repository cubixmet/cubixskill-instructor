import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, Eye, Edit3, Power, Trash2 } from 'lucide-react';
import { CouponItem } from '../../../services/courseCoupons.service';
import { Button } from '../../../components/ui/Button';

interface CouponCardProps {
  coupon: CouponItem;
  courseIdContext?: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({
  coupon,
  courseIdContext,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();

  const detailUrl = courseIdContext
    ? `/courses/${courseIdContext}/coupons/${coupon.id}`
    : `/coupons/${coupon.id}`;
  const editUrl = courseIdContext
    ? `/courses/${courseIdContext}/coupons/${coupon.id}/edit`
    : `/coupons/${coupon.id}/edit`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-emerald-50 text-emerald-700 border border-emerald-200">
            Active
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-blue-50 text-blue-700 border border-blue-200">
            Scheduled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-rose-50 text-rose-700 border border-rose-200">
            Expired
          </span>
        );
      case 'USAGE_LIMIT_REACHED':
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-amber-50 text-amber-700 border border-amber-200">
            Limit Reached
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-slate-100 text-slate-500 border border-slate-200">
            Inactive
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs space-y-2.5 font-normal text-xs">
      <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2 min-w-0 gap-2">
        <div className="min-w-0 flex-1">
          <span className="font-mono font-semibold text-[#2563EB] dark:text-[#60A5FA] text-xs sm:text-sm block break-words overflow-wrap-anywhere">
            {coupon.code}
          </span>
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal block break-words overflow-wrap-anywhere mt-0.5">
            {coupon.name}
          </span>
        </div>
        <div className="shrink-0">
          {getStatusBadge(coupon.computed_status)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[11px] min-w-0">
        <div className="min-w-0">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block uppercase font-medium">Discount</span>
          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate">
            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `₹${coupon.discount_value.toLocaleString()}`}
          </span>
        </div>
        <div className="min-w-0">
          <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] block uppercase font-medium">Usage</span>
          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] block truncate">
            {coupon.current_usage_count} / {coupon.total_usage_limit > 0 ? coupon.total_usage_limit : '∞'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1 min-w-0">
        <Button
          size="xs"
          variant="outline"
          onClick={() => navigate(detailUrl)}
          className="font-medium h-11 sm:h-8 min-h-[44px] sm:min-h-0 flex-1 justify-center border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
        >
          View
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => navigate(editUrl)}
          className="font-medium h-11 sm:h-8 min-h-[44px] sm:min-h-0 flex-1 justify-center border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
        >
          Edit
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onToggleStatus(coupon.id)}
          className={`font-medium h-11 sm:h-8 min-h-[44px] sm:min-h-0 px-3 ${
            coupon.is_active ? 'text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800' : 'text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <Power className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onDelete(coupon.id)}
          className="font-medium text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 h-11 sm:h-8 min-h-[44px] sm:min-h-0 px-3"
        >
          <Trash2 className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
        </Button>
      </div>
    </div>
  );
};
