import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen,
  Users,
  FileCheck,
  HelpCircle,
  Video,
  Megaphone,
  MessageSquare,
  Award,
  Layers,
} from 'lucide-react';
import { usePlatformStore } from '../../store/usePlatformStore';
import { useCourseStore } from '../../features/courses/store/course.store';
import { useStudentStore } from '../../features/students/store/student.store';
import { useLiveSessionStore } from '../../features/live-sessions/store/liveSession.store';
import { useDiscussionStore } from '../../features/discussions/store/discussion.store';
import { useAnnouncementStore } from '../../features/announcements/store/announcement.store';
import { useCertificateStore } from '../../features/certificates/store/certificate.store';
import { authStore } from '../../store/auth.store';
import type {
  GlobalSearchResultItem,
  GroupedSearchResults,
  SearchCategoryType,
} from './global-search.types';

export const useGlobalSearch = (query: string, debounceMs = 300) => {
  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);

  // Debounce input query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query.trim());
      setIsLoading(false);
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [query, debounceMs]);

  // Derived loading state
  const isSearching = query.trim() !== debouncedQuery || isLoading;

  // Subscribe to Stores
  const platformCourses = usePlatformStore((s) => s.courses);
  const platformStaff = usePlatformStore((s) => s.staff);
  const platformMedia = usePlatformStore((s) => s.mediaAssets);
  const courseStoreByUuid = useCourseStore((s) => s.coursesByUuid);
  const students = useStudentStore((s) => s.students);
  const liveSessions = useLiveSessionStore((s) => s.sessions);
  const discussions = useDiscussionStore((s) => s.discussions);
  const announcements = useAnnouncementStore((s) => s.announcements);
  const certificates = useCertificateStore((s) => s.certificates);

  // Auth & Permission Checks
  const user = authStore.getState().user;
  const userRole = user?.role || 'instructor';

  const canViewStudents = userRole === 'instructor' || userRole === 'admin' || userRole === 'ta';
  const canViewStaff = userRole === 'instructor' || userRole === 'admin';

  // Perform search and group results
  const results: GroupedSearchResults[] = useMemo(() => {
    const q = debouncedQuery.toLowerCase();
    if (!q) return [];

    const grouped: Record<string, GlobalSearchResultItem[]> = {};

    const addResult = (categoryKey: string, item: GlobalSearchResultItem) => {
      if (!grouped[categoryKey]) grouped[categoryKey] = [];
      if (grouped[categoryKey].length < 4) {
        grouped[categoryKey].push(item);
      }
    };

    // 1. COURSES
    const courseList = Object.values(courseStoreByUuid || {}).length > 0
      ? Object.values(courseStoreByUuid)
      : platformCourses || [];

    courseList.forEach((course) => {
      if (!course) return;
      const title = course.title || '';
      const category = (course as { category?: string }).category || '';
      if (title.toLowerCase().includes(q) || category.toLowerCase().includes(q)) {
        addResult('courses', {
          id: (course as { uuid?: string; id?: string }).uuid || (course as { id?: string }).id || title,
          category: 'courses',
          categoryLabel: 'Courses',
          title,
          subtitle: `${category || 'Web Development'} • ${(course as { level?: string }).level || 'All Levels'}`,
          badge: (course as { status?: string }).status === 'published' || (course as { status?: string }).status === 'Published' ? 'Published' : 'Draft',
          badgeVariant: (course as { status?: string }).status === 'published' || (course as { status?: string }).status === 'Published' ? 'success' : 'secondary',
          icon: BookOpen,
          route: `/courses/${(course as { uuid?: string; id?: string }).uuid || (course as { id?: string }).id}/overview`,
        });
      }
    });

    // 2. STUDENTS (Permission Protected)
    if (canViewStudents && students) {
      students.forEach((student) => {
        if (!student) return;
        const name = student.name || '';
        const email = student.email || '';
        const phone = student.phone || '';

        if (
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          phone.includes(q)
        ) {
          addResult('students', {
            id: student.uuid || name,
            category: 'students',
            categoryLabel: 'Students',
            title: name,
            subtitle: email,
            badge: student.status || 'Active',
            badgeVariant: student.status === 'Active' ? 'success' : 'secondary',
            icon: Users,
            route: `/students/${student.uuid}`,
          });
        }
      });
    }

    // 3. STAFF & TEAM (Permission Protected)
    if (canViewStaff && platformStaff) {
      platformStaff.forEach((member) => {
        if (!member) return;
        const name = member.name || '';
        const email = member.email || '';
        const roleName = member.roleName || '';

        if (
          name.toLowerCase().includes(q) ||
          email.toLowerCase().includes(q) ||
          roleName.toLowerCase().includes(q)
        ) {
          addResult('staff', {
            id: member.id || name,
            category: 'staff',
            categoryLabel: 'Staff & Team',
            title: name,
            subtitle: `${roleName} • ${email}`,
            badge: member.status || 'Active',
            badgeVariant: member.status === 'Active' ? 'success' : 'secondary',
            icon: UserCheck,
            route: '/staff',
          });
        }
      });
    }

    // 4. ASSIGNMENTS & PROJECTS
    const sampleAssignments = [
      { id: 'asgn-1', title: 'React 19 Server Actions & Hooks Project', course: 'React Complete Guide 2024', status: 'Active' },
      { id: 'asgn-2', title: 'Next.js 15 App Router Architecture', course: 'Next.js Masterclass', status: 'Review Needed' },
      { id: 'asgn-3', title: 'TypeScript Advanced Generics & Utility Types', course: 'Full-Stack TypeScript', status: 'Published' },
    ];
    sampleAssignments.forEach((asgn) => {
      const title = asgn.title || '';
      const course = asgn.course || '';
      if (title.toLowerCase().includes(q) || course.toLowerCase().includes(q)) {
        addResult('assignments', {
          id: asgn.id,
          category: 'assignments',
          categoryLabel: 'Assignments',
          title: asgn.title,
          subtitle: asgn.course,
          badge: asgn.status,
          badgeVariant: 'info',
          icon: FileCheck,
          route: '/assignments',
        });
      }
    });

    // 5. QUIZZES
    const sampleQuizzes = [
      { id: 'quiz-1', title: 'React 19 Hooks & State Evaluation Quiz', course: 'React Complete Guide', status: 'Active' },
      { id: 'quiz-2', title: 'Tailwind CSS v4 Utility Evaluation', course: 'UI Design Systems', status: 'Active' },
    ];
    sampleQuizzes.forEach((quiz) => {
      const title = quiz.title || '';
      const course = quiz.course || '';
      if (title.toLowerCase().includes(q) || course.toLowerCase().includes(q)) {
        addResult('quizzes', {
          id: quiz.id,
          category: 'quizzes',
          categoryLabel: 'Quizzes',
          title: quiz.title,
          subtitle: quiz.course,
          badge: quiz.status,
          badgeVariant: 'info',
          icon: HelpCircle,
          route: '/quizzes',
        });
      }
    });

    // 6. LIVE SESSIONS
    if (liveSessions) {
      liveSessions.forEach((session) => {
        if (!session) return;
        const title = session.title || '';
        const instructor = session.instructorName || '';

        if (title.toLowerCase().includes(q) || instructor.toLowerCase().includes(q)) {
          addResult('live_sessions', {
            id: session.id || title,
            category: 'live_sessions',
            categoryLabel: 'Live Classroom',
            title,
            subtitle: `${session.scheduledDate || ''} ${session.scheduledTime || ''} • ${instructor}`,
            badge: session.status || 'upcoming',
            badgeVariant: session.status === 'upcoming' ? 'success' : 'secondary',
            icon: Video,
            route: '/live-classroom',
          });
        }
      });
    }

    // 7. ANNOUNCEMENTS
    if (announcements) {
      announcements.forEach((ann) => {
        if (!ann) return;
        const title = ann.title || '';
        const content = ann.content || '';

        if (title.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
          addResult('announcements', {
            id: ann.id || title,
            category: 'announcements',
            categoryLabel: 'Announcements',
            title,
            subtitle: `Posted on ${ann.createdDate || ''} by ${ann.authorName || 'Instructor'}`,
            badge: ann.targetAudience === 'all' ? 'Global' : 'Course',
            badgeVariant: 'info',
            icon: Megaphone,
            route: '/announcements',
          });
        }
      });
    }

    // 8. DISCUSSIONS & FORUMS
    if (discussions) {
      discussions.forEach((disc) => {
        if (!disc) return;
        const title = disc.title || '';
        const content = disc.content || '';

        if (title.toLowerCase().includes(q) || content.toLowerCase().includes(q)) {
          addResult('discussions', {
            id: disc.id || title,
            category: 'discussions',
            categoryLabel: 'Discussions',
            title,
            subtitle: `Started by ${disc.authorName || 'Student'} • ${disc.repliesCount || 0} replies`,
            badge: disc.isResolved ? 'Resolved' : 'Open',
            badgeVariant: disc.isResolved ? 'success' : 'warning',
            icon: MessageSquare,
            route: '/discussions',
          });
        }
      });
    }

    // 10. CERTIFICATES
    if (certificates) {
      certificates.forEach((cert) => {
        if (!cert) return;
        const studentName = cert.studentName || '';
        const courseTitle = cert.courseTitle || '';
        const certNum = cert.certificateNumber || '';

        if (
          studentName.toLowerCase().includes(q) ||
          courseTitle.toLowerCase().includes(q) ||
          certNum.toLowerCase().includes(q)
        ) {
          addResult('certificates', {
            id: cert.id || certNum,
            category: 'certificates',
            categoryLabel: 'Certificates',
            title: `${studentName} — ${courseTitle}`,
            subtitle: `Cert #: ${certNum} • Issued ${cert.issueDate || ''}`,
            badge: cert.isRevoked ? 'Revoked' : 'Verified',
            badgeVariant: cert.isRevoked ? 'secondary' : 'success',
            icon: Award,
            route: '/certificates',
          });
        }
      });
    }

    // 11. MEDIA ASSETS
    if (platformMedia) {
      platformMedia.forEach((media) => {
        if (!media) return;
        const name = media.name || '';
        const folder = media.folder || '';

        if (name.toLowerCase().includes(q) || folder.toLowerCase().includes(q)) {
          addResult('media', {
            id: media.id || name,
            category: 'media',
            categoryLabel: 'Media Library',
            title: name,
            subtitle: `Folder: ${folder} • ${(media.format || 'file').toUpperCase()} (${media.sizeMb || 0} MB)`,
            badge: (media.format || 'file').toUpperCase(),
            badgeVariant: 'info',
            icon: Layers,
            route: '/media',
          });
        }
      });
    }

    // Convert grouped map into array of category results
    const labelOrderMap: Record<string, string> = {
      courses: 'Courses',
      students: 'Students',
      staff: 'Staff & Team',
      assignments: 'Assignments',
      quizzes: 'Quizzes',
      live_sessions: 'Live Classroom',
      announcements: 'Announcements',
      discussions: 'Discussions',
      certificates: 'Certificates',
      media: 'Media Library',
    };

    return Object.keys(grouped).map((catKey) => ({
      category: catKey as SearchCategoryType,
      categoryLabel: labelOrderMap[catKey] || catKey,
      items: grouped[catKey],
    }));
  }, [
    debouncedQuery,
    platformCourses,
    platformStaff,
    platformMedia,
    courseStoreByUuid,
    students,
    liveSessions,
    discussions,
    announcements,
    certificates,
    canViewStudents,
    canViewStaff,
  ]);

  const totalResultsCount = useMemo(() => {
    return results.reduce((acc, cat) => acc + cat.items.length, 0);
  }, [results]);

  return {
    query,
    debouncedQuery,
    isLoading: isSearching,
    results,
    totalResultsCount,
  };
};
