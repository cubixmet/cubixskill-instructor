import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage';
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
import { CourseLiveSessionsPage } from '../features/courses/pages/CourseLiveSessionsPage';
import { GlobalLiveClassroomPage } from '../features/live-sessions/pages/GlobalLiveClassroomPage';
import { CourseReportsPage } from '../features/courses/pages/CourseReportsPage';
import { CourseSettingsPage } from '../features/courses/pages/CourseSettingsPage';
import { ModuleCreatePage } from '../features/courses/pages/ModuleCreatePage';
import { ModuleEditPage } from '../features/courses/pages/ModuleEditPage';
import { LessonCreatePage } from '../features/courses/pages/LessonCreatePage';
import { LessonTypeSelectPage } from '../features/courses/pages/LessonTypeSelectPage';
import { LessonEditPage } from '../features/courses/pages/LessonEditPage';
import { ResourcePickerPage } from '../features/courses/pages/ResourcePickerPage';

import { WebsiteBuilderLandingPage } from '../features/website-builder/pages/WebsiteBuilderLandingPage';
import { StudentPortalBrandingPage } from '../features/website-builder/pages/StudentPortalBrandingPage';
import { PublicSiteBuilderPage } from '../features/website-builder/pages/PublicSiteBuilderPage';
import { CertificateListPage } from '../features/certificates/pages/CertificateListPage';
import { CertificateBuilderPage } from '../features/certificates/pages/CertificateBuilderPage';
import { CertificateDetailPage } from '../features/certificates/pages/CertificateDetailPage';
import { StudentListPage } from '../features/students/pages/StudentListPage';
import { StudentCreatePage } from '../features/students/pages/StudentCreatePage';
import { StudentSinglePage } from '../features/students/pages/StudentSinglePage';
import { StudentEditPage } from '../features/students/pages/StudentEditPage';
import { StudentReportsPage } from '../features/students/pages/StudentReportsPage';
import { StaffDirectoryPage } from '../features/staff/pages/StaffDirectoryPage';
import { RolesPage } from '../features/staff/pages/RolesPage';
import { GlobalFeesPage } from '../features/fees/pages/GlobalFeesPage';
import { CourseFeesPage } from '../features/fees/pages/CourseFeesPage';
import { SupportPage } from '../features/support/pages/SupportPage';
import { DemoLeadsPage } from '../features/demo-leads/pages/DemoLeadsPage';
import { BulkUploadStudentsPage } from '../features/students/pages/BulkUploadStudentsPage';
import { EnrollStudentPage } from '../features/students/pages/EnrollStudentPage';
import { CreateLiveSessionPage } from '../features/live-sessions/pages/CreateLiveSessionPage';
import { CouponListPage } from '../features/coupons/pages/CouponListPage';
import { CouponCreatePage } from '../features/coupons/pages/CouponCreatePage';
import { CouponEditPage } from '../features/coupons/pages/CouponEditPage';
import { CouponDetailPage } from '../features/coupons/pages/CouponDetailPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
        </Route>
      </Route>

      {/* Protected Instructor Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* 1. Dashboard */}
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/demo-leads" element={<DemoLeadsPage />} />


          {/* Global Coupons */}
          <Route path="/coupons" element={<CouponListPage />} />
          <Route path="/coupons/new" element={<CouponCreatePage />} />
          <Route path="/coupons/:couponId" element={<CouponDetailPage />} />
          <Route path="/coupons/:couponId/edit" element={<CouponEditPage />} />

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
            <Route path="fees" element={<CourseFeesPage />} />
            <Route path="coupons" element={<CouponListPage />} />
            <Route path="reports" element={<CourseReportsPage />} />
            <Route path="features" element={<CourseFeaturesPage />} />
            <Route path="settings" element={<CourseSettingsPage />} />
          </Route>
          <Route path="/courses/:courseUuid/edit" element={<CourseCreateWizardPage />} />

          {/* Course-Specific Fees Direct Route */}
          <Route path="/courses/:courseUuid/fees" element={<CourseFeesPage />} />
          <Route path="/courses/:courseId/fees" element={<CourseFeesPage />} />

          {/* Course-Specific Coupon Dedicated Pages */}
          <Route path="/courses/:courseUuid/coupons/new" element={<CouponCreatePage />} />
          <Route path="/courses/:courseUuid/coupons/:couponId" element={<CouponDetailPage />} />
          <Route path="/courses/:courseUuid/coupons/:couponId/edit" element={<CouponEditPage />} />
          <Route path="/courses/:courseId/coupons" element={<CouponListPage />} />
          <Route path="/courses/:courseId/coupons/new" element={<CouponCreatePage />} />
          <Route path="/courses/:courseId/coupons/:couponId" element={<CouponDetailPage />} />
          <Route path="/courses/:courseId/coupons/:couponId/edit" element={<CouponEditPage />} />

          {/* Module Dedicated Form Pages */}
          <Route path="/courses/:courseUuid/curriculum/modules/new" element={<ModuleCreatePage />} />
          <Route path="/courses/:courseUuid/curriculum/modules/:moduleUuid/edit" element={<ModuleEditPage />} />

          {/* Lesson Dedicated Form Pages */}
          <Route path="/courses/:courseUuid/curriculum/lessons/select-type" element={<LessonTypeSelectPage />} />
          <Route path="/courses/:courseUuid/curriculum/lessons/new" element={<LessonCreatePage />} />
          <Route path="/courses/:courseUuid/curriculum/lessons/:lessonUuid/edit" element={<LessonEditPage />} />
          <Route path="/courses/:courseUuid/curriculum/resources/add" element={<ResourcePickerPage />} />

          {/* Students Dedicated Form & Bulk Pages */}
          <Route path="/courses/:courseUuid/students/bulk-upload" element={<BulkUploadStudentsPage />} />
          <Route path="/courses/:courseUuid/students/enroll" element={<EnrollStudentPage />} />
          <Route path="/students/bulk-upload" element={<BulkUploadStudentsPage />} />
          <Route path="/students/enroll" element={<EnrollStudentPage />} />

          {/* Live Sessions Dedicated Form Pages */}
          <Route path="/courses/:courseUuid/live-sessions/new" element={<CreateLiveSessionPage />} />
          <Route path="/courses/:courseUuid/live-sessions/:sessionId/edit" element={<CreateLiveSessionPage />} />
          <Route path="/live-classroom/new" element={<CreateLiveSessionPage />} />
          <Route path="/live-classroom/:sessionId/edit" element={<CreateLiveSessionPage />} />

          {/* 3. Students */}
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/create" element={<StudentCreatePage />} />
          <Route path="/students/:studentUuid" element={<StudentSinglePage />} />
          <Route path="/students/:studentUuid/edit" element={<StudentEditPage />} />
          <Route path="/students/:studentUuid/enroll" element={<EnrollStudentPage />} />
          <Route path="/students/:studentUuid/reports" element={<StudentReportsPage />} />

          {/* 4. Assignments (Redirected) */}
          <Route path="/assignments" element={<Navigate to="/dashboard" replace />} />
          <Route path="/assignments/*" element={<Navigate to="/dashboard" replace />} />

          {/* 5. Quizzes (Redirected) */}
          <Route path="/quizzes" element={<Navigate to="/dashboard" replace />} />
          <Route path="/quizzes/*" element={<Navigate to="/dashboard" replace />} />

          {/* 6. Certificates */}
          <Route path="/certificates" element={<CertificateListPage />} />
          <Route path="/certificates/new" element={<CertificateBuilderPage />} />
          <Route path="/certificates/:certificateId" element={<CertificateDetailPage />} />
          <Route path="/certificates/:certificateId/edit" element={<CertificateBuilderPage />} />

          {/* Course-Specific Certificate Dedicated Builder & Detail Routes */}
          <Route path="/courses/:courseUuid/certificates/new" element={<CertificateBuilderPage />} />
          <Route path="/courses/:courseUuid/certificates/:certificateId" element={<CertificateDetailPage />} />
          <Route path="/courses/:courseUuid/certificates/:certificateId/edit" element={<CertificateBuilderPage />} />
          <Route path="/courses/:courseId/certificates" element={<CertificateListPage />} />
          <Route path="/courses/:courseId/certificates/new" element={<CertificateBuilderPage />} />
          <Route path="/courses/:courseId/certificates/:certificateId" element={<CertificateDetailPage />} />
          <Route path="/courses/:courseId/certificates/:certificateId/edit" element={<CertificateBuilderPage />} />

          {/* 7. Discussions */}
          <Route path="/discussions" element={<CourseDiscussionsPage />} />
          <Route path="/discussions/*" element={<CourseDiscussionsPage />} />

          {/* 8. Announcements (Redirected) */}
          <Route path="/announcements" element={<Navigate to="/dashboard" replace />} />
          <Route path="/announcements/*" element={<Navigate to="/dashboard" replace />} />

          {/* 8b. Live Classroom */}
          <Route path="/live-classroom" element={<GlobalLiveClassroomPage />} />
          <Route path="/live-classroom/*" element={<GlobalLiveClassroomPage />} />

          {/* 9. Reports (Redirected) */}
          <Route path="/reports" element={<Navigate to="/dashboard" replace />} />
          <Route path="/reports/*" element={<Navigate to="/dashboard" replace />} />

          {/* 10. Credits & Fees */}
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/buy" element={<CreditsPage />} />
          <Route path="/credits/history" element={<CreditsPage />} />
          <Route path="/credits/usage" element={<CreditsPage />} />
          <Route path="/fees" element={<GlobalFeesPage />} />
          <Route path="/fees/*" element={<GlobalFeesPage />} />
          <Route path="/payments" element={<Navigate to="/credits" replace />} />

          {/* 11. Media Library */}
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/*" element={<MediaPage />} />

          {/* 12 & 13. Staff Directory & Roles */}
          <Route path="/staff" element={<StaffDirectoryPage />} />
          <Route path="/staff/*" element={<StaffDirectoryPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/*" element={<RolesPage />} />

          {/* 14. Website Builder & Portal Branding */}
          <Route path="/website-builder" element={<WebsiteBuilderLandingPage />} />
          <Route path="/website-builder/student-portal" element={<StudentPortalBrandingPage />} />
          <Route path="/website-builder/public-site" element={<PublicSiteBuilderPage />} />
          <Route path="/certificate-builder/image-template" element={<Navigate to="/certificates/new" replace />} />
          <Route path="/certificate-builder/custom" element={<Navigate to="/certificates/new" replace />} />

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
