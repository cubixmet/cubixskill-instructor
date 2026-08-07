import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { SetupPasswordPage } from '../features/auth/pages/SetupPasswordPage';

import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CreditsPage } from '../features/credits/pages/CreditsPage';
import { MediaPage } from '../features/media/pages/MediaPage';
import { CourseListPage } from '../features/courses/pages/CourseListPage';
import { CourseCreateWizardPage } from '../features/courses/pages/CourseCreateWizardPage';
import { CourseFeaturesPage } from '../features/courses/pages/CourseFeaturesPage';

// Course Single View Layout & Tabs
import { CourseSingleViewLayout } from '../features/courses/layouts/CourseSingleViewLayout';
import { CourseOverviewPage } from '../features/courses/pages/CourseOverviewPage';
import { CourseCurriculumPage } from '../features/courses/pages/CourseCurriculumPage';
import { CourseStudentsPage } from '../features/courses/pages/CourseStudentsPage';
import { CourseAssignmentsPage } from '../features/courses/pages/CourseAssignmentsPage';
import { CourseQuizzesPage } from '../features/courses/pages/CourseQuizzesPage';
import { CourseCertificatesPage } from '../features/courses/pages/CourseCertificatesPage';
import { CourseDiscussionsPage } from '../features/courses/pages/CourseDiscussionsPage';
import { CourseAnnouncementsPage } from '../features/courses/pages/CourseAnnouncementsPage';
import { GlobalAnnouncementsPage } from '../features/announcements/pages/GlobalAnnouncementsPage';
import { CourseLiveSessionsPage } from '../features/courses/pages/CourseLiveSessionsPage';
import { GlobalLiveClassroomPage } from '../features/live-sessions/pages/GlobalLiveClassroomPage';
import { CourseReportsPage } from '../features/courses/pages/CourseReportsPage';
import { CourseSettingsPage } from '../features/courses/pages/CourseSettingsPage';

import { WebsiteBuilderLandingPage } from '../features/website-builder/pages/WebsiteBuilderLandingPage';
import { StudentPortalBrandingPage } from '../features/website-builder/pages/StudentPortalBrandingPage';
import { PublicSiteBuilderPage } from '../features/website-builder/pages/PublicSiteBuilderPage';
import { LeadsManagementPage } from '../features/leads/pages/LeadsManagementPage';
import { StudentListPage } from '../features/students/pages/StudentListPage';
import { StudentCreatePage } from '../features/students/pages/StudentCreatePage';
import { StudentSinglePage } from '../features/students/pages/StudentSinglePage';
import { StudentEditPage } from '../features/students/pages/StudentEditPage';
import { StudentReportsPage } from '../features/students/pages/StudentReportsPage';
import { StaffRolesPage } from '../features/staff/pages/StaffRolesPage';
import { SupportPage } from '../features/support/pages/SupportPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { QuizBuilderPage } from '../features/quizzes/pages/QuizBuilderPage';
import { AssignmentsPage } from '../features/assignments/pages/AssignmentsPage';
import { DemoLeadsPage } from '../features/demo-leads/pages/DemoLeadsPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Instructor Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* 1. Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/demo-leads" element={<DemoLeadsPage />} />

          {/* 2. Courses */}
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/create" element={<CourseCreateWizardPage />} />

          {/* Nested Course Single View & Tabs */}
          <Route path="/courses/:courseUuid" element={<CourseSingleViewLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CourseOverviewPage />} />
            <Route path="curriculum" element={<CourseCurriculumPage />} />
            <Route path="students" element={<CourseStudentsPage />} />
            <Route path="students/:studentUuid" element={<StudentSinglePage />} />
            <Route path="students/:studentUuid/*" element={<StudentSinglePage />} />
            <Route path="assignments" element={<CourseAssignmentsPage />} />
            <Route path="assignments/:assignmentUuid" element={<CourseAssignmentsPage />} />
            <Route path="assignments/:assignmentUuid/*" element={<CourseAssignmentsPage />} />
            <Route path="quizzes" element={<CourseQuizzesPage />} />
            <Route path="quizzes/*" element={<CourseQuizzesPage />} />
            <Route path="certificates" element={<CourseCertificatesPage />} />
            <Route path="discussions" element={<CourseDiscussionsPage />} />
            <Route path="discussions/*" element={<CourseDiscussionsPage />} />
            <Route path="announcements" element={<CourseAnnouncementsPage />} />
            <Route path="announcements/*" element={<CourseAnnouncementsPage />} />
            <Route path="live-sessions" element={<CourseLiveSessionsPage />} />
            <Route path="live-sessions/*" element={<CourseLiveSessionsPage />} />
            <Route path="reports" element={<CourseReportsPage />} />
            <Route path="features" element={<CourseFeaturesPage />} />
            <Route path="settings" element={<CourseSettingsPage />} />
          </Route>
          <Route path="/courses/:courseUuid/edit" element={<CourseCreateWizardPage />} />

          {/* 3. Students */}
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/create" element={<StudentCreatePage />} />
          <Route path="/students/:studentUuid" element={<StudentSinglePage />} />
          <Route path="/students/:studentUuid/edit" element={<StudentEditPage />} />
          <Route path="/students/:studentUuid/reports" element={<StudentReportsPage />} />

          {/* 4. Assignments */}
          <Route path="/assignments" element={<AssignmentsPage />} />
          <Route path="/assignments/:assignmentUuid/submissions" element={<AssignmentsPage />} />
          <Route path="/assignments/:assignmentUuid/submissions/:submissionUuid" element={<AssignmentsPage />} />

          {/* 5. Quizzes */}
          <Route path="/quizzes" element={<CourseQuizzesPage />} />
          <Route path="/quizzes/create" element={<QuizBuilderPage />} />
          <Route path="/quizzes/*" element={<CourseQuizzesPage />} />

          {/* 6. Certificates */}
          <Route path="/certificates" element={<CourseCertificatesPage />} />
          <Route path="/certificates/*" element={<CourseCertificatesPage />} />

          {/* 7. Discussions */}
          <Route path="/discussions" element={<CourseDiscussionsPage />} />
          <Route path="/discussions/*" element={<CourseDiscussionsPage />} />

          {/* 8. Announcements */}
          <Route path="/announcements" element={<GlobalAnnouncementsPage />} />
          <Route path="/announcements/*" element={<GlobalAnnouncementsPage />} />

          {/* 8b. Live Classroom */}
          <Route path="/live-classroom" element={<GlobalLiveClassroomPage />} />
          <Route path="/live-classroom/*" element={<GlobalLiveClassroomPage />} />

          {/* 9. Reports */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/*" element={<ReportsPage />} />

          {/* 10. Credits */}
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/buy" element={<CreditsPage />} />
          <Route path="/credits/history" element={<CreditsPage />} />
          <Route path="/credits/usage" element={<CreditsPage />} />
          <Route path="/payments" element={<Navigate to="/credits" replace />} />

          {/* 11. Media Library */}
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/*" element={<MediaPage />} />

          {/* 12 & 13. Staff Directory & Roles */}
          <Route path="/staff" element={<StaffRolesPage />} />
          <Route path="/staff/*" element={<StaffRolesPage />} />
          <Route path="/roles" element={<StaffRolesPage />} />
          <Route path="/roles/*" element={<StaffRolesPage />} />

          {/* 14. Website Builder & Portal Branding */}
          <Route path="/website-builder" element={<WebsiteBuilderLandingPage />} />
          <Route path="/website-builder/student-portal" element={<StudentPortalBrandingPage />} />
          <Route path="/website-builder/public-site" element={<PublicSiteBuilderPage />} />

          {/* 14b. Public Leads */}
          <Route path="/leads" element={<LeadsManagementPage />} />

          {/* 15. Support Desk */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/*" element={<SupportPage />} />

          {/* 16. System Settings */}
          <Route path="/settings" element={<CourseSettingsPage />} />
          <Route path="/settings/*" element={<CourseSettingsPage />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
