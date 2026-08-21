import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
  Send,
  Plus,
  RefreshCw,
  FileText,
  UserCheck,
  Calendar,
  Layers,
  Filter,
  Settings2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
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
  const { courseUuid } = useParams<{ courseUuid: string }>();

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

  // Refetch student accounts on search / status filter change
  useEffect(() => {
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
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
          </span>
        );
      case 'PARTIAL':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 border border-blue-200/80 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-blue-600" /> Partial
          </span>
        );
      case 'OVERDUE':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200/80 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue
          </span>
        );
      case 'NOT_CONFIGURED':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 flex items-center gap-1 w-fit">
            Not Configured
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-normal bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200/80 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
    }
  };

  const overdueRecords = useMemo(() => {
    return records.filter((r) => r.status.toUpperCase() === 'OVERDUE' || r.overdue_amount > 0);
  }, [records]);

  if (isLoading && !summary) {
    return (
      <div className="space-y-4 p-4 font-sans text-xs text-slate-900 text-left">
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
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 dark:border-rose-900 text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to Load Fee Collection Dashboard</h3>
        <p className="text-xs text-slate-600 dark:text-slate-400">{error}</p>
        <Button size="sm" onClick={loadAllData} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Loading
        </Button>
      </div>
    );
  }

  const currSymbol = summary?.currency === 'USD' ? '$' : '₹';

  return (
    <div className="space-y-5 font-sans text-xs text-slate-900 dark:text-slate-100 text-left pb-24 sm:pb-12 min-w-0 w-full max-w-full overflow-x-hidden font-normal">
      {/* Toast Banner */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white font-medium text-xs px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* HEADER BAR WITH COURSE-LEVEL FEE CONFIGURATION ACTION */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-normal uppercase tracking-wider text-blue-600 dark:text-blue-400 block">
            Student Fee Collection & Ledger
          </span>
          <h1 className="text-base font-semibold text-slate-900 dark:text-white truncate">
            {summary?.course_title || 'Course Fee Management'}
          </h1>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[11px] text-slate-500 font-normal">Fee Configuration:</span>
            {courseConfig?.is_configured ? (
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-md border border-emerald-200/60">
                Configured ({courseConfig.plan_type} · {courseConfig.currency || 'INR'} {courseConfig.total_fee?.toLocaleString('en-IN')} · {courseConfig.number_of_installments} Installments)
              </span>
            ) : (
              <span className="text-[11px] text-amber-600 dark:text-amber-400 font-normal bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-md border border-amber-200/60">
                Not Configured
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            size="sm"
            onClick={() => setIsConfigModalOpen(true)}
            className="h-9 font-medium bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
            leftIcon={<Settings2 className="w-3.5 h-3.5" />}
          >
            {courseConfig?.is_configured ? 'Edit Course Fee Configuration' : 'Configure Course Fee'}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={loadAllData}
            className="h-9 font-normal bg-white dark:bg-[#172033] border-slate-200 dark:border-[#334155]"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. DASHBOARD STATS SUMMARY */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-normal block truncate">Total Students</span>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {summary?.total_students || 0}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-slate-500 font-normal block truncate">Total Fee Expected</span>
          <p className="text-base font-semibold text-slate-900 dark:text-white">
            {currSymbol}{(summary?.total_expected || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-emerald-600 font-normal block truncate">Collected</span>
          <p className="text-base font-semibold text-emerald-600 dark:text-emerald-400">
            {currSymbol}{(summary?.total_collected || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-1">
          <span className="text-[11px] text-amber-600 font-normal block truncate">Outstanding Balance</span>
          <p className="text-base font-semibold text-amber-600 dark:text-amber-400">
            {currSymbol}{(summary?.outstanding_balance || 0).toLocaleString('en-IN')}
          </p>
        </Card>

        <Card className="bg-white dark:bg-[#111827] p-3.5 sm:p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-1 col-span-2 lg:col-span-1">
          <span className="text-[11px] text-rose-600 font-normal block truncate">Overdue Amount</span>
          <p className="text-base font-semibold text-rose-600 dark:text-rose-400">
            {currSymbol}{(summary?.overdue_amount || 0).toLocaleString('en-IN')}
          </p>
        </Card>
      </div>

      {/* 2. TAB WORKSPACE NAVIGATION */}
      <div className="flex border-b border-slate-200 dark:border-[#263244]">
        <button
          type="button"
          onClick={() => setActiveTab('students')}
          className={`py-2.5 px-4 font-medium text-xs border-b-2 cursor-pointer transition-colors ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Enrolled Student Fees ({records.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('ledger')}
          className={`py-2.5 px-4 font-medium text-xs border-b-2 cursor-pointer transition-colors ${
            activeTab === 'ledger'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Course Payment Ledger & Receipts ({paymentsLedger.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('overdue')}
          className={`py-2.5 px-4 font-medium text-xs border-b-2 cursor-pointer transition-colors ${
            activeTab === 'overdue'
              ? 'border-blue-600 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Overdue Workspace ({overdueRecords.length})
        </button>
      </div>

      {/* TAB 1: ENROLLED STUDENTS WORKSPACE */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          {/* SEARCH & STATUS FILTER TOOLBAR */}
          <div className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
            <div className="relative flex-1 min-w-0">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student name, code, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-normal"
              />
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-9 px-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-700 dark:text-slate-200 focus:outline-none focus:border-blue-500"
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
          <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[850px]">
                <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-normal text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                <tbody className="divide-y divide-slate-100 dark:divide-[#263244] font-normal">
                  {records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400 font-normal">
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
                              <span className="font-normal text-slate-900 dark:text-white block truncate">{r.student_name}</span>
                              <span className="text-[11px] text-slate-400 font-mono truncate block">{r.student_code}</span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
                          {r.plan_type !== 'NONE' ? r.plan_type : '—'}
                        </td>
                        <td className="p-3.5 text-slate-900 dark:text-white">
                          {r.fee_account_id ? `${r.currency} ${r.total_fee.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5 text-emerald-600 dark:text-emerald-400">
                          {r.fee_account_id ? `${r.currency} ${r.paid_amount.toLocaleString('en-IN')}` : '₹0'}
                        </td>
                        <td className="p-3.5 text-amber-600 dark:text-amber-400">
                          {r.fee_account_id ? `${r.currency} ${r.balance.toLocaleString('en-IN')}` : '—'}
                        </td>
                        <td className="p-3.5 text-slate-600 dark:text-slate-300">
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
                                    className="font-normal bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] h-8 px-2.5"
                                  >
                                    Collect
                                  </Button>
                                )}
                                <Button
                                  size="xs"
                                  variant="outline"
                                  onClick={() => setDrawerAccountId(r.fee_account_id)}
                                  className="font-normal border-slate-200 dark:border-[#334155] text-slate-700 dark:text-slate-200 h-8 px-2"
                                  title="View Student Ledger & Override"
                                >
                                  Ledger
                                </Button>
                              </>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-normal italic">Pending Setup</span>
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

          {/* MOBILE CARDS (COMPACT ~400px PRESENTATION) */}
          <div className="md:hidden space-y-3 max-w-md mx-auto">
            {records.length === 0 ? (
              <div className="p-8 text-center bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] text-slate-400 font-normal">
                No student fee records found.
              </div>
            ) : (
              records.map((r) => (
                <div key={r.student_id} className="bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs space-y-3 font-normal">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#263244] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <StudentAvatar src={r.avatar_url} name={r.student_name} />
                      <div>
                        <h3 className="font-normal text-xs text-slate-900 dark:text-white truncate">{r.student_name}</h3>
                        <p className="text-[11px] text-slate-400 font-mono">{r.student_code}</p>
                      </div>
                    </div>
                    {getStatusBadge(r.status)}
                  </div>

                  <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-100 dark:border-[#334155] space-y-1 text-[11px]">
                    <div className="flex justify-between text-slate-600 dark:text-slate-400">
                      <span>Total Fee</span>
                      <span className="font-normal text-slate-900 dark:text-white">{r.fee_account_id ? `${r.currency} ${r.total_fee.toLocaleString('en-IN')}` : '—'}</span>
                    </div>
                    <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                      <span>Paid</span>
                      <span className="font-normal">{r.fee_account_id ? `${r.currency} ${r.paid_amount.toLocaleString('en-IN')}` : '₹0'}</span>
                    </div>
                    <div className="flex justify-between text-amber-600 dark:text-amber-400 font-normal">
                      <span>Balance</span>
                      <span>{r.fee_account_id ? `${r.currency} ${r.balance.toLocaleString('en-IN')}` : '—'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {r.fee_account_id ? (
                      <>
                        {r.balance > 0 && (
                          <Button size="sm" onClick={() => setSelectedForPayment(r)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-normal h-9">
                            Collect Payment
                          </Button>
                        )}
                        <Button size="sm" variant="outline" onClick={() => setDrawerAccountId(r.fee_account_id)} className="font-normal h-9 border-slate-200 dark:border-[#334155]">
                          Ledger
                        </Button>
                      </>
                    ) : (
                      <span className="text-[11px] text-slate-400 font-normal italic w-full text-center py-1">Pending Course Fee Setup</span>
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
        <Card className="bg-white dark:bg-[#111827] p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-3 font-normal">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Course Payments Ledger & Receipts
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs min-w-[700px]">
              <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-[11px] font-normal text-slate-500 uppercase">
                <tr>
                  <th className="p-3">Receipt #</th>
                  <th className="p-3">Student</th>
                  <th className="p-3">Payment Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Reference</th>
                  <th className="p-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263244] font-normal">
                {paymentsLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-normal">
                      No payments collected for this course yet.
                    </td>
                  </tr>
                ) : (
                  paymentsLedger.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70 dark:hover:bg-[#172033]">
                      <td className="p-3 font-mono font-normal text-blue-600 dark:text-blue-400">
                        {p.receipt_number}
                      </td>
                      <td className="p-3">
                        <span className="font-normal text-slate-900 dark:text-white block">{p.student_name}</span>
                        <span className="text-[11px] text-slate-400 font-mono block">{p.student_code}</span>
                      </td>
                      <td className="p-3 text-slate-600 dark:text-slate-300">{p.payment_date}</td>
                      <td className="p-3 text-slate-800 dark:text-slate-200">{p.payment_method}</td>
                      <td className="p-3 font-mono text-[11px] text-slate-400">{p.reference_number || '—'}</td>
                      <td className="p-3 text-right text-emerald-600 dark:text-emerald-400">
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
        <Card className="bg-white dark:bg-[#111827] p-4 border-slate-200 dark:border-[#263244] shadow-2xs space-y-3 font-normal">
          <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
            Overdue Student Installments
          </h2>
          <div className="space-y-2">
            {overdueRecords.length === 0 ? (
              <p className="text-center text-slate-400 py-8 font-normal">Great news! No student installments are overdue.</p>
            ) : (
              overdueRecords.map((r) => (
                <div key={r.student_id} className="p-3.5 bg-rose-50/50 dark:bg-rose-950/10 rounded-xl border border-rose-200 dark:border-rose-900/40 flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="font-normal text-slate-900 dark:text-white text-xs block">{r.student_name} ({r.student_code})</span>
                    <span className="text-[11px] text-rose-600 dark:text-rose-400 font-normal block">Overdue: {r.currency} {r.overdue_amount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="xs" onClick={() => setSelectedForPayment(r)} className="bg-emerald-600 text-white font-normal h-8">
                      Collect Payment
                    </Button>
                    <Button size="xs" variant="outline" onClick={() => handleSendReminder(r)} className="font-normal h-8 border-rose-300">
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
