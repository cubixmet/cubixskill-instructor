import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { courseCouponsService, CreateCouponPayload } from '../../../services/courseCoupons.service';
import { CouponForm } from '../components/CouponForm';
import { Button } from '../../../components/ui/Button';

export const CouponCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const handleCreate = async (payload: CreateCouponPayload) => {
    if (!activeCourseId) return;
    await courseCouponsService.create(activeCourseId, payload);
    navigate(`/courses/${activeCourseId}/coupons`);
  };

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
        onSubmit={handleCreate}
        onCancel={() => navigate(activeCourseId ? `/courses/${activeCourseId}/coupons` : '/coupons')}
      />
    </div>
  );
};
