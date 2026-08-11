import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormPageLayout } from '../../../components/ui/FormPageLayout';
import { CouponForm } from '../components/CouponForm';
import { CouponFormData } from '../types/coupon.types';
import { useCouponStore } from '../store/coupon.store';
import { useCourseStore } from '../../courses/store/course.store';
import { ErrorState } from '../../../components/ui/ErrorState';

export const CouponEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { couponId, courseUuid, courseId } = useParams<{
    couponId?: string;
    courseUuid?: string;
    courseId?: string;
  }>();

  const activeCourseId = courseUuid || courseId;
  const getCouponById = useCouponStore((state) => state.getCouponById);
  const updateCoupon = useCouponStore((state) => state.updateCoupon);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const coupon = couponId ? getCouponById(couponId) : undefined;
  const activeCourse = activeCourseId ? coursesByUuid[activeCourseId] : undefined;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const backUrl = activeCourseId
    ? `/courses/${activeCourseId}/coupons`
    : '/coupons';

  const detailUrl = activeCourseId && couponId
    ? `/courses/${activeCourseId}/coupons/${couponId}`
    : `/coupons/${couponId}`;

  if (!coupon) {
    return (
      <FormPageLayout
        title="Coupon Not Found"
        subtitle="The requested coupon code does not exist or was deleted."
        backUrl={backUrl}
      >
        <div className="max-w-xl mx-auto py-12 px-4">
          <ErrorState
            title="Coupon Not Found"
            message="We couldn't find the coupon code you are looking to edit."
            actionText="Back to Coupons"
            onRetry={() => navigate(backUrl)}
          />
        </div>
      </FormPageLayout>
    );
  }

  const breadcrumbs = activeCourse
    ? [
        { label: 'Courses', url: '/courses' },
        { label: activeCourse.title, url: `/courses/${activeCourseId}/overview` },
        { label: 'Coupons', url: backUrl },
        { label: coupon.code, url: detailUrl },
        { label: 'Edit' },
      ]
    : [
        { label: 'Dashboard', url: '/dashboard' },
        { label: 'Coupons', url: '/coupons' },
        { label: coupon.code, url: detailUrl },
        { label: 'Edit' },
      ];

  const initialValues: Partial<CouponFormData> = {
    code: coupon.code,
    discountType: coupon.discountType,
    discountValue: coupon.discountValue,
    courseScope: coupon.courseScope,
    validFrom: coupon.validFrom || '',
    expiryDate: coupon.expiryDate || '',
    usageLimit: coupon.usageLimit ?? '',
    perStudentLimit: coupon.perStudentLimit ?? 1,
    status: coupon.status === 'expired' ? 'inactive' : coupon.status,
  };

  const handleSubmit = (formData: CouponFormData) => {
    setIsSubmitting(true);
    setTimeout(() => {
      updateCoupon(coupon.id, formData, (id) => coursesByUuid[id]?.title || 'Selected Course');
      setIsSubmitting(false);
      navigate(detailUrl);
    }, 400);
  };

  return (
    <FormPageLayout
      title={`Edit Coupon — ${coupon.code}`}
      subtitle="Modify discount parameters, usage limits, or validity dates"
      backUrl={detailUrl}
      breadcrumbs={breadcrumbs}
    >
      <div className="max-w-3xl mx-auto px-4 py-6">
        <CouponForm
          initialValues={initialValues}
          editingCouponId={coupon.id}
          courseIdContext={activeCourseId}
          onSubmit={handleSubmit}
          onCancel={() => navigate(detailUrl)}
          isSubmitting={isSubmitting}
          submitButtonText="Save Changes"
        />
      </div>
    </FormPageLayout>
  );
};
