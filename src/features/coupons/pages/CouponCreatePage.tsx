import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, BookOpen, AlertCircle, RefreshCw } from 'lucide-react';
import { courseCouponsService, CreateCouponPayload } from '../../../services/courseCoupons.service';
import { coursesService } from '../../../services/courses.service';
import { CourseListItem } from '../../courses/types/course.types';
import { CouponForm } from '../components/CouponForm';
import { Button } from '../../../components/ui/Button';

export const CouponCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId || searchParams.get('courseId') || searchParams.get('course') || '';

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<CourseListItem | null>(null);
  const [isLoadingCourse, setIsLoadingCourse] = useState<boolean>(Boolean(activeCourseId));
  const [courseError, setCourseError] = useState<string | null>(null);

  const backUrl = courseUuid || courseId
    ? `/courses/${activeCourseId}/coupons`
    : activeCourseId
      ? `/coupons?courseId=${activeCourseId}`
      : '/coupons';

  useEffect(() => {
    if (!activeCourseId) return;
    setIsLoadingCourse(true);
    setCourseError(null);

    coursesService.listCourses({ page_size: 100 })
      .then((res) => {
        const items = Array.isArray(res) ? res : res.results || [];
        setCourses(items);
        const match = items.find((c) => c.uuid === activeCourseId || c.id === activeCourseId);
        if (match) {
          setSelectedCourse(match);
        } else {
          setCourseError('Selected course was not found or is inaccessible.');
        }
      })
      .catch((err) => {
        console.error('Failed to load courses for creation context:', err);
        setCourseError('Unable to verify course details.');
      })
      .finally(() => setIsLoadingCourse(false));
  }, [activeCourseId]);

  const handleCreate = async (payload: CreateCouponPayload) => {
    if (!activeCourseId) return;
    await courseCouponsService.create(activeCourseId, payload);
    navigate(backUrl);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left pb-24 sm:pb-16 w-full max-w-2xl mx-auto overflow-x-hidden font-normal px-2 sm:px-0 min-w-0">
      {/* Header & Back Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
          <Button
            size="sm"
            variant="outline"
            onClick={() => navigate(backUrl)}
            className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 font-medium border-[#CBD5E1] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033] shrink-0"
            leftIcon={<ArrowLeft className="w-4 h-4 sm:w-3.5 sm:h-3.5" />}
          >
            Back to Coupons
          </Button>
        </div>
      </div>

      {/* Selected Course Context Card */}
      {activeCourseId && (
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs flex items-center justify-between gap-3 min-w-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block font-semibold">
                Course Context
              </span>
              <h2 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                {isLoadingCourse ? 'Verifying Course Details...' : selectedCourse ? selectedCourse.title : activeCourseId}
              </h2>
            </div>
          </div>
          {selectedCourse && (
            <span className="px-2.5 py-1 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 shrink-0">
              Verified
            </span>
          )}
        </div>
      )}

      {/* Course Missing Warning */}
      {!activeCourseId ? (
        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-amber-200 dark:border-amber-900/50 text-center space-y-3 font-normal">
          <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">No Course Selected</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Please select an academy course on the Coupons list page before creating a promotional code.
          </p>
          <Button size="sm" onClick={() => navigate('/coupons')} className="bg-[#2563EB] text-white">
            Select Course on Coupons Page
          </Button>
        </div>
      ) : courseError ? (
        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/50 text-center space-y-3 font-normal">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Course Context Error</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{courseError}</p>
          <Button size="sm" onClick={() => navigate('/coupons')} className="bg-[#2563EB] text-white">
            Return to Coupons List
          </Button>
        </div>
      ) : (
        <CouponForm
          courseUuid={activeCourseId}
          onSubmit={handleCreate}
          onCancel={() => navigate(backUrl)}
        />
      )}
    </div>
  );
};
