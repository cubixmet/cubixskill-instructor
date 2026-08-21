import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle2, Clock, AlertCircle, Eye, Edit3, Power, Trash2 } from 'lucide-react';
import { CouponItem } from '../../../services/courseCoupons.service';
import { Button } from '../../../components/ui/Button';

interface CouponTableProps {
  coupons: CouponItem[];
  courseIdContext?: string;
  onToggleStatus: (id: string) => void;
  onDelete: (id: string) => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  courseIdContext,
  onToggleStatus,
  onDelete,
}) => {
  const navigate = useNavigate();

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active
          </span>
        );
      case 'SCHEDULED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/80 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-blue-600" /> Scheduled
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/80 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Expired
          </span>
        );
      case 'USAGE_LIMIT_REACHED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/80 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-amber-600" /> Limit Reached
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 flex items-center gap-1 w-fit">
            Inactive
          </span>
        );
    }
  };

  const formatDateRange = (validFrom: string, validUntil?: string | null) => {
    try {
      const fromStr = new Date(validFrom).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (!validUntil) return `From ${fromStr}`;
      const untilStr = new Date(validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
      return `${fromStr} – ${untilStr}`;
    } catch {
      return validFrom;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs overflow-hidden font-normal">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs min-w-[750px]">
          <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <tr>
              <th className="p-3.5">Coupon Code</th>
              <th className="p-3.5">Discount</th>
              <th className="p-3.5">Validity</th>
              <th className="p-3.5">Usage</th>
              <th className="p-3.5">Status</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-[#263244] font-normal">
            {coupons.map((coupon) => {
              const detailUrl = courseIdContext
                ? `/courses/${courseIdContext}/coupons/${coupon.id}`
                : `/coupons/${coupon.id}`;
              const editUrl = courseIdContext
                ? `/courses/${courseIdContext}/coupons/${coupon.id}/edit`
                : `/coupons/${coupon.id}/edit`;

              return (
                <tr key={coupon.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033] transition-colors">
                  <td className="p-3.5">
                    <div>
                      <span className="font-mono font-medium text-blue-600 dark:text-blue-400 text-xs block">
                        {coupon.code}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block max-w-[200px]">
                        {coupon.name}
                      </span>
                    </div>
                  </td>
                  <td className="p-3.5 font-normal text-slate-900 dark:text-white">
                    {coupon.discount_type === 'PERCENTAGE'
                      ? `${coupon.discount_value}%`
                      : `INR ${coupon.discount_value.toLocaleString('en-IN')}`}
                    {coupon.max_discount_amount && (
                      <span className="text-[10px] text-slate-400 block">
                        (Max ₹{coupon.max_discount_amount})
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-slate-600 dark:text-slate-300">
                    {formatDateRange(coupon.valid_from, coupon.valid_until)}
                  </td>
                  <td className="p-3.5 text-slate-700 dark:text-slate-200">
                    {coupon.current_usage_count} / {coupon.total_usage_limit > 0 ? coupon.total_usage_limit : '∞'}
                  </td>
                  <td className="p-3.5">{getStatusBadge(coupon.computed_status)}</td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(detailUrl)}
                        className="font-normal border-slate-200 dark:border-[#334155] h-8 px-2"
                        title="View Usage & Details"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => navigate(editUrl)}
                        className="font-normal border-slate-200 dark:border-[#334155] h-8 px-2"
                        title="Edit Coupon"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onToggleStatus(coupon.id)}
                        className={`font-normal h-8 px-2 ${
                          coupon.is_active
                            ? 'text-amber-600 dark:text-amber-400 border-amber-200'
                            : 'text-emerald-600 dark:text-emerald-400 border-emerald-200'
                        }`}
                        title={coupon.is_active ? 'Deactivate Coupon' : 'Activate Coupon'}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => onDelete(coupon.id)}
                        className="font-normal text-rose-600 dark:text-rose-400 border-rose-200 h-8 px-2"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
