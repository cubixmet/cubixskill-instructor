import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { StudentDetail, CreateStudentInput, UpdateStudentInput } from '../types/student.types';

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return '550e8400-e29b-41d4-a716-' + Date.now().toString(16) + Math.random().toString(16).substring(2, 8);
};

const SEED_STUDENTS: StudentDetail[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440101',
    name: 'Aarav Patel',
    email: 'aarav.patel@gmail.com',
    phone: '+91 98765 43210',
    countryCode: '+91',
    country: 'India',
    status: 'Active',
    enrollmentDate: '2026-08-01T10:00:00Z',
    lastActivity: '10 mins ago',
    creditsConsumed: 34,
    notes: 'High engagement in React 19 RSC modules. Consistently submits assignments on time.',
    enrolledCourses: [
      {
        courseUuid: '550e8400-e29b-41d4-a716-446655440000',
        courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
        enrolledAt: '2026-08-01T10:00:00Z',
        progressPercent: 85,
        lessonsCompleted: 18,
        totalLessons: 24,
        quizzesPassed: 4,
        assignmentsSubmitted: 2,
        certificatesEarned: 0,
        creditsConsumed: 17,
      },
    ],
    activityLogs: [
      { id: '1', timestamp: '2026-08-05T10:30:00Z', action: 'Completed Lesson', details: 'React 19 Architecture Overview' },
      { id: '2', timestamp: '2026-08-04T15:20:00Z', action: 'Passed Quiz', details: 'Server Components Quiz (Grade: 90%)' },
      { id: '3', timestamp: '2026-08-03T11:00:00Z', action: 'Submitted Assignment', details: 'Build Custom Store Middleware' },
    ],
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440102',
    name: 'Priya Sharma',
    email: 'priya.sharma@yahoo.com',
    phone: '+91 98123 45678',
    countryCode: '+91',
    country: 'India',
    status: 'Active',
    enrollmentDate: '2026-07-28T10:00:00Z',
    lastActivity: '2 hours ago',
    creditsConsumed: 17,
    notes: 'Enrolled via enterprise batch license.',
    enrolledCourses: [
      {
        courseUuid: '550e8400-e29b-41d4-a716-446655440000',
        courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
        enrolledAt: '2026-07-28T10:00:00Z',
        progressPercent: 42,
        lessonsCompleted: 10,
        totalLessons: 24,
        quizzesPassed: 2,
        assignmentsSubmitted: 1,
        certificatesEarned: 0,
        creditsConsumed: 17,
      },
    ],
    activityLogs: [
      { id: '1', timestamp: '2026-08-05T08:15:00Z', action: 'Watched Video', details: 'Zustand State Persistence' },
    ],
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440103',
    name: 'Rahul Nair',
    email: 'rahul.nair@outlook.com',
    phone: '+91 97654 32109',
    countryCode: '+91',
    country: 'India',
    status: 'Suspended',
    enrollmentDate: '2026-07-20T10:00:00Z',
    lastActivity: '3 days ago',
    creditsConsumed: 51,
    notes: 'Account suspended due to policy review.',
    enrolledCourses: [
      {
        courseUuid: '550e8400-e29b-41d4-a716-446655440000',
        courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
        enrolledAt: '2026-07-20T10:00:00Z',
        progressPercent: 12,
        lessonsCompleted: 3,
        totalLessons: 24,
        quizzesPassed: 0,
        assignmentsSubmitted: 0,
        certificatesEarned: 0,
        creditsConsumed: 17,
      },
    ],
    activityLogs: [
      { id: '1', timestamp: '2026-08-02T09:00:00Z', action: 'Login Attempt', details: 'IP: 192.168.1.1' },
    ],
  },
];

interface StudentStoreState {
  students: StudentDetail[];
  getStudents: () => StudentDetail[];
  getStudentByUuid: (uuid: string) => StudentDetail | undefined;
  addStudent: (data: CreateStudentInput) => StudentDetail;
  updateStudent: (uuid: string, updates: UpdateStudentInput) => void;
  deleteStudent: (uuid: string) => void;
  toggleStudentStatus: (uuid: string) => void;
  enrollStudentInCourse: (
    studentUuid: string,
    courseUuid: string,
    courseTitle: string,
    creditsRequired: number
  ) => void;
}

export const useStudentStore = create<StudentStoreState>()(
  persist(
    (set, get) => ({
      students: SEED_STUDENTS,

      getStudents: () => get().students,

      getStudentByUuid: (uuid) => {
        return get().students.find((s) => s.uuid === uuid);
      },

      addStudent: (data) => {
        const newStudent: StudentDetail = {
          name: data.name || data.full_name || '',
          ...data,
          uuid: generateUuid(),
          status: (data.status as StudentStatus) || 'Active',
          enrollmentDate: new Date().toISOString(),
          lastActivity: 'Just now',
          creditsConsumed: 17,
          enrolledCourses: [
            {
              courseUuid: '550e8400-e29b-41d4-a716-446655440000',
              courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
              enrolledAt: new Date().toISOString(),
              progressPercent: 0,
              lessonsCompleted: 0,
              totalLessons: 24,
              quizzesPassed: 0,
              assignmentsSubmitted: 0,
              certificatesEarned: 0,
              creditsConsumed: 17,
            },
          ],
          activityLogs: [
            {
              id: '1',
              timestamp: new Date().toISOString(),
              action: 'Account Created',
              details: 'Enrolled by instructor.',
            },
          ],
        };

        set((state) => ({
          students: [newStudent, ...state.students],
        }));

        return newStudent;
      },

      updateStudent: (uuid, updates) => {
        set((state) => ({
          students: state.students.map((s) =>
            s.uuid === uuid ? { ...s, ...updates } : s
          ),
        }));
      },

      deleteStudent: (uuid) => {
        set((state) => ({
          students: state.students.filter((s) => s.uuid !== uuid),
        }));
      },

      toggleStudentStatus: (uuid) => {
        set((state) => ({
          students: state.students.map((s) => {
            if (s.uuid === uuid) {
              const nextStatus = s.status === 'Active' ? 'Suspended' : 'Active';
              return { ...s, status: nextStatus };
            }
            return s;
          }),
        }));
      },

      enrollStudentInCourse: (studentUuid, courseUuid, courseTitle, creditsRequired) => {
        set((state) => ({
          students: state.students.map((s) => {
            if (s.uuid === studentUuid) {
              const already = s.enrolledCourses?.some((c) => c.courseUuid === courseUuid);
              if (already) return s;

              const newEnrollment = {
                courseUuid,
                courseTitle,
                enrolledAt: new Date().toISOString(),
                progressPercent: 0,
                lessonsCompleted: 0,
                totalLessons: 24,
                quizzesPassed: 0,
                assignmentsSubmitted: 0,
                certificatesEarned: 0,
                creditsConsumed: creditsRequired,
              };

              const newLog = {
                id: Date.now().toString(),
                timestamp: new Date().toISOString(),
                action: 'Enrolled in Course',
                details: `Course: ${courseTitle} (${creditsRequired} Credits)`,
              };

              return {
                ...s,
                creditsConsumed: s.creditsConsumed + creditsRequired,
                enrolledCourses: [...(s.enrolledCourses || []), newEnrollment],
                activityLogs: [newLog, ...(s.activityLogs || [])],
              };
            }
            return s;
          }),
        }));
      },
    }),
    {
      name: 'cubixskill-student-store',
    }
  )
);
