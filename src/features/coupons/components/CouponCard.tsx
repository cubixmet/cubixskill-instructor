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
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2">
        <div>
          <span className="font-mono font-medium text-blue-600 dark:text-blue-400 text-xs block">
            {coupon.code}
          </span>
          <span className="text-[11px] text-slate-500 truncate block">{coupon.name}</span>
        </div>
        {getStatusBadge(coupon.computed_status)}
      </div>

      <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-100 dark:border-[#334155] text-[11px]">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Discount</span>
          <span className="font-normal text-slate-900 dark:text-white">
            {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}%` : `INR ${coupon.discount_value}`}
          </span>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block uppercase">Usage</span>
          <span className="font-normal text-slate-900 dark:text-white">
            {coupon.current_usage_count} / {coupon.total_usage_limit > 0 ? coupon.total_usage_limit : '∞'}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 pt-1">
        <Button size="xs" variant="outline" onClick={() => navigate(detailUrl)} className="font-normal h-8 flex-1 justify-center">
          View
        </Button>
        <Button size="xs" variant="outline" onClick={() => navigate(editUrl)} className="font-normal h-8 flex-1 justify-center">
          Edit
        </Button>
        <Button
          size="xs"
          variant="outline"
          onClick={() => onToggleStatus(coupon.id)}
          className={`font-normal h-8 px-2 ${coupon.is_active ? 'text-amber-600 border-amber-200' : 'text-emerald-600 border-emerald-200'}`}
        >
          <Power className="w-3.5 h-3.5" />
        </Button>
        <Button size="xs" variant="outline" onClick={() => onDelete(coupon.id)} className="font-normal text-rose-600 border-rose-200 h-8 px-2">
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
};
