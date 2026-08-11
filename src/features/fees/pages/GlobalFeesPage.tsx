import React, { useState, useMemo } from 'react';
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
import { useFeesStore } from '../store/fees.store';

export const GlobalFeesPage: React.FC = () => {
  const navigate = useNavigate();
  const records = useFeesStore((s) => s.records);

  const summary = useMemo(() => {
    const totalExpected = records.reduce((acc, r) => acc + r.payableINR, 0);
    const totalCollected = records.reduce((acc, r) => acc + r.paidINR, 0);
    const totalPending = records.reduce((acc, r) => acc + (r.status !== 'Overdue' ? r.pendingINR : 0), 0);
    const totalOverdue = records.reduce((acc, r) => acc + (r.status === 'Overdue' ? r.pendingINR : 0), 0);

    return { totalExpected, totalCollected, totalPending, totalOverdue };
  }, [records]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

    records.forEach((r) => {
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

    return Object.values(map);
  }, [records]);

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
    <div className="space-y-5 font-sans text-xs text-slate-900 text-left pb-24 sm:pb-12 min-w-0 w-full max-w-full overflow-x-hidden">
      {/* 1. HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
        <div>
          <h1 className="text-base sm:text-xl font-medium text-slate-900 tracking-tight leading-tight">
            Fees Collection
          </h1>
          <p className="text-slate-500 text-xs font-normal mt-0.5">
            Manage fee collection, pending balances, and student payment receipts across all courses.
          </p>
        </div>
      </div>

      {/* 2. SUMMARY METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 min-w-0">
        {/* Total Expected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 font-normal">
            <span className="text-[11px] truncate">Total Expected</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-600 shrink-0" />
          </div>
          <p className="text-sm sm:text-lg font-medium text-slate-900 truncate">
            ₹{summary.totalExpected.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Collected */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 font-normal">
            <span className="text-[11px] truncate">Collected</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          </div>
          <p className="text-sm sm:text-lg font-medium text-emerald-700 truncate">
            ₹{summary.totalCollected.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Pending */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 font-normal">
            <span className="text-[11px] truncate">Pending</span>
            <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          </div>
          <p className="text-sm sm:text-lg font-medium text-amber-700 truncate">
            ₹{summary.totalPending.toLocaleString('en-IN')}
          </p>
        </div>

        {/* Total Overdue */}
        <div className="bg-white p-3.5 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <div className="flex items-center justify-between text-slate-500 font-normal">
            <span className="text-[11px] truncate">Overdue</span>
            <AlertCircle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
          </div>
          <p className="text-sm sm:text-lg font-medium text-rose-700 truncate">
            ₹{summary.totalOverdue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 3. SEARCH & FILTERS BAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search course title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs font-normal focus:outline-none focus:border-blue-500 bg-white"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-3 rounded-xl border border-slate-200 bg-white text-xs font-normal text-slate-700 focus:outline-none focus:border-blue-500 w-full sm:w-auto"
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
        <h2 className="text-sm font-medium text-slate-900 px-0.5">
          Course-wise Collection Breakdown
        </h2>

        {filteredCourses.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-500 font-normal">
            No courses match the specified filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 min-w-0">
            {filteredCourses.map((c) => {
              const collectedPct = c.expected > 0 ? Math.round((c.collected / c.expected) * 100) : 0;
              return (
                <div
                  key={c.courseUuid}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all min-w-0"
                >
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-medium text-xs text-slate-900 truncate leading-snug">
                            {c.courseTitle}
                          </h3>
                          <span className="text-[11px] text-slate-500 font-normal truncate block">
                            {c.studentsCount} Students Enrolled
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] font-normal">
                        <span className="text-slate-500">Collected Progress</span>
                        <span className="text-slate-900 font-medium">{collectedPct}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${collectedPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Fee Numbers Grid */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                      <div>
                        <span className="text-slate-500 font-normal block">Expected</span>
                        <span className="font-medium text-slate-900">₹{c.expected.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-normal block">Collected</span>
                        <span className="font-medium text-emerald-600">₹{c.collected.toLocaleString('en-IN')}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-normal block">Pending</span>
                        <span className="font-medium text-amber-600">₹{(c.pending + c.overdue).toLocaleString('en-IN')}</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Action */}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/courses/${c.courseUuid}/fees`)}
                    className="w-full font-medium h-9 rounded-xl border-slate-200 hover:bg-blue-50 hover:text-blue-600 justify-center text-xs"
                    rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View Details
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
