import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PaymentMethod = 'Razorpay' | 'UPI' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Stripe' | 'Other';

export interface FeePaymentRecord {
  id: string;
  studentId: string;
  courseUuid: string;
  amountINR: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceId?: string;
  notes?: string;
  recordedBy?: string;
}

export interface StudentFeeRecord {
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentPhone?: string;
  avatarUrl?: string;
  courseUuid: string;
  courseTitle: string;
  courseFeeINR: number;
  discountINR: number;
  payableINR: number;
  paidINR: number;
  pendingINR: number;
  dueDate: string;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue';
  paymentHistory: FeePaymentRecord[];
}

interface FeesStoreState {
  records: StudentFeeRecord[];
  getCourseFeeRecords: (courseUuid: string) => StudentFeeRecord[];
  getGlobalSummary: () => {
    totalExpected: number;
    totalCollected: number;
    totalPending: number;
    totalOverdue: number;
  };
  getCourseSummary: (courseUuid: string) => {
    courseFee: number;
    studentsCount: number;
    expected: number;
    collected: number;
    pending: number;
    overdue: number;
  };
  collectPayment: (input: {
    studentId: string;
    courseUuid: string;
    amountINR: number;
    paymentDate: string;
    paymentMethod: PaymentMethod;
    referenceId?: string;
    notes?: string;
    recordedBy?: string;
  }) => void;
}

const INITIAL_FEE_RECORDS: StudentFeeRecord[] = [];

export const useFeesStore = create<FeesStoreState>()(
  persist(
    (set, get) => ({
      records: INITIAL_FEE_RECORDS,


      getCourseFeeRecords: (courseUuid) => {
        return get().records.filter((r) => r.courseUuid === courseUuid);
      },

      getGlobalSummary: () => {
        const records = get().records;
        const totalExpected = records.reduce((acc, r) => acc + r.payableINR, 0);
        const totalCollected = records.reduce((acc, r) => acc + r.paidINR, 0);
        const totalPending = records.reduce((acc, r) => acc + (r.status !== 'Overdue' ? r.pendingINR : 0), 0);
        const totalOverdue = records.reduce((acc, r) => acc + (r.status === 'Overdue' ? r.pendingINR : 0), 0);

        return { totalExpected, totalCollected, totalPending, totalOverdue };
      },

      getCourseSummary: (courseUuid) => {
        const records = get().getCourseFeeRecords(courseUuid);
        const courseFee = records[0]?.courseFeeINR || 0;
        const studentsCount = records.length;
        const expected = records.reduce((acc, r) => acc + r.payableINR, 0);
        const collected = records.reduce((acc, r) => acc + r.paidINR, 0);
        const pending = records.reduce((acc, r) => acc + (r.status !== 'Overdue' ? r.pendingINR : 0), 0);
        const overdue = records.reduce((acc, r) => acc + (r.status === 'Overdue' ? r.pendingINR : 0), 0);

        return { courseFee, studentsCount, expected, collected, pending, overdue };
      },

      collectPayment: (input) => {
        set((state) => {
          const newRecord = {
            id: `pay-${Date.now()}`,
            studentId: input.studentId,
            courseUuid: input.courseUuid,
            amountINR: input.amountINR,
            paymentDate: input.paymentDate,
            paymentMethod: input.paymentMethod,
            referenceId: input.referenceId,
            notes: input.notes,
            recordedBy: input.recordedBy || 'Instructor Admin',
          };

          const updatedRecords = state.records.map((item) => {
            if (item.studentId === input.studentId && item.courseUuid === input.courseUuid) {
              const newPaid = item.paidINR + input.amountINR;
              const newPending = Math.max(0, item.payableINR - newPaid);
              let newStatus: StudentFeeRecord['status'] = item.status;

              if (newPending === 0) {
                newStatus = 'Paid';
              } else if (newPaid > 0) {
                newStatus = 'Partially Paid';
              }

              return {
                ...item,
                paidINR: newPaid,
                pendingINR: newPending,
                status: newStatus,
                paymentHistory: [newRecord, ...item.paymentHistory],
              };
            }
            return item;
          });

          return { records: updatedRecords };
        });
      },
    }),
    {
      name: 'cubixskill-fees-store-v1',
    }
  )
);
