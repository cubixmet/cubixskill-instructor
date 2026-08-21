import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Ticket, CheckCircle2, Clock, AlertCircle, Edit3, History, RefreshCw, Power } from 'lucide-react';
import { courseCouponsService, CouponItem, CouponRedemptionItem } from '../../../services/courseCoupons.service';
import { StudentAvatar } from '../../fees/components/StudentAvatar';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';

export const CouponDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId, couponId } = useParams<{ courseUuid?: string; courseId?: string; couponId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const [coupon, setCoupon] = useState<CouponItem | null>(null);
  const [redemptions, setRedemptions] = useState<CouponRedemptionItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    if (!activeCourseId || !couponId) return;
    setIsLoading(true);
    setError(null);
    try {
      const [cData, rData] = await Promise.all([
        courseCouponsService.get(activeCourseId, couponId),
        courseCouponsService.getRedemptions(activeCourseId, couponId),
      ]);
      setCoupon(cData);
      setRedemptions(rData);
    } catch (err) {
      console.error('Failed to load coupon details:', err);
      setError('Failed to load coupon details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [activeCourseId, couponId]);

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 font-sans text-xs text-left max-w-4xl mx-auto">
        <div className="h-20 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 text-center space-y-3 font-normal max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Coupon Details Unavailable</h3>
        <p className="text-xs text-slate-500">{error || 'Invalid coupon.'}</p>
        <Button size="sm" onClick={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}>
          Back to Coupons List
        </Button>
      </div>
    );
  }

  const getStatusBadge = (st: string) => {
    switch (st) {
      case 'ACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-emerald-50 text-emerald-700 border border-emerald-200">Active</span>;
      case 'SCHEDULED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-blue-50 text-blue-700 border border-blue-200">Scheduled</span>;
      case 'EXPIRED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-rose-50 text-rose-700 border border-rose-200">Expired</span>;
      case 'USAGE_LIMIT_REACHED':
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-amber-50 text-amber-700 border border-amber-200">Limit Reached</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-slate-100 text-slate-500 border border-slate-200">Inactive</span>;
    }
  };

  return (
    <div className="space-y-5 font-sans text-xs text-slate-900 dark:text-white text-left pb-12 max-w-4xl mx-auto font-normal">
      <div className="flex items-center justify-between">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}
          className="h-8 font-normal border-slate-200 dark:border-[#334155]"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Coupons
        </Button>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(`/courses/${activeCourseId}/coupons/${coupon.id}/edit`)}
            className="h-8 font-normal border-slate-200 dark:border-[#334155]"
            leftIcon={<Edit3 className="w-3.5 h-3.5" />}
          >
            Edit Coupon
          </Button>
        </div>
      </div>

      {/* Header Card */}
      <Card className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-base font-semibold text-blue-600 dark:text-blue-400 uppercase">
                  {coupon.code}
                </span>
                {getStatusBadge(coupon.computed_status)}
              </div>
              <h1 className="text-xs font-normal text-slate-500 dark:text-slate-400 mt-0.5">
                {coupon.name}
              </h1>
            </div>
          </div>
        </div>

        {/* Rule Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="text-[10px] text-slate-400 font-normal uppercase block">Discount Rule</span>
            <span className="text-sm font-semibold text-slate-900 dark:text-white">
              {coupon.discount_type === 'PERCENTAGE' ? `${coupon.discount_value}% Off` : `INR ${coupon.discount_value} Off`}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="text-[10px] text-slate-400 font-normal uppercase block">Total Redemptions</span>
            <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
              {coupon.current_usage_count} / {coupon.total_usage_limit > 0 ? coupon.total_usage_limit : '∞'}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="text-[10px] text-slate-400 font-normal uppercase block">Min Order</span>
            <span className="text-xs font-normal text-slate-800 dark:text-slate-200">
              INR {coupon.minimum_order_amount.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-200 dark:border-[#334155]">
            <span className="text-[10px] text-slate-400 font-normal uppercase block">Per-Student Limit</span>
            <span className="text-xs font-normal text-slate-800 dark:text-slate-200">
              {coupon.per_user_usage_limit} Use{coupon.per_user_usage_limit > 1 ? 's' : ''}
            </span>
          </div>
        </div>

        {coupon.description && (
          <div className="text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-[#0F172A] p-3 rounded-xl border border-slate-100 dark:border-[#334155]">
            <span className="font-medium text-slate-700 dark:text-slate-200 block mb-0.5">Description / Internal Notes:</span>
            {coupon.description}
          </div>
        )}
      </Card>

      {/* Usage History Table */}
      <Card className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3 font-normal">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-3">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600" />
            <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
              Real Redemption History & Audit Ledger ({redemptions.length})
            </h2>
          </div>
          <Button size="xs" variant="outline" onClick={loadData} className="h-8 font-normal border-slate-200">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[700px]">
            <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-normal text-slate-500 uppercase">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Order #</th>
                <th className="p-3">Redeemed At</th>
                <th className="p-3">Original</th>
                <th className="p-3">Discount</th>
                <th className="p-3 text-right">Final Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#263244] font-normal">
              {redemptions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 font-normal">
                    No student has redeemed this coupon code yet.
                  </td>
                </tr>
              ) : (
                redemptions.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033]">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <StudentAvatar src={r.avatar_url} name={r.student_name} />
                        <div>
                          <span className="font-normal text-slate-900 dark:text-white block">{r.student_name}</span>
                          <span className="text-[11px] text-slate-400 block font-mono">{r.student_email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-mono text-blue-600 dark:text-blue-400 text-[11px]">
                      {r.order_number}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      {new Date(r.redeemed_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-3 text-slate-600 dark:text-slate-300">
                      ₹{r.original_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-emerald-600 dark:text-emerald-400">
                      -₹{r.discount_amount.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3 text-right font-normal text-slate-900 dark:text-white">
                      ₹{r.final_amount.toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
