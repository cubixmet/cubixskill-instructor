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

const INITIAL_FEE_RECORDS: StudentFeeRecord[] = [
  {
    studentId: '550e8400-e29b-41d4-a716-446655440101',
    studentName: 'Aarav Sharma',
    studentEmail: 'aarav.sharma@example.com',
    studentPhone: '+91 98765 43210',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'React – The Complete Guide 2024',
    courseFeeINR: 10000,
    discountINR: 1000,
    payableINR: 9000,
    paidINR: 6000,
    pendingINR: 3000,
    dueDate: '2026-08-25',
    status: 'Partially Paid',
    paymentHistory: [
      {
        id: 'pay-101',
        studentId: '550e8400-e29b-41d4-a716-446655440101',
        courseUuid: '550e8400-e29b-41d4-a716-446655440000',
        amountINR: 6000,
        paymentDate: '2026-08-01',
        paymentMethod: 'UPI',
        referenceId: 'UPI-9821039482',
        notes: 'First installment paid on enrollment.',
        recordedBy: 'Admin Staff',
      },
    ],
  },
  {
    studentId: '550e8400-e29b-41d4-a716-446655440102',
    studentName: 'Priya Verma',
    studentEmail: 'priya.verma@example.com',
    studentPhone: '+91 98111 22233',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'React – The Complete Guide 2024',
    courseFeeINR: 10000,
    discountINR: 0,
    payableINR: 10000,
    paidINR: 10000,
    pendingINR: 0,
    dueDate: '2026-08-10',
    status: 'Paid',
    paymentHistory: [
      {
        id: 'pay-102',
        studentId: '550e8400-e29b-41d4-a716-446655440102',
        courseUuid: '550e8400-e29b-41d4-a716-446655440000',
        amountINR: 10000,
        paymentDate: '2026-07-28',
        paymentMethod: 'Razorpay',
        referenceId: 'RZP-PAY-882194',
        notes: 'Full fee paid upfront.',
        recordedBy: 'Self Gateway',
      },
    ],
  },
  {
    studentId: '550e8400-e29b-41d4-a716-446655440103',
    studentName: 'Rohan Mehta',
    studentEmail: 'rohan.mehta@example.com',
    studentPhone: '+91 97654 32109',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'React – The Complete Guide 2024',
    courseFeeINR: 10000,
    discountINR: 2000,
    payableINR: 8000,
    paidINR: 0,
    pendingINR: 8000,
    dueDate: '2026-08-01',
    status: 'Overdue',
    paymentHistory: [],
  },
  {
    studentId: '550e8400-e29b-41d4-a716-446655440104',
    studentName: 'Neha Gupta',
    studentEmail: 'neha.gupta@example.com',
    studentPhone: '+91 99887 76655',
    avatarUrl: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'React – The Complete Guide 2024',
    courseFeeINR: 10000,
    discountINR: 1000,
    payableINR: 9000,
    paidINR: 0,
    pendingINR: 9000,
    dueDate: '2026-08-30',
    status: 'Pending',
    paymentHistory: [],
  },
  {
    studentId: '550e8400-e29b-41d4-a716-446655440105',
    studentName: 'Karan Patel',
    studentEmail: 'karan.patel@example.com',
    studentPhone: '+91 91234 56789',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    courseUuid: 'course-node-microservices',
    courseTitle: 'Node.js Microservices Masterclass',
    courseFeeINR: 15000,
    discountINR: 3000,
    payableINR: 12000,
    paidINR: 12000,
    pendingINR: 0,
    dueDate: '2026-08-05',
    status: 'Paid',
    paymentHistory: [
      {
        id: 'pay-105',
        studentId: '550e8400-e29b-41d4-a716-446655440105',
        courseUuid: 'course-node-microservices',
        amountINR: 12000,
        paymentDate: '2026-08-02',
        paymentMethod: 'Bank Transfer',
        referenceId: 'IMPS-99882211',
        notes: 'Corporate scholarship applied.',
        recordedBy: 'Finance Admin',
      },
    ],
  },
  {
    studentId: '550e8400-e29b-41d4-a716-446655440106',
    studentName: 'Sneha Deshmukh',
    studentEmail: 'sneha.d@example.com',
    studentPhone: '+91 93456 78901',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
    courseUuid: 'course-node-microservices',
    courseTitle: 'Node.js Microservices Masterclass',
    courseFeeINR: 15000,
    discountINR: 0,
    payableINR: 15000,
    paidINR: 5000,
    pendingINR: 10000,
    dueDate: '2026-08-20',
    status: 'Partially Paid',
    paymentHistory: [
      {
        id: 'pay-106',
        studentId: '550e8400-e29b-41d4-a716-446655440106',
        courseUuid: 'course-node-microservices',
        amountINR: 5000,
        paymentDate: '2026-08-04',
        paymentMethod: 'UPI',
        referenceId: 'UPI-77665544',
        notes: 'Token fee paid.',
        recordedBy: 'Sales Rep',
      },
    ],
  },
];

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
