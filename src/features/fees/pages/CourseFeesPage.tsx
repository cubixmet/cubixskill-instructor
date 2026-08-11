import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Search,
  Wallet,
  CheckCircle2,
  Clock,
  AlertCircle,
  History,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { useFeesStore, StudentFeeRecord } from '../store/fees.store';
import { CollectPaymentModal } from '../components/CollectPaymentModal';

export const CourseFeesPage: React.FC = () => {
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();
  const allRecords = useFeesStore((s) => s.records);

  const records = useMemo(
    () => allRecords.filter((r) => r.courseUuid === courseUuid),
    [allRecords, courseUuid]
  );

  const summary = useMemo(() => {
    const courseFee = records[0]?.courseFeeINR || 0;
    const studentsCount = records.length;
    const expected = records.reduce((acc, r) => acc + r.payableINR, 0);
    const collected = records.reduce((acc, r) => acc + r.paidINR, 0);
    const pending = records.reduce((acc, r) => acc + (r.status !== 'Overdue' ? r.pendingINR : 0), 0);
    const overdue = records.reduce((acc, r) => acc + (r.status === 'Overdue' ? r.pendingINR : 0), 0);

    return { courseFee, studentsCount, expected, collected, pending, overdue };
  }, [records]);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Modal State
  const [selectedRecordForPayment, setSelectedRecordForPayment] = useState<StudentFeeRecord | null>(null);
  const [selectedRecordForHistory, setSelectedRecordForHistory] = useState<StudentFeeRecord | null>(null);

  // Filter student records
  const filteredRecords = useMemo(() => {
    const q = search.toLowerCase();
    return records.filter((r) => {
      const matchSearch =
        !q ||
        r.studentName.toLowerCase().includes(q) ||
        r.studentEmail.toLowerCase().includes(q) ||
        (r.studentPhone && r.studentPhone.includes(q));

      const matchStatus = statusFilter === 'all' || r.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [records, search, statusFilter]);

  const getStatusBadge = (status: StudentFeeRecord['status']) => {
    switch (status) {
      case 'Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1 w-fit">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Paid
          </span>
        );
      case 'Partially Paid':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700 border border-blue-200/60 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-blue-600" /> Partially Paid
          </span>
        );
      case 'Pending':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200/60 flex items-center gap-1 w-fit">
            <Clock className="w-3 h-3 text-amber-600" /> Pending
          </span>
        );
      case 'Overdue':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200/60 flex items-center gap-1 w-fit">
            <AlertCircle className="w-3 h-3 text-rose-600" /> Overdue
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-5 font-sans text-xs text-slate-900 text-left pb-24 sm:pb-12 min-w-0 w-full max-w-full overflow-x-hidden">
      {/* 1. COURSE SUMMARY STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 min-w-0">
        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <span className="text-[10px] text-slate-500 font-normal block truncate">Course Fee / Student</span>
          <p className="text-xs sm:text-base font-medium text-slate-900 truncate">
            ₹{summary.courseFee.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <span className="text-[10px] text-slate-500 font-normal block truncate">Expected Collection</span>
          <p className="text-xs sm:text-base font-medium text-slate-900 truncate">
            ₹{summary.expected.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <span className="text-[10px] text-slate-500 font-normal block truncate">Collected</span>
          <p className="text-xs sm:text-base font-medium text-emerald-700 truncate">
            ₹{summary.collected.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0">
          <span className="text-[10px] text-slate-500 font-normal block truncate">Pending</span>
          <p className="text-xs sm:text-base font-medium text-amber-700 truncate">
            ₹{summary.pending.toLocaleString('en-IN')}
          </p>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-1 min-w-0 col-span-2 lg:col-span-1">
          <span className="text-[10px] text-slate-500 font-normal block truncate">Overdue</span>
          <p className="text-xs sm:text-base font-medium text-rose-700 truncate">
            ₹{summary.overdue.toLocaleString('en-IN')}
          </p>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between min-w-0">
        <div className="relative flex-1 min-w-0">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search student name, email or phone..."
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
            <option value="all">All Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Partially Paid">Partially Paid</option>
            <option value="Pending">Pending</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* 3. DESKTOP STUDENT FEES TABLE (hidden on mobile) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden min-w-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs min-w-[800px]">
            <thead className="bg-slate-50 border-b border-slate-200 text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Student</th>
                <th className="p-3.5">Fee Breakdown</th>
                <th className="p-3.5">Payable</th>
                <th className="p-3.5">Paid</th>
                <th className="p-3.5">Pending</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-normal">
                    No student fee records match your query.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((r) => (
                  <tr key={r.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={r.avatarUrl}
                          alt={r.studentName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <span className="font-medium text-slate-900 block truncate">{r.studentName}</span>
                          <span className="text-[11px] text-slate-500 font-normal truncate block">{r.studentEmail}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="space-y-0.5 text-[11px] font-normal">
                        <span className="text-slate-500 block">Fee: ₹{r.courseFeeINR.toLocaleString('en-IN')}</span>
                        {r.discountINR > 0 && (
                          <span className="text-emerald-600 block">Discount: -₹{r.discountINR.toLocaleString('en-IN')}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-3.5 font-medium text-slate-900">
                      ₹{r.payableINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-medium text-emerald-600">
                      ₹{r.paidINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5 font-medium text-amber-600">
                      ₹{r.pendingINR.toLocaleString('en-IN')}
                    </td>
                    <td className="p-3.5">{getStatusBadge(r.status)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {r.pendingINR > 0 && (
                          <Button
                            size="xs"
                            onClick={() => setSelectedRecordForPayment(r)}
                            className="font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] h-8 px-2.5"
                          >
                            Collect Payment
                          </Button>
                        )}
                        <Button
                          size="xs"
                          variant="outline"
                          onClick={() => setSelectedRecordForHistory(r)}
                          className="font-medium border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg text-[11px] h-8 px-2"
                          title="View Payment History"
                        >
                          <History className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. MOBILE STUDENT FEE CARDS (visible < md) */}
      <div className="md:hidden space-y-3 min-w-0">
        {filteredRecords.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 font-normal">
            No student fee records found.
          </div>
        ) : (
          filteredRecords.map((r) => (
            <div
              key={r.studentId}
              className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs space-y-3 min-w-0"
            >
              {/* Header: Student Name + Avatar + Status */}
              <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2.5 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={r.avatarUrl}
                    alt={r.studentName}
                    className="w-9 h-9 rounded-full object-cover border border-slate-200 shrink-0"
                  />
                  <div className="min-w-0">
                    <h3 className="font-medium text-xs text-slate-900 truncate leading-snug">
                      {r.studentName}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-normal truncate">
                      {r.studentEmail}
                    </p>
                  </div>
                </div>
                <div className="shrink-0">{getStatusBadge(r.status)}</div>
              </div>

              {/* Fee Breakdown Stack */}
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1 text-[11px] font-normal">
                <div className="flex justify-between text-slate-600">
                  <span>Course Fee</span>
                  <span className="font-medium text-slate-900">₹{r.courseFeeINR.toLocaleString('en-IN')}</span>
                </div>
                {r.discountINR > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>Discount</span>
                    <span className="font-medium">-₹{r.discountINR.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-900 pt-1 border-t border-slate-200/60 font-medium">
                  <span>Payable</span>
                  <span>₹{r.payableINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-emerald-600">
                  <span>Paid</span>
                  <span className="font-medium">₹{r.paidINR.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-amber-600">
                  <span>Pending</span>
                  <span className="font-medium">₹{r.pendingINR.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1">
                {r.pendingINR > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setSelectedRecordForPayment(r)}
                    className="flex-1 font-medium bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs h-9 justify-center"
                    leftIcon={<Wallet className="w-3.5 h-3.5" />}
                  >
                    Collect Payment
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedRecordForHistory(r)}
                  className="font-medium border-slate-200 text-slate-700 hover:bg-slate-50 rounded-xl text-xs h-9 px-3"
                  leftIcon={<History className="w-3.5 h-3.5" />}
                >
                  History ({r.paymentHistory.length})
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* 5. COLLECT PAYMENT MODAL */}
      <CollectPaymentModal
        isOpen={!!selectedRecordForPayment}
        onClose={() => setSelectedRecordForPayment(null)}
        record={selectedRecordForPayment}
      />

      {/* 6. PAYMENT HISTORY MODAL */}
      {selectedRecordForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-4 space-y-4 font-sans text-xs text-slate-900 text-left">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-medium text-sm text-slate-900">Payment History</h3>
                <p className="text-[11px] text-slate-500 font-normal">{selectedRecordForHistory.studentName}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedRecordForHistory(null)}
                className="text-slate-400 hover:text-slate-600 font-medium text-base p-1 cursor-pointer"
              >
                ×
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 hide-scrollbar">
              {selectedRecordForHistory.paymentHistory.length === 0 ? (
                <p className="text-center text-slate-400 py-6 font-normal">No payment history recorded yet.</p>
              ) : (
                selectedRecordForHistory.paymentHistory.map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-1 font-normal">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-emerald-600 text-xs">₹{p.amountINR.toLocaleString('en-IN')}</span>
                      <span className="text-[10px] text-slate-500">{p.paymentDate}</span>
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-600">
                      <span>Method: <strong className="font-medium text-slate-800">{p.paymentMethod}</strong></span>
                      {p.referenceId && <span className="font-mono text-[10px]">{p.referenceId}</span>}
                    </div>
                    {p.notes && <p className="text-[11px] text-slate-500 italic pt-0.5">"{p.notes}"</p>}
                    <p className="text-[10px] text-slate-400 pt-0.5">Recorded by: {p.recordedBy || 'Admin'}</p>
                  </div>
                ))
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRecordForHistory(null)}
              className="w-full font-medium h-9 rounded-xl justify-center"
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
