import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Ticket, Tag, CheckCircle2 } from 'lucide-react';
import { useCouponStore } from '../store/coupon.store';
import { useCourseStore } from '../../courses/store/course.store';
import { CouponTable } from '../components/CouponTable';
import { CouponCard } from '../components/CouponCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CouponListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const coupons = useCouponStore((state) => state.coupons);
  const getCouponsByCourse = useCouponStore((state) => state.getCouponsByCourse);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const activeCourse = activeCourseId ? coursesByUuid[activeCourseId] : undefined;

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredCoupons = useMemo(() => {
    let list = activeCourseId ? getCouponsByCourse(activeCourseId) : coupons;

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.code.toLowerCase().includes(q) ||
          (c.courseTitle && c.courseTitle.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      list = list.filter((c) => c.status === statusFilter);
    }

    return list;
  }, [coupons, activeCourseId, getCouponsByCourse, searchQuery, statusFilter]);

  const createUrl = activeCourseId
    ? `/courses/${activeCourseId}/coupons/new`
    : '/coupons/new';

  return (
    <div className="space-y-6 font-sans text-left pb-12 w-full max-w-full overflow-hidden">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Ticket className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeCourse ? `${activeCourse.title} — Coupons` : 'Coupon Codes'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {activeCourse
              ? 'Manage discount codes specifically created for this course.'
              : 'Manage and track all promotional discount codes across your academy.'}
          </p>
        </div>

        <div className="shrink-0">
          <Button
            variant="primary"
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => navigate(createUrl)}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        {/* Search */}
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Search coupon code or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
            size="sm"
          />
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 self-start sm:self-center overflow-x-auto max-w-full pb-1 sm:pb-0">
          <span className="text-xs font-semibold text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            Status:
          </span>
          {(['all', 'active', 'inactive'] as const).map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      {filteredCoupons.length === 0 ? (
        <EmptyState
          title="No coupon codes found"
          description={
            searchQuery || statusFilter !== 'all'
              ? 'No coupons matched your active search filters.'
              : 'You have not created any coupon discount codes yet.'
          }
          actionLabel="Create Coupon"
          onAction={() => navigate(createUrl)}
          icon={<Tag className="w-8 h-8 text-blue-600" />}
        />
      ) : (
        <>
          {/* Desktop Table View (Hidden on mobile < md) */}
          <div className="hidden md:block">
            <CouponTable
              coupons={filteredCoupons}
              courseIdContext={activeCourseId}
              onToast={showToast}
            />
          </div>

          {/* Mobile Card Stack View (Visible on mobile < md) */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {filteredCoupons.map((coupon) => (
              <CouponCard
                key={coupon.id}
                coupon={coupon}
                courseIdContext={activeCourseId}
                onToast={showToast}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
