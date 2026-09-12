import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  ArrowRight,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { useFeesStore } from '../store/fees.store';
import { courseFeesCollectionService, StudentFeeRecordItem } from '../../../services/courseFeesCollection.service';

export const GlobalFeesPage: React.FC = () => {
  const navigate = useNavigate();
  const storeRecords = useFeesStore((s) => s.records);

  const [backendAccounts, setBackendAccounts] = useState<StudentFeeRecordItem[]>([]);
  const [globalSummary, setGlobalSummary] = useState<{ total_expected: number; total_collected: number; total_pending: number; total_overdue: number } | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    Promise.all([
      courseFeesCollectionService.getGlobalSummary().catch(() => null),
      courseFeesCollectionService.getGlobalAccounts().catch(() => []),
    ]).then(([sumRes, accRes]) => {
      if (!isMounted) return;
      if (sumRes) setGlobalSummary(sumRes);
      if (accRes && Array.isArray(accRes) && accRes.length > 0) {
        setBackendAccounts(accRes);
      }
    }).finally(() => {
      if (isMounted) setIsLoading(false);
    });

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute summary metrics (use API if available, fallback to computed)
  const summary = useMemo(() => {
    if (globalSummary) {
      return {
        totalExpected: globalSummary.total_expected,
        totalCollected: globalSummary.total_collected,
        totalPending: globalSummary.total_pending,
        totalOverdue: globalSummary.total_overdue,
      };
    }

    if (backendAccounts.length > 0) {
      const totalExpected = backendAccounts.reduce((acc, r) => acc + r.total_fee, 0);
      const totalCollected = backendAccounts.reduce((acc, r) => acc + r.paid_amount, 0);
      const totalPending = backendAccounts.reduce((acc, r) => acc + (r.status !== 'OVERDUE' ? r.balance : 0), 0);
      const totalOverdue = backendAccounts.reduce((acc, r) => acc + (r.status === 'OVERDUE' ? r.balance : 0), 0);
      return { totalExpected, totalCollected, totalPending, totalOverdue };
    }

    const totalExpected = storeRecords.reduce((acc, r) => acc + r.payableINR, 0);
    const totalCollected = storeRecords.reduce((acc, r) => acc + r.paidINR, 0);
    const totalPending = storeRecords.reduce((acc, r) => acc + (r.status !== 'Overdue' ? r.pendingINR : 0), 0);
    const totalOverdue = storeRecords.reduce((acc, r) => acc + (r.status === 'Overdue' ? r.pendingINR : 0), 0);

    return { totalExpected, totalCollected, totalPending, totalOverdue };
  }, [globalSummary, backendAccounts, storeRecords]);

  // Compute course-wise collection stats dynamically
  const courseWiseStats = useMemo(() => {
    const map: Record<
      string,
      {
        courseUuid: string;
        courseTitle: string;
        studentsCount: number;
        expected: number;
        collected: number;
        pending: number;
        overdue: number;
      }
    > = {};

    if (backendAccounts.length > 0) {
      backendAccounts.forEach((r) => {
        const cUuid = r.course_id || 'course-default';
        const cTitle = r.course_title || 'Enrolled Course';

        if (!map[cUuid]) {
          map[cUuid] = {
            courseUuid: cUuid,
            courseTitle: cTitle,
            studentsCount: 0,
            expected: 0,
            collected: 0,
            pending: 0,
            overdue: 0,
          };
        }
        const item = map[cUuid];
        item.studentsCount += 1;
        item.expected += r.total_fee;
        item.collected += r.paid_amount;
        if (r.status === 'OVERDUE' || r.overdue_amount > 0) {
          item.overdue += r.overdue_amount || r.balance;
        } else {
          item.pending += r.balance;
        }
      });
    } else {
      storeRecords.forEach((r) => {
        if (!map[r.courseUuid]) {
          map[r.courseUuid] = {
            courseUuid: r.courseUuid,
            courseTitle: r.courseTitle,
            studentsCount: 0,
            expected: 0,
            collected: 0,
            pending: 0,
            overdue: 0,
          };
        }
        const item = map[r.courseUuid];
        item.studentsCount += 1;
        item.expected += r.payableINR;
        item.collected += r.paidINR;
        if (r.status === 'Overdue') {
          item.overdue += r.pendingINR;
        } else {
          item.pending += r.pendingINR;
        }
      });
    }

    return Object.values(map);
  }, [backendAccounts, storeRecords]);

  // Filtered courses based on search & filter
  const filteredCourses = useMemo(() => {
    const q = search.toLowerCase();
    return courseWiseStats.filter((c) => {
      const matchSearch = !q || c.courseTitle.toLowerCase().includes(q);
      let matchStatus = true;
      if (statusFilter === 'Paid') matchStatus = c.pending === 0 && c.overdue === 0;
      if (statusFilter === 'Partial') matchStatus = c.collected > 0 && (c.pending > 0 || c.overdue > 0);
      if (statusFilter === 'Pending') matchStatus = c.pending > 0;
      if (statusFilter === 'Overdue') matchStatus = c.overdue > 0;

      return matchSearch && matchStatus;
    });
  }, [courseWiseStats, search, statusFilter]);

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left pb-24 md:pb-8 min-w-0 w-full max-w-full overflow-x-hidden px-1 sm:px-0">
      {/* 1. HEADER */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-tight">
              Fees Collection Dashboard
            </h1>
            <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal">
              Manage fee collection, pending balances, and student payment receipts across all courses.
            </p>
          </div>
        </div>
      </Card>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-1 min-[360px]:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        {/* Total Expected */}
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
            <span className="text-[11px] truncate">Total Expected</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
          </div>
          <p className="text-sm sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate break-all">
            ₹{summary.totalExpected.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
            <span className="text-[11px] truncate">Collected Fees</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-[#10B981] shrink-0" />
          </div>
          <p className="text-sm sm:text-xl font-semibold text-emerald-600 dark:text-[#10B981] truncate break-all">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Pending */}
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
            <span className="text-[11px] truncate">Pending Fees</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-[#F59E0B] shrink-0" />
          </div>
          <p className="text-sm sm:text-xl font-semibold text-amber-600 dark:text-[#F59E0B] truncate break-all">
            ₹{summary.totalPending.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Overdue */}
        <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1.5 min-w-0">
          <div className="flex items-center justify-between text-[#64748B] dark:text-[#94A3B8] font-medium">
            <span className="text-[11px] truncate">Overdue Fees</span>
            <AlertCircle className="w-4 h-4 text-rose-600 dark:text-[#F87171] shrink-0" />
          </div>
          <p className="text-sm sm:text-xl font-semibold text-rose-600 dark:text-[#F87171] truncate break-all">
            ₹{summary.totalOverdue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 sm:h-9.5 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10 min-h-[44px] sm:min-h-0"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-11 sm:h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] w-full sm:w-auto cursor-pointer min-h-[44px] sm:min-h-0"
          >
            <option value="all">All Fee States</option>
            <option value="Paid">Fully Paid</option>
            <option value="Partial">Partially Paid</option>
            <option value="Pending">Has Pending</option>
            <option value="Overdue">Has Overdue</option>
          </select>
        </div>
      </div>

      {/* 4. COURSE-WISE COLLECTION GRID */}
      <div className="space-y-3 min-w-0">
        <h2 className="text-xs sm:text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] px-0.5">
          Course-wise Collection Breakdown
        </h2>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 min-w-0">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-44 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] font-normal">
            No courses match the specified filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 min-w-0">
            {filteredCourses.map((c) => {
              const collectedPct = c.expected > 0 ? Math.round((c.collected / c.expected) * 100) : 0;
              return (
                <div
                  key={c.courseUuid}
                  className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 dark:hover:border-[#3B82F6] transition-all min-w-0"
                >
                  <div className="space-y-2.5 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-[#2563EB] dark:text-[#60A5FA] flex items-center justify-center shrink-0 border border-blue-100 dark:border-[rgba(59,130,246,0.18)]">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate leading-snug">
                            {c.courseTitle}
                          </h3>
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal truncate block">
                            {c.studentsCount} Enrolled Students
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-normal">
                        <span className="text-[#64748B] dark:text-[#94A3B8]">Collection Progress</span>
                        <span className="text-[#0F172A] dark:text-[#F8FAFC] font-semibold">{collectedPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 dark:bg-[#0F172A] rounded-full overflow-hidden border border-[#E2E8F0] dark:border-[#263244]">
                        <div
                          className="h-full bg-emerald-500 dark:bg-[#10B981] rounded-full transition-all duration-300"
                          style={{ width: `${collectedPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Fee Numbers Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2.5 border-t border-[#E2E8F0] dark:border-[#263244] text-[11px]">
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Expected</span>
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">₹{c.expected.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Collected</span>
                        <span className="font-semibold text-emerald-600 dark:text-[#10B981]">₹{c.collected.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-[#64748B] dark:text-[#94A3B8] font-medium block">Pending</span>
                        <span className="font-semibold text-amber-600 dark:text-[#F59E0B]">₹{(c.pending + c.overdue).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/courses/${c.courseUuid}/fees`)}
                    className="w-full font-medium h-11 sm:h-9 min-h-[44px] sm:min-h-0 rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B] dark:hover:border-[#3B82F6] dark:hover:text-[#F8FAFC] justify-center text-xs"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Course Fees
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
