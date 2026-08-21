import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import { courseCouponsService, CouponItem, CreateCouponPayload } from '../../../services/courseCoupons.service';
import { CouponForm } from '../components/CouponForm';
import { Button } from '../../../components/ui/Button';

export const CouponEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId, couponId } = useParams<{ courseUuid?: string; courseId?: string; couponId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const [coupon, setCoupon] = useState<CouponItem | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeCourseId || !couponId) return;
    setIsLoading(true);
    courseCouponsService.get(activeCourseId, couponId)
      .then((data) => setCoupon(data))
      .catch((err) => {
        console.error('Failed to load coupon details:', err);
        setError('Failed to load coupon details.');
      })
      .finally(() => setIsLoading(false));
  }, [activeCourseId, couponId]);

  const handleUpdate = async (payload: CreateCouponPayload) => {
    if (!activeCourseId || !couponId) return;
    await courseCouponsService.update(activeCourseId, couponId, payload);
    navigate(`/courses/${activeCourseId}/coupons`);
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 font-sans text-xs text-left max-w-lg mx-auto">
        <div className="h-64 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error || !coupon) {
    return (
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 text-center space-y-3 font-normal max-w-lg mx-auto">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Coupon Not Found</h3>
        <p className="text-xs text-slate-500">{error || 'Invalid coupon ID.'}</p>
        <Button size="sm" onClick={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}>
          Back to Coupons List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4 font-sans text-xs text-left pb-12 w-full max-w-full overflow-x-hidden font-normal">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}
          className="h-8 font-normal border-slate-200"
          leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
        >
          Back to Coupons
        </Button>
      </div>

      <CouponForm
        courseUuid={activeCourseId || ''}
        initialData={coupon}
        isEditing={true}
        onSubmit={handleUpdate}
        onCancel={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}
      />
    </div>
  );
};
