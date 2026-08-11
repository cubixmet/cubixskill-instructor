import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CurriculumModule, CurriculumLesson } from '../types/curriculum.types';
import type { Assignment, Submission, SubmissionStatus } from '../types/assignment.types';
import type { QuizData, QuizQuestionItem } from '../types/quiz.types';
import type { Student } from '../types/models.types';
import type { StaffMember, Role } from '../types/models.types';

export interface CourseEntity {
  id: string; // courseUuid
  title: string;
  subtitle: string;
  category: string;
  level: string;
  language: string;
  pricingType: 'free' | 'paid' | 'subscription';
  priceAmount: number;
  status: 'Draft' | 'Published' | 'Scheduled' | 'Archived';
  instructorName: string;
  coverImageUrl: string;
  enrolledStudentsCount: number;
  rating: number;
  totalDurationMinutes: number;
  totalModulesCount: number;
  totalLessonsCount: number;
  createdAt: string;
  updatedAt: string;
}

export type MediaTypeCategory = 'video' | 'audio' | 'image' | 'document' | 'other';

export const detectMediaType = (format: string, fileName: string): MediaTypeCategory => {
  const f = (format || '').toLowerCase();
  const ext = (fileName || '').split('.').pop()?.toLowerCase() || '';

  if (f.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(ext) || ['video', 'mp4', 'webm'].includes(f)) return 'video';
  if (f.startsWith('audio/') || ['mp3', 'wav', 'aac', 'm4a', 'ogg'].includes(ext) || ['audio', 'mp3', 'wav'].includes(f)) return 'audio';
  if (f.startsWith('image/') || ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'].includes(ext) || ['image', 'png', 'jpg'].includes(f)) return 'image';
  if (f.includes('pdf') || f.includes('document') || f.includes('word') || ['pdf', 'doc', 'docx', 'ppt', 'pptx', 'txt'].includes(ext)) return 'document';
  return 'other';
};

export interface MediaAssetEntity {
  id: string; // mediaUuid
  name: string;
  sizeMb: number;
  format: string;
  mediaType: MediaTypeCategory;
  url: string;
  thumbnailUrl?: string;
  durationMinutes?: number;
  resolution?: string;
  folder: string;
  uploadedAt: string;
  lastUsedAt: string;
  creditsConsumed: number;
}

export interface CreditTransactionEntity {
  id: string;
  type: 'deduction' | 'addition' | 'purchase';
  amount: number;
  reason: string;
  timestamp: string;
}

interface PlatformStoreState {
  // 1. Courses State
  courses: CourseEntity[];
  addCourse: (course: Omit<CourseEntity, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateCourse: (id: string, updates: Partial<CourseEntity>) => void;
  deleteCourse: (id: string) => void;
  duplicateCourse: (id: string) => string;
  publishCourse: (id: string) => void;
  archiveCourse: (id: string) => void;

  // 2. Curriculum State (Modules & Lessons)
  modulesByCourse: Record<string, CurriculumModule[]>;
  addModule: (courseUuid: string, title: string, description?: string) => void;
  updateModule: (courseUuid: string, moduleUuid: string, updates: Partial<CurriculumModule>) => void;
  deleteModule: (courseUuid: string, moduleUuid: string) => void;
  duplicateModule: (courseUuid: string, moduleUuid: string) => void;
  reorderModules: (courseUuid: string, updatedModules: CurriculumModule[]) => void;
  toggleModuleCollapse: (courseUuid: string, moduleUuid: string) => void;

  addLesson: (courseUuid: string, moduleUuid: string, lesson: Omit<CurriculumLesson, 'id' | 'moduleUuid'>) => void;
  updateLesson: (courseUuid: string, moduleUuid: string, lessonUuid: string, updates: Partial<CurriculumLesson>) => void;
  deleteLesson: (courseUuid: string, moduleUuid: string, lessonUuid: string) => void;
  duplicateLesson: (courseUuid: string, moduleUuid: string, lessonUuid: string) => void;

  // 3. Students State
  students: Student[];
  addStudent: (student: Omit<Student, 'id'>) => void;
  updateStudent: (id: string, updates: Partial<Student>) => void;
  suspendStudent: (id: string) => void;
  activateStudent: (id: string) => void;
  deleteStudent: (id: string) => void;

  // 4. Assignments & Submissions State
  assignments: Assignment[];
  submissions: Submission[];
  addAssignment: (assignment: Assignment) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  deleteAssignment: (id: string) => void;
  updateSubmissionStatus: (submissionUuid: string, status: SubmissionStatus, marks?: number, feedback?: string) => void;
  bulkUpdateSubmissions: (submissionUuids: string[], status: SubmissionStatus, feedback?: string) => void;

  // 5. Quizzes State
  quizzes: QuizData[];
  addQuiz: (quiz: QuizData) => void;
  updateQuiz: (id: string, updates: Partial<QuizData>) => void;
  deleteQuiz: (id: string) => void;
  addQuestion: (quizUuid: string, question: Omit<QuizQuestionItem, 'id'>) => void;
  updateQuestion: (quizUuid: string, questionUuid: string, updates: Partial<QuizQuestionItem>) => void;
  deleteQuestion: (quizUuid: string, questionUuid: string) => void;

  // 6. Staff & Roles State
  staffMembers: StaffMember[];
  roles: Role[];
  addStaff: (staff: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;

  // 7. Media & Credit Engine State
  mediaAssets: MediaAssetEntity[];
  totalCredits: number;
  creditTransactions: CreditTransactionEntity[];
  uploadMediaAsset: (file: { name: string; sizeMb: number; format: string; folder?: string; durationMinutes?: number; resolution?: string }) => { success: boolean; asset?: MediaAssetEntity; error?: string; requiredCredits?: number; availableCredits?: number };
  deleteMediaAsset: (id: string) => void;
  touchMediaAssetLastUsed: (id: string) => void;
  isMediaAssetInUse: (id: string) => { isInUse: boolean; reason?: string };
  deductCredits: (amount: number, reason: string) => void;
  addCredits: (amount: number, reason: string) => void;
}

export const usePlatformStore = create<PlatformStoreState>()(
  persist(
    (set, get) => ({
      // INITIAL COURSES MOCK DATA
      courses: [
        {
          id: '550e8400-e29b-41d4-a716-446655440000',
          title: 'React 19 & Next.js 15 Masterclass',
          subtitle: 'Master Server Components, Server Actions, useOptimistic, and Enterprise Architecture.',
          category: 'Web Development',
          level: 'Advanced',
          language: 'English',
          pricingType: 'paid',
          priceAmount: 149,
          status: 'Published',
          instructorName: 'Sarah Miller',
          coverImageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=600&auto=format&fit=crop&q=80',
          enrolledStudentsCount: 1420,
          rating: 4.9,
          totalDurationMinutes: 720,
          totalModulesCount: 3,
          totalLessonsCount: 8,
          createdAt: '2026-07-01T00:00:00Z',
          updatedAt: '2026-08-04T12:00:00Z',
        },
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Full-Stack TypeScript & Node.js Microservices',
          subtitle: 'Build scalable event-driven microservices with Docker, Kubernetes, and gRPC.',
          category: 'Backend Development',
          level: 'Intermediate',
          language: 'English',
          pricingType: 'paid',
          priceAmount: 199,
          status: 'Published',
          instructorName: 'Alex Rivera',
          coverImageUrl: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
          enrolledStudentsCount: 890,
          rating: 4.8,
          totalDurationMinutes: 540,
          totalModulesCount: 2,
          totalLessonsCount: 5,
          createdAt: '2026-07-15T00:00:00Z',
          updatedAt: '2026-08-02T10:00:00Z',
        },
      ],

      addCourse: (courseData) => {
        const newUuid = `550e8400-e29b-41d4-a716-446655${Date.now().toString().slice(-6)}`;
        const newCourse: CourseEntity = {
          ...courseData,
          id: newUuid,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ courses: [newCourse, ...state.courses] }));
        return newUuid;
      },

      updateCourse: (id, updates) => {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c)),
        }));
      },

      deleteCourse: (id) => {
        set((state) => ({ courses: state.courses.filter((c) => c.id !== id) }));
      },

      duplicateCourse: (id) => {
        const target = get().courses.find((c) => c.id === id);
        if (!target) return id;
        const newUuid = `550e8400-e29b-41d4-a716-446655${Date.now().toString().slice(-6)}`;
        const duplicated: CourseEntity = {
          ...target,
          id: newUuid,
          title: `${target.title} — Copy`,
          status: 'Draft',
          enrolledStudentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        // Clone curriculum modules if present
        const existingModules = get().modulesByCourse[id] || [];
        const clonedModules: CurriculumModule[] = JSON.parse(JSON.stringify(existingModules)).map((mod: CurriculumModule, idx: number) => ({
          ...mod,
          id: `${newUuid}-mod-${idx + 1}`,
          uuid: `${newUuid}-mod-${idx + 1}`,
          courseUuid: newUuid,
          lessons: (mod.lessons || []).map((les: CurriculumLesson, lesIdx: number) => ({
            ...les,
            id: `${newUuid}-les-${idx + 1}-${lesIdx + 1}`,
            moduleUuid: `${newUuid}-mod-${idx + 1}`,
          })),
        }));

        set((state) => ({
          courses: [duplicated, ...state.courses],
          modulesByCourse: {
            ...state.modulesByCourse,
            [newUuid]: clonedModules,
          },
        }));
        return newUuid;
      },

      publishCourse: (id) => {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, status: 'Published' } : c)),
        }));
      },

      archiveCourse: (id) => {
        set((state) => ({
          courses: state.courses.map((c) => (c.id === id ? { ...c, status: 'Archived' } : c)),
        }));
      },

      // INITIAL CURRICULUM MODULES BY COURSE
      modulesByCourse: {
        '550e8400-e29b-41d4-a716-446655440000': [
          {
            id: '550e8400-e29b-41d4-a716-446655441001',
            uuid: '550e8400-e29b-41d4-a716-446655441001',
            courseUuid: '550e8400-e29b-41d4-a716-446655440000',
            title: 'Module 1: React 19 Architecture & Server Components',
            description: 'Foundational concepts covering React 19 RSC, Actions, and Server Functions.',
            status: 'published',
            sortOrder: 1,
            unlockRule: 'immediate',
            isCollapsed: false,
            durationMinutes: 180,
            createdAt: '2026-08-01T00:00:00Z',
            updatedAt: '2026-08-01T00:00:00Z',
            lessons: [
              {
                id: '550e8400-e29b-41d4-a716-446655442001',
                uuid: '550e8400-e29b-41d4-a716-446655442001',
                courseUuid: '550e8400-e29b-41d4-a716-446655440000',
                moduleUuid: '550e8400-e29b-41d4-a716-446655441001',
                title: 'Lesson 1.1: Deep Dive into React 19 Server Components',
                type: 'video',
                status: 'published',
                sortOrder: 1,
                durationMinutes: 45,
                isDemo: true,
                description: 'Understand RSC boundaries, server vs client bundles, and zero-bundle server components.',
                unlockRule: 'immediate',
                content: {
                  videoSource: 'upload',
                  videoUrl: 'https://assets.cubixskill.com/videos/react19_rsc.mp4',
                },
                createdAt: '2026-08-01T00:00:00Z',
                updatedAt: '2026-08-01T00:00:00Z',
              },
              {
                id: '550e8400-e29b-41d4-a716-446655442002',
                uuid: '550e8400-e29b-41d4-a716-446655442002',
                courseUuid: '550e8400-e29b-41d4-a716-446655440000',
                moduleUuid: '550e8400-e29b-41d4-a716-446655441001',
                title: 'Lesson 1.2: Server Actions & Form State Management',
                type: 'video',
                status: 'published',
                sortOrder: 2,
                durationMinutes: 50,
                isDemo: false,
                description: 'Learn useActionState, useFormStatus, and progressive enhancement with Server Actions.',
                unlockRule: 'video_completion',
                content: {
                  videoSource: 'upload',
                  videoUrl: 'https://assets.cubixskill.com/videos/react19_actions.mp4',
                  minimumWatchPercentage: 80,
                },
                createdAt: '2026-08-01T00:00:00Z',
                updatedAt: '2026-08-01T00:00:00Z',
              },
            ],
          },
        ],
      },

      addModule: (courseUuid, title, description) => {
        const newModule: CurriculumModule = {
          id: `mod-${Date.now()}`,
          uuid: `mod-${Date.now()}`,
          courseUuid,
          title,
          description: description || '',
          status: 'published',
          sortOrder: 99,
          unlockRule: 'immediate',
          isCollapsed: false,
          durationMinutes: 0,
          lessons: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: [...list, newModule],
            },
          };
        });
      },

      updateModule: (courseUuid, moduleUuid, updates) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) => (m.id === moduleUuid ? { ...m, ...updates } : m)),
            },
          };
        });
      },

      deleteModule: (courseUuid, moduleUuid) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.filter((m) => m.id !== moduleUuid),
            },
          };
        });
      },

      duplicateModule: (courseUuid, moduleUuid) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          const target = list.find((m) => m.id === moduleUuid);
          if (!target) return state;
          const newMod: CurriculumModule = {
            ...target,
            id: `mod-${Date.now()}`,
            title: `${target.title} (Copy)`,
            lessons: target.lessons.map((l) => ({ ...l, id: `les-${Date.now()}-${Math.random().toString().slice(2, 6)}` })),
          };
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: [...list, newMod],
            },
          };
        });
      },

      reorderModules: (courseUuid, updatedModules) => {
        set((state) => ({
          modulesByCourse: {
            ...state.modulesByCourse,
            [courseUuid]: updatedModules,
          },
        }));
      },

      toggleModuleCollapse: (courseUuid, moduleUuid) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) => (m.id === moduleUuid ? { ...m, isCollapsed: !m.isCollapsed } : m)),
            },
          };
        });
      },

      addLesson: (courseUuid, moduleUuid, lessonData) => {
        const newLesson: CurriculumLesson = {
          ...lessonData,
          id: `les-${Date.now()}`,
          moduleUuid,
        };
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) => (m.id === moduleUuid ? { ...m, lessons: [...m.lessons, newLesson] } : m)),
            },
          };
        });
      },

      updateLesson: (courseUuid, moduleUuid, lessonUuid, updates) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) =>
                m.id === moduleUuid
                  ? { ...m, lessons: m.lessons.map((l) => (l.id === lessonUuid ? { ...l, ...updates } : l)) }
                  : m
              ),
            },
          };
        });
      },

      deleteLesson: (courseUuid, moduleUuid, lessonUuid) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) =>
                m.id === moduleUuid ? { ...m, lessons: m.lessons.filter((l) => l.id !== lessonUuid) } : m
              ),
            },
          };
        });
      },

      duplicateLesson: (courseUuid, moduleUuid, lessonUuid) => {
        set((state) => {
          const list = state.modulesByCourse[courseUuid] || [];
          return {
            modulesByCourse: {
              ...state.modulesByCourse,
              [courseUuid]: list.map((m) => {
                if (m.id !== moduleUuid) return m;
                const target = m.lessons.find((l) => l.id === lessonUuid);
                if (!target) return m;
                const dup: CurriculumLesson = {
                  ...target,
                  id: `les-${Date.now()}`,
                  title: `${target.title} (Copy)`,
                };
                return { ...m, lessons: [...m.lessons, dup] };
              }),
            },
          };
        });
      },

      // INITIAL STUDENTS MOCK DATA
      students: [
        {
          id: 'stu-101',
          name: 'Alex Johnson',
          email: 'alex.johnson@example.com',
          phone: '+91 98765 43210',
          countryCode: '+91',
          country: 'India',
          status: 'Active',
          enrolledCoursesCount: 3,
          completedCoursesCount: 1,
          creditsConsumed: 45,
          progressPercent: 78,
          lastActivity: '2026-06-10T00:00:00Z',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        },
        {
          id: 'stu-102',
          name: 'Sophia Chen',
          email: 'sophia.chen@example.com',
          phone: '+91 98765 43211',
          countryCode: '+91',
          country: 'India',
          status: 'Active',
          enrolledCoursesCount: 4,
          completedCoursesCount: 2,
          creditsConsumed: 90,
          progressPercent: 92,
          lastActivity: '2026-05-18T00:00:00Z',
          avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        },
      ],

      addStudent: (studentData) => {
        const newStudent: Student = {
          ...studentData,
          id: `stu-${Date.now().toString().slice(-4)}`,
        };
        set((state) => ({ students: [newStudent, ...state.students] }));
      },

      updateStudent: (id, updates) => {
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },

      suspendStudent: (id) => {
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, status: 'Suspended' } : s)),
        }));
      },

      activateStudent: (id) => {
        set((state) => ({
          students: state.students.map((s) => (s.id === id ? { ...s, status: 'Active' } : s)),
        }));
      },

      deleteStudent: (id) => {
        set((state) => ({ students: state.students.filter((s) => s.id !== id) }));
      },

      // ASSIGNMENTS & SUBMISSIONS MOCK STATE
      assignments: [],
      submissions: [],
      addAssignment: (assignment) => {
        set((state) => ({ assignments: [assignment, ...state.assignments] }));
      },
      updateAssignment: (id, updates) => {
        set((state) => ({
          assignments: state.assignments.map((a) => (a.id === id ? { ...a, ...updates } : a)),
        }));
      },
      deleteAssignment: (id) => {
        set((state) => ({ assignments: state.assignments.filter((a) => a.id !== id) }));
      },
      updateSubmissionStatus: (submissionUuid, status, marks, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            s.id === submissionUuid
              ? {
                  ...s,
                  status,
                  grade: marks !== undefined ? marks : s.grade,
                  feedback: feedback || s.feedback,
                }
              : s
          ),
        }));
      },
      bulkUpdateSubmissions: (submissionUuids, status, feedback) => {
        set((state) => ({
          submissions: state.submissions.map((s) =>
            submissionUuids.includes(s.id)
              ? {
                  ...s,
                  status,
                  feedback: feedback || s.feedback,
                }
              : s
          ),
        }));
      },

      // QUIZZES MOCK STATE
      quizzes: [],
      addQuiz: (quiz) => {
        set((state) => ({ quizzes: [quiz, ...state.quizzes] }));
      },
      updateQuiz: (id, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) => (q.id === id ? { ...q, ...updates } : q)),
        }));
      },
      deleteQuiz: (id) => {
        set((state) => ({ quizzes: state.quizzes.filter((q) => q.id !== id) }));
      },
      addQuestion: (quizUuid, questionData) => {
        const newQuestion: QuizQuestionItem = {
          ...questionData,
          id: `q-${Date.now()}`,
        };
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizUuid ? { ...q, questions: [...(q.questions || []), newQuestion] } : q
          ),
        }));
      },
      updateQuestion: (quizUuid, questionUuid, updates) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizUuid
              ? { ...q, questions: (q.questions || []).map((ques: QuizQuestionItem) => (ques.id === questionUuid ? { ...ques, ...updates } : ques)) }
              : q
          ),
        }));
      },
      deleteQuestion: (quizUuid, questionUuid) => {
        set((state) => ({
          quizzes: state.quizzes.map((q) =>
            q.id === quizUuid ? { ...q, questions: (q.questions || []).filter((ques: QuizQuestionItem) => ques.id !== questionUuid) } : q
          ),
        }));
      },

      // STAFF & ROLES MOCK STATE
      staffMembers: [
        {
          id: 'staff-1',
          name: 'Sarah Miller',
          email: 'sarah.miller@cubixskill.com',
          phone: '+91 98765 43210',
          department: 'Academic Operations',
          roleName: 'Lead Instructor',
          roleId: 'role-1',
          status: 'Active',
          assignedCoursesCount: 4,
          assignedStudentsCount: 450,
          creditCost: 100,
          lastActiveAt: '2026-08-05T09:45:00Z',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        },
      ],
      roles: [
        {
          id: 'role-1',
          name: 'Lead Instructor',
          description: 'Full course management, grading, and content creation permissions.',
          creditCost: 100,
          permissions: {
            courses: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
            grading: { view: true, create: true, edit: true, delete: true, publish: true, export: true, approve: true },
          },
          assignedStaffCount: 1,
        },
      ],
      addStaff: (staffData) => {
        const newStaff: StaffMember = {
          ...staffData,
          id: `staff-${Date.now()}`,
        };
        set((state) => ({ staffMembers: [newStaff, ...state.staffMembers] }));
      },
      updateStaff: (id, updates) => {
        set((state) => ({
          staffMembers: state.staffMembers.map((s) => (s.id === id ? { ...s, ...updates } : s)),
        }));
      },
      deleteStaff: (id) => {
        set((state) => ({ staffMembers: state.staffMembers.filter((s) => s.id !== id) }));
      },

      // MEDIA & CREDIT ENGINE STATE
      mediaAssets: [
        {
          id: 'med-1',
          name: 'react19_deepdive_lecture.mp4',
          sizeMb: 450,
          format: 'video/mp4',
          mediaType: 'video',
          url: 'https://assets.cubixskill.com/videos/react19_rsc.mp4',
          folder: 'Course Videos',
          uploadedAt: '2026-08-01T10:00:00Z',
          lastUsedAt: '2026-08-09T14:00:00Z',
          durationMinutes: 45,
          resolution: '1080p',
          creditsConsumed: 1.5,
        },
        {
          id: 'med-2',
          name: 'podcast_state_management.mp3',
          sizeMb: 25,
          format: 'audio/mp3',
          mediaType: 'audio',
          url: 'https://assets.cubixskill.com/audio/state_podcast.mp3',
          folder: 'Audio Clips',
          uploadedAt: '2026-08-03T11:20:00Z',
          lastUsedAt: '2026-08-08T16:30:00Z',
          durationMinutes: 20,
          creditsConsumed: 0.3,
        },
        {
          id: 'med-3',
          name: 'react19_architecture_diagram.png',
          sizeMb: 4.2,
          format: 'image/png',
          mediaType: 'image',
          url: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&auto=format&fit=crop&q=80',
          folder: 'Infographics',
          uploadedAt: '2026-08-04T09:15:00Z',
          lastUsedAt: '2026-08-07T12:00:00Z',
          creditsConsumed: 0.1,
        },
        {
          id: 'med-4',
          name: 'course_handbook_v2.pdf',
          sizeMb: 12.8,
          format: 'application/pdf',
          mediaType: 'document',
          url: 'https://assets.cubixskill.com/docs/handbook.pdf',
          folder: 'Documents',
          uploadedAt: '2026-08-05T14:10:00Z',
          lastUsedAt: '2026-08-06T18:45:00Z',
          creditsConsumed: 0.2,
        },
      ],
      totalCredits: 1250.5,
      creditTransactions: [
        {
          id: 'tx-1',
          type: 'deduction',
          amount: 1.5,
          reason: 'Direct Video Upload: react19_deepdive_lecture.mp4',
          timestamp: '2026-08-01T10:00:00Z',
        },
      ],

      uploadMediaAsset: (file) => {
        const requiredCredits = Math.max(0.1, Math.round((file.sizeMb / 100) * 10) / 10);
        const currentCredits = get().totalCredits;

        if (currentCredits < requiredCredits) {
          return {
            success: false,
            error: 'Insufficient Credits',
            requiredCredits,
            availableCredits: currentCredits,
          };
        }

        const mType = detectMediaType(file.format, file.name);
        const now = new Date().toISOString();
        const newAsset: MediaAssetEntity = {
          id: `med-${Date.now()}`,
          name: file.name,
          sizeMb: file.sizeMb,
          format: file.format,
          mediaType: mType,
          url: `https://assets.cubixskill.com/media/${file.name}`,
          folder: file.folder || 'General',
          uploadedAt: now,
          lastUsedAt: now,
          durationMinutes: file.durationMinutes,
          resolution: file.resolution,
          creditsConsumed: requiredCredits,
        };

        const newTx: CreditTransactionEntity = {
          id: `tx-${Date.now()}`,
          type: 'deduction',
          amount: requiredCredits,
          reason: `Media Upload: ${file.name}`,
          timestamp: now,
        };

        set((state) => ({
          mediaAssets: [newAsset, ...state.mediaAssets],
          totalCredits: Math.max(0, Math.round((state.totalCredits - requiredCredits) * 10) / 10),
          creditTransactions: [newTx, ...state.creditTransactions],
        }));

        return { success: true, asset: newAsset };
      },

      touchMediaAssetLastUsed: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          mediaAssets: state.mediaAssets.map((m) =>
            m.id === id ? { ...m, lastUsedAt: now } : m
          ),
        }));
      },

      isMediaAssetInUse: (id) => {
        const state = get();
        const target = state.mediaAssets.find((m) => m.id === id);
        if (!target) return { isInUse: false };

        // Check courses / lessons references
        const courseMatch = state.courses.find((c) => {
          const item = c as { thumbnailUrl?: string; title: string };
          return item.thumbnailUrl === target.url || item.title.toLowerCase().includes(target.name.toLowerCase());
        });
        if (courseMatch) {
          return {
            isInUse: true,
            reason: `Referenced by course: "${courseMatch.title}"`,
          };
        }

        return { isInUse: false };
      },

      deleteMediaAsset: (id) => {
        set((state) => ({ mediaAssets: state.mediaAssets.filter((m) => m.id !== id) }));
      },

      deductCredits: (amount, reason) => {
        const newTx: CreditTransactionEntity = {
          id: `tx-${Date.now()}`,
          type: 'deduction',
          amount,
          reason,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          totalCredits: Math.max(0, Math.round((state.totalCredits - amount) * 10) / 10),
          creditTransactions: [newTx, ...state.creditTransactions],
        }));
      },

      addCredits: (amount, reason) => {
        const newTx: CreditTransactionEntity = {
          id: `tx-${Date.now()}`,
          type: 'addition',
          amount,
          reason,
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          totalCredits: Math.round((state.totalCredits + amount) * 10) / 10,
          creditTransactions: [newTx, ...state.creditTransactions],
        }));
      },
    }),
    {
      name: 'cubixskill_instructor_platform_state',
    }
  )
);
