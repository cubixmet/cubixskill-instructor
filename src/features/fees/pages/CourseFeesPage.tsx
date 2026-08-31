import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Send,
  RefreshCw,
  Settings2,
  Wallet,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import {
  courseFeesCollectionService,
  CourseFeeSummary,
  CourseFeeConfigurationData,
  StudentFeeRecordItem,
  FeePaymentItem,
} from '../../../services/courseFeesCollection.service';
import { ConfigureFeePlanModal } from '../components/ConfigureFeePlanModal';
import { CollectPaymentModal } from '../components/CollectPaymentModal';
import { StudentFeeAccountDrawer } from '../components/StudentFeeAccountDrawer';
import { StudentAvatar } from '../components/StudentAvatar';
import { parseApiError } from '../../../api/errors';

export const CourseFeesPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const courseUuid = params.courseId || params.courseUuid;

  const [summary, setSummary] = useState<CourseFeeSummary | null>(null);
  const [courseConfig, setCourseConfig] = useState<CourseFeeConfigurationData | null>(null);
  const [records, setRecords] = useState<StudentFeeRecordItem[]>([]);
  const [paymentsLedger, setPaymentsLedger] = useState<Array<FeePaymentItem & { student_id: string; student_name: string; student_email: string; student_code: string }>>([]);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Filters & Tabs
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState<'students' | 'ledger' | 'overdue'>('students');

  // Modals & Drawers
  const [isConfigModalOpen, setIsConfigModalOpen] = useState<boolean>(false);
  const [selectedForPayment, setSelectedForPayment] = useState<StudentFeeRecordItem | null>(null);
  const [drawerAccountId, setDrawerAccountId] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const loadAllData = useCallback(async () => {
    if (!courseUuid) {
      setError('Course UUID is missing from route.');
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const [sumData, configData, recData, ledgerData] = await Promise.all([
        courseFeesCollectionService.getSummary(courseUuid),
        courseFeesCollectionService.getCourseFeeConfiguration(courseUuid),
        courseFeesCollectionService.getStudentAccounts(courseUuid, { search, status: statusFilter }),
        courseFeesCollectionService.getPaymentsLedger(courseUuid),
      ]);

      setSummary(sumData);
      setCourseConfig(configData);
      setRecords(recData);
      setPaymentsLedger(ledgerData);
    } catch (err: any) {
      console.error('Failed to load course fee collection data:', err);
      const parsed = parseApiError(err);
      setError(parsed.message || 'Failed to load fee collection data.');
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // Refetch student accounts only on subsequent search / status filter changes (skip initial mount)
  const isInitialMount = React.useRef(true);
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (!courseUuid) return;
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const recData = await courseFeesCollectionService.getStudentAccounts(courseUuid, { search, status: statusFilter });
        if (!isCancelled) {
          setRecords(recData);
        }
      } catch (err) {
        console.error('Failed to filter student accounts:', err);
      }
    }, 300);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [courseUuid, search, statusFilter]);

  const handleSendReminder = async (r: StudentFeeRecordItem) => {
    if (!courseUuid || !r.fee_account_id) return;
    try {
      await courseFeesCollectionService.sendReminder(courseUuid, r.fee_account_id, { send_email: true });
      showToast(`Fee reminder dispatched to ${r.student_name}.`);
    } catch (err: any) {
      console.error('Failed to send reminder:', err);
      showToast('Failed to send reminder.');
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st.toUpperCase()) {
      case 'PAID':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)] flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-[#34D399]" /> Paid
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 dark:bg-[rgba(37,99,235,0.12)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)] flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-blue-600 dark:text-[#60A5FA]" /> Partial
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-rose-50 dark:bg-[rgba(239,68,68,0.10)] text-rose-700 dark:text-[#F87171] border border-rose-200 dark:border-[rgba(248,113,113,0.25)] flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-rose-600 dark:text-[#F87171]" /> Overdue
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] border border-[#CBD5E1] dark:border-[#334155] flex items-center gap-1 w-fit">
            Not Configured
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] text-amber-700 dark:text-[#FBBF24] border border-amber-200 dark:border-amber-500/30 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600 dark:text-[#FBBF24]" /> Pending
          </span>
        );
    }
  };

  const overdueRecords = useMemo(() => {
    return records.filter((r) => r.status.toUpperCase() === 'OVERDUE' || r.overdue_amount > 0);
  }, [records]);

  if (isLoading && !summary) {
    return (
      <div className="space-y-4 p-4 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left">
        <div className="h-8 bg-slate-200 dark:bg-[#1E293B] rounded-xl w-48 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-64 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (error && !summary) {
    return (
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-[rgba(248,113,113,0.25)] text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Unable to Load Fee Collection Dashboard</h3>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{error}</p>
        <Button size="sm" onClick={loadAllData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Loading
        </Button>
      </div>
    );
  }

  const currSymbol = summary?.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] text-left pb-24 md:pb-8 min-w-0 w-full max-w-full overflow-x-hidden font-normal">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR WITH COURSE-LEVEL FEE CONFIGURATION ACTION */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#2563EB] dark:text-[#60A5FA] block">
            Student Fee Collection &amp; Ledger
          </span>
          <h1 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
            {summary?.course_title || 'Course Fee Management'}
          </h1>
          <div className="flex items-center gap-2 pt-0.5 flex-wrap">
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">Fee Plan:</span>
            {courseConfig?.is_configured ? (
              <span className="text-[11px] text-emerald-700 dark:text-[#34D399] font-medium bg-emerald-50 dark:bg-[rgba(16,185,129,0.12)] px-2 py-0.5 rounded-md border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]">
                Configured ({courseConfig.plan_type} · {courseConfig.currency || 'INR'} {courseConfig.total_fee?.toLocaleString('en-IN')} · {courseConfig.number_of_installments} Installments)
              </span>
            ) : (
              <span className="text-[11px] text-amber-700 dark:text-[#FBBF24] font-medium bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-500/30">
                Not Configured
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <Button
            size="sm"
            onClick={() => setIsConfigModalOpen(true)}
            className="h-9 font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl flex-1 sm:flex-initial justify-center"
            leftIcon={<Settings2 className="w-3.5 h-3.5" />}
          >
            {courseConfig?.is_configured ? 'Edit Fee Config' : 'Configure Fee'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadAllData}
            className="h-9 font-medium bg-white dark:bg-[#172033] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#1E293B]"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. DASHBOARD STATS SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block truncate">Total Students</span>
          <p className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            {summary?.total_students || 0}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium block truncate">Total Expected</span>
          <p className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            {currSymbol}{(summary?.total_expected || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-emerald-600 dark:text-[#10B981] font-medium block truncate">Collected</span>
          <p className="text-base sm:text-lg font-semibold text-emerald-600 dark:text-[#10B981]">
            {currSymbol}{(summary?.total_collected || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-amber-600 dark:text-[#F59E0B] font-medium block truncate">Outstanding</span>
          <p className="text-base sm:text-lg font-semibold text-amber-600 dark:text-[#F59E0B]">
            {currSymbol}{(summary?.outstanding_balance || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-rose-600 dark:text-[#F87171] font-medium block truncate">Overdue</span>
          <p className="text-base sm:text-lg font-semibold text-rose-600 dark:text-[#F87171]">
            {currSymbol}{(summary?.overdue_amount || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* 2. TAB WORKSPACE NAVIGATION */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#263244] overflow-x-auto no-scrollbar whitespace-nowrap">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'students'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          Enrolled Student Fees ({records.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'ledger'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          Course Payment Ledger &amp; Receipts ({paymentsLedger.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`py-2.5 px-4 font-semibold text-xs border-b-2 cursor-pointer transition-colors shrink-0 ${
            activeTab === 'overdue'
              ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
              : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
          }`}
        >
          Overdue Workspace ({overdueRecords.length})
        </button>
      </div>

      {/* TAB 1: ENROLLED STUDENTS WORKSPACE */}
      {activeTab === 'students' && (
        <div className="space-y-4 min-w-0">
          {/* SEARCH & STATUS FILTER TOOLBAR */}
          <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between min-w-0">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student name, code, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9.5 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#3B82F6] font-normal"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9.5 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#3B82F6] cursor-pointer w-full sm:w-auto"
              >
                <option value="all">All Fee Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
                <option value="NOT_CONFIGURED">Not Configured</option>
              </select>
            </div>
          </div>

          {/* DESKTOP STUDENT TABLE (hidden on mobile) */}
          <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Student</th>
                    <th className="p-3.5">Fee Plan</th>
                    <th className="p-3.5">Total Fee</th>
                    <th className="p-3.5">Paid</th>
                    <th className="p-3.5">Balance</th>
                    <th className="p-3.5">Next Due</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244] font-normal">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-[#64748B] dark:text-[#94A3B8] font-normal">
                        No enrolled student fee records match your query.
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => (
                      <tr key={r.student_id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033] transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-2.5">
                            <StudentAvatar src={r.avatar_url} name={r.student_name} />
                            <div className="min-w-0">
                              <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] block truncate">{r.student_name}</span>
                              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate block">{r.student_code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-[#475569] dark:text-[#CBD5E1]">
                          {r.plan_type !== 'NONE' ? r.plan_type : '—'}
                        </td>
                        <td className="p-3.5 text-[#0F172A] dark:text-[#F8FAFC] font-semibold">
                          {r.fee_account_id ? `${r.currency} ${r.total_fee.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5 text-emerald-600 dark:text-[#10B981] font-semibold">
                          {r.fee_account_id ? `${r.currency} ${r.paid_amount.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td className="p-3.5 text-amber-600 dark:text-[#F59E0B] font-semibold">
                          {r.fee_account_id ? `${r.currency} ${r.balance.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5 text-[#475569] dark:text-[#CBD5E1]">
                          {r.next_due_date || '—'}
                        </td>
                        <td className="p-3.5">{getStatusBadge(r.status)}</td>
                        <td className="p-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.fee_account_id ? (
                              <>
                                {r.balance > 0 && (
                                  <Button
                                    size="xs"
                                    onClick={() => setSelectedForPayment(r)}
                                    className="font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] h-8 px-2.5 cursor-pointer"
                                  >
                                    Collect
                                  </Button>
                                )}
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => setDrawerAccountId(r.fee_account_id)}
                                  className="font-medium border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B] h-8 px-2 cursor-pointer"
                                  title="View Student Ledger &amp; Override"
                                >
                                  Ledger
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal italic">Pending Setup</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* MOBILE CARDS (COMPACT PRESENTATION) */}
          <div className="md:hidden space-y-3 min-w-0">
            {records.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] font-normal">
                No student fee records found.
              </div>
            ) : (
              records.map((r) => (
                <div key={r.student_id} className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3 font-normal min-w-0">
                  <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-2.5 gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StudentAvatar src={r.avatar_url} name={r.student_name} />
                      <div className="min-w-0">
                        <h3 className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">{r.student_name}</h3>
                        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono truncate">{r.student_code}</p>
                      </div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] space-y-1 text-[11px]">
                    <div className="flex justify-between text-[#475569] dark:text-[#CBD5E1]">
                      <span>Total Fee</span>
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{r.fee_account_id ? `${r.currency} ${r.total_fee.toLocaleString('en-IN')}` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-[#10B981]">
                      <span>Paid</span>
                      <span className="font-semibold">{r.fee_account_id ? `${r.currency} ${r.paid_amount.toLocaleString('en-IN')}` : '₹0'}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 dark:text-[#F59E0B] font-medium">
                      <span>Balance</span>
                      <span className="font-semibold">{r.fee_account_id ? `${r.currency} ${r.balance.toLocaleString('en-IN')}` : '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    {r.fee_account_id ? (
                      <>
                        {r.balance > 0 && (
                          <Button size="sm" onClick={() => setSelectedForPayment(r)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-9 min-h-[42px] justify-center">
                            Collect Payment
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setDrawerAccountId(r.fee_account_id)} className="font-medium h-9 min-h-[42px] border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]">
                          Ledger
                        </Button>
                      </>
                    ) : (
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal italic w-full text-center py-1">Pending Course Fee Setup</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: COURSE PAYMENT LEDGER */}
      {activeTab === 'ledger' && (
        <Card className="bg-white dark:bg-[#111827] p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3 font-normal min-w-0">
          <h2 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            Course Payments Ledger &amp; Receipts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] uppercase">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244] font-normal">
                {paymentsLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#64748B] dark:text-[#94A3B8] font-normal">
                      No payments collected for this course yet.
                    </td>
                  </tr>
                ) : (
                  paymentsLedger.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033]">
                      <td className="p-3 font-mono font-medium text-[#2563EB] dark:text-[#60A5FA]">
                        {p.receipt_number}
                      </td>
                      <td className="p-3">
                        <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC] block">{p.student_name}</span>
                        <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-mono block">{p.student_code}</span>
                      </td>
                      <td className="p-3 text-[#475569] dark:text-[#CBD5E1]">{p.payment_date}</td>
                      <td className="p-3 text-[#0F172A] dark:text-[#CBD5E1]">{p.payment_method}</td>
                      <td className="p-3 font-mono text-[11px] text-[#64748B] dark:text-[#94A3B8]">{p.reference_number || '—'}</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-[#10B981] font-semibold">
                        {p.currency} {p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB 3: OVERDUE WORKSPACE */}
      {activeTab === 'overdue' && (
        <Card className="bg-white dark:bg-[#111827] p-4 border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-3 font-normal min-w-0">
          <h2 className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
            Overdue Student Installments
          </h2>
          <div className="space-y-2.5">
            {overdueRecords.length === 0 ? (
              <p className="text-center text-[#64748B] dark:text-[#94A3B8] py-8 font-normal">Great news! No student installments are overdue.</p>
            ) : (
              overdueRecords.map((r) => (
                <div key={r.student_id} className="p-3.5 bg-rose-50/50 dark:bg-[rgba(239,68,68,0.10)] rounded-xl border border-rose-200 dark:border-[rgba(248,113,113,0.25)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
                  <div className="space-y-0.5 min-w-0">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs block truncate">{r.student_name} ({r.student_code})</span>
                    <span className="text-[11px] text-rose-600 dark:text-[#F87171] font-medium block truncate">Overdue: {r.currency} {r.overdue_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="xs" onClick={() => setSelectedForPayment(r)} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-8 px-3 cursor-pointer">
                      Collect Payment
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => handleSendReminder(r)} className="font-medium h-8 px-3 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-100/50 cursor-pointer">
                      Send Reminder
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      )}

      {/* MODALS & DRAWERS */}
      <ConfigureFeePlanModal
        isOpen={isConfigModalOpen}
        onClose={() => setIsConfigModalOpen(false)}
        courseUuid={courseUuid || ''}
        existingConfig={courseConfig}
        onSuccess={loadAllData}
      />

      <CollectPaymentModal
        isOpen={!!selectedForPayment}
        onClose={() => setSelectedForPayment(null)}
        courseUuid={courseUuid || ''}
        studentRecord={selectedForPayment}
        onSuccess={loadAllData}
      />

      <StudentFeeAccountDrawer
        isOpen={!!drawerAccountId}
        onClose={() => setDrawerAccountId(null)}
        courseUuid={courseUuid || ''}
        accountId={drawerAccountId}
        onCollectPaymentClick={() => {
          const rec = records.find((r) => r.fee_account_id === drawerAccountId);
          setDrawerAccountId(null);
          if (rec) setSelectedForPayment(rec);
        }}
        onRefreshParent={loadAllData}
      />
    </div>
  );
};
