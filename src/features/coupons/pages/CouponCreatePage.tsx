import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { CouponForm } from '../components/CouponForm';
import { CouponFormData } from '../types/coupon.types';
import { useCouponStore } from '../store/coupon.store';
import { useCourseStore } from '../../courses/store/course.store';

export const CouponCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const createCoupon = useCouponStore((state) => state.createCoupon);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const activeCourse = activeCourseId ? coursesByUuid[activeCourseId] : undefined;

  const backUrl = activeCourseId
    ? `/courses/${activeCourseId}/coupons`
    : '/coupons';

  const breadcrumbs = activeCourse
    ? [
        { label: 'Courses', url: '/courses' },
        { label: activeCourse.title, url: `/courses/${activeCourseId}/overview` },
        { label: 'Coupons', url: backUrl },
        { label: 'Create Coupon' },
      ]
    : [
        { label: 'Coupons', url: '/coupons' },
        { label: 'Create Coupon' },
      ];

  const handleSubmit = async (formData: CouponFormData) => {
    setIsSubmitting(true);
    setApiError(null);

    try {
      // Simulate API network call
      await new Promise((resolve) => setTimeout(resolve, 400));
      createCoupon(formData, (id) => coursesByUuid[id]?.title || 'Selected Course');
      setIsSubmitting(false);
      navigate(backUrl);
    } catch (_err) {
      setIsSubmitting(false);
      setApiError('Unable to create coupon. Please try again.');
    }
  };

  return (
    <FormPageLayout
      title="Create Coupon"
      subtitle="Create a discount code for course purchases."
      backUrl={backUrl}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-2xl mx-auto px-3 sm:px-6 py-4 sm:py-6">
        <CouponForm
          courseIdContext={activeCourseId}
          onSubmit={handleSubmit}
          onCancel={() => navigate(backUrl)}
          isSubmitting={isSubmitting}
          submitButtonText="Create Coupon"
          submittingText="Creating Coupon..."
          apiError={apiError}
        />
      </div>
    </FormPageLayout>
  );
};
