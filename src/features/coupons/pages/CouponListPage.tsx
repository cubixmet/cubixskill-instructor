import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, Ticket, Tag, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { courseCouponsService, CouponItem } from '../../../services/courseCoupons.service';
import { CouponTable } from '../components/CouponTable';
import { CouponCard } from '../components/CouponCard';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { EmptyState } from '../../../components/ui/EmptyState';
import { parseApiError } from '../../../api/errors';

export const CouponListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const [coupons, setCoupons] = useState<CouponItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadCoupons = useCallback(async () => {
    if (!activeCourseId) {
      setError('Course UUID is missing.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const data = await courseCouponsService.list(activeCourseId, {
        search: searchQuery,
        status: statusFilter,
      });
      setCoupons(data);
    } catch (err: any) {
      console.error('Failed to load course coupons:', err);
      const parsed = parseApiError(err);
      setError(parsed.message || 'Failed to load course coupons.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCourseId, statusFilter]);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  // Handle Search Debounce
  useEffect(() => {
    if (!activeCourseId) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const data = await courseCouponsService.list(activeCourseId, {
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
  }, [activeCourseId, searchQuery, statusFilter]);

  const handleToggleStatus = async (couponId: string) => {
    if (!activeCourseId) return;
    try {
      const updated = await courseCouponsService.toggleStatus(activeCourseId, couponId);
      showToast(`Coupon '${updated.code}' status updated.`);
      loadCoupons();
    } catch (err: any) {
      console.error('Failed to toggle coupon status:', err);
      showToast('Failed to change coupon status.');
    }
  };

  const handleDelete = async (couponId: string) => {
    if (!activeCourseId) return;
    try {
      await courseCouponsService.delete(activeCourseId, couponId);
      showToast('Coupon deleted / deactivated.');
      loadCoupons();
    } catch (err: any) {
      console.error('Failed to delete coupon:', err);
      showToast('Failed to delete coupon.');
    }
  };

  const createUrl = activeCourseId ? `/courses/${activeCourseId}/coupons/new` : '/coupons/new';

  if (isLoading && coupons.length === 0) {
    return (
      <div className="space-y-4 p-4 font-sans text-xs text-left">
        <div className="h-10 bg-slate-100 dark:bg-[#111827] rounded-xl animate-pulse" />
        <div className="h-64 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && coupons.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 text-center space-y-3 font-normal">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to Load Course Coupons</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <Button size="sm" onClick={loadCoupons} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Loading
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 font-sans text-xs text-slate-900 dark:text-slate-100 text-left pb-12 w-full max-w-full overflow-x-hidden font-normal">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-medium px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <Ticket className="w-4 h-4" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
              Course Promotional Coupons
            </h1>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Manage promotional discount codes attached to this course.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            size="sm"
            onClick={loadCoupons}
            variant="outline"
            className="h-9 font-normal border-slate-200 dark:border-[#334155]"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
          <Button
            size="sm"
            className="h-9 font-normal bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            leftIcon={<Plus className="w-3.5 h-3.5" />}
            onClick={() => navigate(createUrl)}
          >
            Create Coupon
          </Button>
        </div>
      </div>

      {/* Search & Status Filter Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
        <div className="flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search coupon code or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-normal text-slate-400 flex items-center gap-1 mr-1">
            <Filter className="w-3 h-3" /> Filter:
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
              className={`px-3 py-1 rounded-xl text-[11px] font-normal transition-all cursor-pointer whitespace-nowrap ${
                statusFilter === st.id
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
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
              courseIdContext={activeCourseId}
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
                courseIdContext={activeCourseId}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};
