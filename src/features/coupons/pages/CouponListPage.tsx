import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Plus,
  Search,
  Filter,
  Ticket,
  Tag,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import { courseCouponsService, CouponItem } from '../../../services/courseCoupons.service';
import { coursesService } from '../../../services/courses.service';
import { CourseListItem } from '../../courses/types/course.types';
import { CouponTable } from '../components/CouponTable';
import { CouponCard } from '../components/CouponCard';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { parseApiError } from '../../../api/errors';

export const CouponListPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  
  // Route param takes precedence (when nested under /courses/:courseId/coupons), otherwise check ?courseId=
  const routeCourseId = courseUuid || courseId;
  const paramCourseId = searchParams.get('courseId') || searchParams.get('course') || '';

  // Accessible Academy Courses State
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isCoursesLoading, setIsCoursesLoading] = useState<boolean>(true);
  const [coursesError, setCoursesError] = useState<string | null>(null);

  // Active Selected Course State
  const [selectedCourseId, setSelectedCourseId] = useState<string>(routeCourseId || paramCourseId);

  // Coupon List State
  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Coupon Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  // 1. Fetch Academy Accessible Courses
  const loadCourses = useCallback(async () => {
    setIsCoursesLoading(true);
    setCoursesError(null);
    try {
      const res = await coursesService.listCourses({ page_size: 100 });
      const items = Array.isArray(res) ? res : res.results || [];
      setCourses(items);
    } catch (err: any) {
      console.error('Failed to load courses for coupons:', err);
      setCoursesError('Unable to load academy courses.');
    } finally {
      setIsCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  // Sync routeCourseId or query param with selectedCourseId and validate existence
  useEffect(() => {
    if (routeCourseId) {
      setSelectedCourseId(routeCourseId);
    } else if (paramCourseId) {
      setSelectedCourseId(paramCourseId);
    }
  }, [routeCourseId, paramCourseId]);

  // Ensure selectedCourseId is valid when courses finish loading
  useEffect(() => {
    if (!isCoursesLoading && courses.length > 0 && selectedCourseId) {
      const exists = courses.some((c) => c.uuid === selectedCourseId || c.id === selectedCourseId);
      if (!exists && !routeCourseId) {
        // Clear invalid query parameter if course doesn't exist
        setSelectedCourseId('');
        setSearchParams({}, { replace: true });
      }
    }
  }, [isCoursesLoading, courses, selectedCourseId, routeCourseId, setSearchParams]);

  // Handle Course Selection Change
  const handleSelectCourse = (id: string) => {
    setSelectedCourseId(id);
    setSearchQuery('');
    setStatusFilter('all');
    setCoupons([]);
    setError(null);
    if (!routeCourseId) {
      if (id) {
        setSearchParams({ courseId: id });
      } else {
        setSearchParams({});
      }
    }
  };

  // 2. Fetch Coupons for Selected Course
  const loadCoupons = useCallback(async () => {
    if (!selectedCourseId) {
      setCoupons([]);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await courseCouponsService.list(selectedCourseId, {
        search: searchQuery,
        status: statusFilter,
      });
      setCoupons(data);
    } catch (err: any) {
      console.error('Failed to load course coupons:', err);
      const parsed = parseApiError(err);
      setError(parsed.message || 'Failed to load course coupons.');
      setCoupons([]);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCourseId, searchQuery, statusFilter]);

  useEffect(() => {
    if (selectedCourseId) {
      loadCoupons();
    } else {
      setCoupons([]);
      setIsLoading(false);
    }
  }, [selectedCourseId, loadCoupons]);

  // Handle Search Debounce
  useEffect(() => {
    if (!selectedCourseId) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await courseCouponsService.list(selectedCourseId, {
          search: searchQuery,
          status: statusFilter,
        });
        if (!isCancelled) {
          setCoupons(data);
        }
      } catch (err) {
        console.error('Failed to filter coupons:', err);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [selectedCourseId, searchQuery, statusFilter]);

  const handleToggleStatus = async (couponId: string) => {
    if (!selectedCourseId) return;
    try {
      const updated = await courseCouponsService.toggleStatus(selectedCourseId, couponId);
      showToast(`Coupon '${updated.code}' status updated.`);
      loadCoupons();
    } catch (err: any) {
      console.error('Failed to toggle coupon status:', err);
      showToast('Failed to change coupon status.');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!selectedCourseId) return;
    try {
      await courseCouponsService.delete(selectedCourseId, couponId);
      showToast('Coupon deleted / deactivated.');
      loadCoupons();
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
      showToast('Failed to delete coupon.');
    }
  };

  const selectedCourseObj = useMemo(() => {
    return courses.find((c) => c.uuid === selectedCourseId || c.id === selectedCourseId);
  }, [courses, selectedCourseId]);

  const createUrl = selectedCourseId
    ? routeCourseId
      ? `/courses/${selectedCourseId}/coupons/new`
      : `/coupons/new?courseId=${selectedCourseId}`
    : '/coupons/new';

  return (
    <div className="space-y-4 sm:space-y-5 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left pb-16 w-full max-w-full overflow-x-hidden font-normal px-1 sm:px-0">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs">
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl shrink-0">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
              Course Promotional Coupons
            </h1>
          </div>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">
            Manage promotional discount codes and track coupon redemptions across academy courses.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={loadCoupons}
            variant="outline"
            disabled={!selectedCourseId || isLoading}
            className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 font-medium border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] rounded-xl flex-1 sm:flex-none justify-center"
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            disabled={!selectedCourseId}
            className="h-11 sm:h-9 min-h-[44px] sm:min-h-0 font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex-1 sm:flex-none justify-center"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate(createUrl)}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Course Selection Dropdown Bar */}
      <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-[#2563EB]" />
            <span>Select Course for Coupons</span>
          </label>
          {selectedCourseObj && (
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium">
              Selected: <strong className="text-[#2563EB] dark:text-[#60A5FA]">{selectedCourseObj.title}</strong>
            </span>
          )}
        </div>

        {isCoursesLoading ? (
          <div className="h-11 bg-slate-100 dark:bg-slate-800 animate-pulse rounded-xl" />
        ) : coursesError ? (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 rounded-xl flex items-center justify-between text-xs text-rose-700 dark:text-rose-300">
            <span>{coursesError}</span>
            <Button size="sm" onClick={loadCourses} className="h-8 text-xs bg-rose-600 text-white">Retry</Button>
          </div>
        ) : courses.length === 0 ? (
          <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#263244] rounded-xl text-xs text-[#64748B] dark:text-[#94A3B8]">
            No courses found in your academy. Please create a course first to manage coupons.
          </div>
        ) : (
          <div className="relative">
            <select
              value={selectedCourseId}
              onChange={(e) => handleSelectCourse(e.target.value)}
              className="w-full h-11 px-3 pr-8 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] appearance-none cursor-pointer min-h-[44px]"
            >
              <option value="">-- Choose a Course to Manage Coupons --</option>
              {courses.map((course) => (
                <option key={course.id || course.uuid} value={course.uuid || course.id}>
                  {course.title} {course.status ? `(${course.status})` : ''}
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {!selectedCourseId ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center space-y-3 font-normal">
          <BookOpen className="w-10 h-10 text-[#2563EB] mx-auto opacity-80" />
          <h3 className="text-sm sm:text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Select a Course to Manage Coupons
          </h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-md mx-auto leading-relaxed">
            Choose an academy course from the dropdown above to view, create, edit, or toggle promotional discount codes.
          </p>
        </div>
      ) : isLoading && coupons.length === 0 ? (
        <div className="space-y-4 p-4 font-sans text-xs text-left">
          <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded-xl animate-pulse" />
          <div className="h-64 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
        </div>
      ) : error && coupons.length === 0 ? (
        <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900/50 text-center space-y-3 font-normal">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Unable to Load Course Coupons</h3>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{error}</p>
          <Button size="sm" onClick={loadCoupons} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
            Retry Loading
          </Button>
        </div>
      ) : (
        <div className="space-y-4 min-w-0">
          {/* Search & Status Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs min-w-0">
            <div className="flex-1 max-w-md relative min-w-0">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search coupon code or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 sm:h-9 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] min-h-[44px] sm:min-h-0"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 sm:pb-0 min-w-0">
              <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1 mr-1 shrink-0">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'all', label: 'All' },
                { id: 'ACTIVE', label: 'Active' },
                { id: 'INACTIVE', label: 'Inactive' },
                { id: 'EXPIRED', label: 'Expired' },
                { id: 'SCHEDULED', label: 'Scheduled' },
              ].map((st) => (
                <button
                  key={st.id}
                  type="button"
                  onClick={() => setStatusFilter(st.id)}
                  className={`px-3 py-2 sm:py-1 rounded-xl text-xs sm:text-[11px] font-normal transition-all cursor-pointer whitespace-nowrap min-h-[44px] sm:min-h-0 flex items-center ${
                    statusFilter === st.id
                      ? 'bg-[#2563EB] text-white font-medium shadow-2xs'
                      : 'bg-slate-100 dark:bg-[#172033] text-[#475569] dark:text-[#CBD5E1] hover:bg-slate-200'
                  }`}
                >
                  {st.label}
                </button>
              ))}
            </div>
          </div>

          {/* Main Coupon List Area */}
          {coupons.length === 0 ? (
            <EmptyState
              title="No coupons found"
              description={
                searchQuery || statusFilter !== 'all'
                  ? 'No coupons match your search parameters.'
                  : 'No promotional discount codes created for this course yet.'
              }
              actionLabel="Create Coupon"
              onAction={() => navigate(createUrl)}
              icon={Tag}
            />
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden md:block">
                <CouponTable
                  coupons={coupons}
                  courseIdContext={selectedCourseId}
                  onToggleStatus={handleToggleStatus}
                  onDelete={handleDelete}
                />
              </div>

              {/* Mobile Card View */}
              <div className="grid grid-cols-1 gap-3 md:hidden max-w-md mx-auto">
                {coupons.map((coupon) => (
                  <CouponCard
                    key={coupon.id}
                    coupon={coupon}
                    courseIdContext={selectedCourseId}
                    onToggleStatus={handleToggleStatus}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};
