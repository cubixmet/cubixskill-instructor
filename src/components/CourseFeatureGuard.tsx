import React from 'react';
import { useParams, Navigate, Outlet } from 'react-router-dom';
import { useCourseFeatures } from '../hooks/useCourseFeatures';
import { normalizeCourseId } from '../utils/courseValidation.utils';

interface Props {
  featureCode: string;
  children?: React.ReactNode;
}

export const CourseFeatureGuard: React.FC<Props> = ({ featureCode, children }) => {
  const { courseId, courseUuid } = useParams<{ courseId?: string; courseUuid?: string }>();
  const validCourseId = normalizeCourseId(courseId || courseUuid);
  const { isFeatureEnabled, isLoading } = useCourseFeatures(validCourseId);

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] max-w-lg mx-auto mt-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2563EB] mx-auto mb-3" />
        <p className="text-xs text-slate-500 dark:text-[#94A3B8]">Verifying feature access...</p>
      </div>
    );
  }

  if (!isFeatureEnabled(featureCode)) {
    return <Navigate to={`/courses/${validCourseId || ''}/overview`} replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
