import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

// Auth Pages
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage';
import { SetupPasswordPage } from '../features/auth/pages/SetupPasswordPage';
import { VerifyOtpPage } from '../features/auth/pages/VerifyOtpPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { AcceptInvitePage } from '../features/auth/pages/AcceptInvitePage';
import { AccountActivationPage } from '../features/auth/pages/AccountActivationPage';
import { PasswordUpdatedSuccessPage } from '../features/auth/pages/PasswordUpdatedSuccessPage';

// Core Dashboard Page
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';

// Credits Pages
import { CreditsPage } from '../features/credits/pages/CreditsPage';
import { BuyCreditsPage } from '../features/credits/pages/BuyCreditsPage';

// Media Page
import { MediaPage } from '../features/media/pages/MediaPage';

// Course Management Pages
import { CourseListPage } from '../features/courses/pages/CourseListPage';
import { CourseCategoryManagerPage } from '../features/courses/pages/CourseCategoryManagerPage';
import { CourseCreateWizardPage } from '../features/courses/pages/CourseCreateWizardPage';
import { CourseFeaturesPage } from '../features/courses/pages/CourseFeaturesPage';

// Single Course Management Workspace (Tabbed Navigation)
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
import { CourseReportsPage } from '../features/courses/pages/CourseReportsPage';
import { CourseSettingsPage } from '../features/courses/pages/CourseSettingsPage';
import { CourseFeesPage } from '../features/fees/pages/CourseFeesPage';

// Deep Curriculum Authoring Sub-routes
import { ModuleCreatePage } from '../features/courses/pages/ModuleCreatePage';
import { ModuleEditPage } from '../features/courses/pages/ModuleEditPage';
import { LessonCreatePage } from '../features/courses/pages/LessonCreatePage';
import { LessonTypeSelectPage } from '../features/courses/pages/LessonTypeSelectPage';
import { LessonEditPage } from '../features/courses/pages/LessonEditPage';
import { ResourcePickerPage } from '../features/courses/pages/ResourcePickerPage';

// Website Builder Pages
import { WebsiteBuilderPage } from '../features/website-builder/pages/WebsiteBuilderPage';
import { WebsiteBuilderLandingPage } from '../features/website-builder/pages/WebsiteBuilderLandingPage';
import { StudentPortalBrandingPage } from '../features/website-builder/pages/StudentPortalBrandingPage';
import { PublicSiteBuilderPage } from '../features/website-builder/pages/PublicSiteBuilderPage';

// Certificate Pages
import { CertificateListPage } from '../features/certificates/pages/CertificateListPage';
import { CertificateBuilderPage } from '../features/certificates/pages/CertificateBuilderPage';
import { CertificateDetailPage } from '../features/certificates/pages/CertificateDetailPage';

// Coupons Pages
import { CouponListPage } from '../features/coupons/pages/CouponListPage';
import { CouponCreatePage } from '../features/coupons/pages/CouponCreatePage';
import { CouponEditPage } from '../features/coupons/pages/CouponEditPage';
import { CouponDetailPage } from '../features/coupons/pages/CouponDetailPage';

// Demo Leads & Discussions
import { DemoLeadsPage } from '../features/demo-leads/pages/DemoLeadsPage';

// Staff Directory & Roles
import { StaffDirectoryPage } from '../features/staff/pages/StaffDirectoryPage';
import { RolesPage } from '../features/staff/pages/RolesPage';

// Global Fees Pages
import { GlobalFeesPage } from '../features/fees/pages/GlobalFeesPage';

// Support Desk
import { SupportPage } from '../features/support/pages/SupportPage';

// Student Management Pages
import { StudentListPage } from '../features/students/pages/StudentListPage';
import { StudentSinglePage } from '../features/students/pages/StudentSinglePage';
import { StudentCreatePage } from '../features/students/pages/StudentCreatePage';
import { StudentEditPage } from '../features/students/pages/StudentEditPage';
import { EnrollStudentPage } from '../features/students/pages/EnrollStudentPage';
import { BulkUploadStudentsPage } from '../features/students/pages/BulkUploadStudentsPage';
import { StudentReportsPage } from '../features/students/pages/StudentReportsPage';

// Dual Payment Architecture Pages
import { PaymentsOverviewPage } from '../features/payments/pages/PaymentsOverviewPage';
import { TransactionsPage } from '../features/payments/pages/TransactionsPage';
import { SettlementsPage } from '../features/payments/pages/SettlementsPage';
import { PaymentSettingsPage } from '../features/payments/pages/PaymentSettingsPage';

// Live Sessions & Classroom
import { GlobalLiveClassroomPage } from '../features/live-sessions/pages/GlobalLiveClassroomPage';
import { CreateLiveSessionPage } from '../features/live-sessions/pages/CreateLiveSessionPage';

// Quizzes & Reports & Settings
import { QuizBuilderPage } from '../features/quizzes/pages/QuizBuilderPage';
import { ReportsPage } from '../features/reports/pages/ReportsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

// Access Control & Error Pages
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* PUBLIC AUTH ROUTES */}
      <Route element={<PublicRoute />}>
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
          <Route path="/verify-otp" element={<VerifyOtpPage />} />
          <Route path="/verify-email" element={<VerifyEmailPage />} />
          <Route path="/accept-invite" element={<AcceptInvitePage />} />
          <Route path="/activate-account" element={<AccountActivationPage />} />
          <Route path="/password-updated" element={<PasswordUpdatedSuccessPage />} />
        </Route>
      </Route>

      {/* PROTECTED INSTRUCTOR APP ROUTES */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Root Redirects to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 1. Course Management */}
          <Route path="/courses" element={<CourseListPage />} />
          <Route path="/courses/categories" element={<CourseCategoryManagerPage />} />
          <Route path="/courses/create" element={<CourseCreateWizardPage />} />
          <Route path="/courses/:courseId/features" element={<CourseFeaturesPage />} />

          {/* Single Course Workspace (Tabbed Workspace Navigation) */}
          <Route path="/courses/:courseId" element={<CourseSingleViewLayout />}>
            <Route index element={<Navigate to="overview" replace />} />
            <Route path="overview" element={<CourseOverviewPage />} />
            <Route path="curriculum" element={<CourseCurriculumPage />} />
            <Route path="students" element={<CourseStudentsPage />} />
            <Route path="assignments" element={<CourseAssignmentsPage />} />
            <Route path="quizzes" element={<CourseQuizzesPage />} />
            <Route path="certificates" element={<CourseCertificatesPage />} />
            <Route path="discussions" element={<CourseDiscussionsPage />} />
            <Route path="announcements" element={<CourseAnnouncementsPage />} />
            <Route path="live-sessions" element={<CourseLiveSessionsPage />} />
            <Route path="fees" element={<CourseFeesPage />} />
            <Route path="coupons" element={<CouponListPage />} />
            <Route path="features" element={<CourseFeaturesPage />} />
            <Route path="reports" element={<CourseReportsPage />} />
            <Route path="settings" element={<CourseSettingsPage />} />
          </Route>

          {/* Deep Curriculum Authoring Sub-routes */}
          <Route path="/courses/:courseId/curriculum/modules/new" element={<ModuleCreatePage />} />
          <Route path="/courses/:courseId/curriculum/modules/:moduleId/edit" element={<ModuleEditPage />} />
          <Route path="/courses/:courseId/modules/create" element={<ModuleCreatePage />} />
          <Route path="/courses/:courseId/modules/:moduleId/edit" element={<ModuleEditPage />} />
          <Route path="/courses/:courseId/modules/:moduleId/lessons/create/type" element={<LessonTypeSelectPage />} />
          <Route path="/courses/:courseId/modules/:moduleId/lessons/create" element={<LessonCreatePage />} />
          <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit" element={<LessonEditPage />} />
          <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources" element={<ResourcePickerPage />} />

          {/* 2. Global Student Management */}
          <Route path="/students" element={<StudentListPage />} />
          <Route path="/students/create" element={<StudentCreatePage />} />
          <Route path="/students/enroll" element={<EnrollStudentPage />} />
          <Route path="/students/bulk-upload" element={<BulkUploadStudentsPage />} />
          <Route path="/students/reports" element={<StudentReportsPage />} />
          <Route path="/students/:studentId" element={<StudentSinglePage />} />
          <Route path="/students/:studentId/edit" element={<StudentEditPage />} />

          {/* 3. Global Certificate Management */}
          <Route path="/certificates" element={<CertificateListPage />} />
          <Route path="/certificates/new" element={<CertificateBuilderPage />} />
          <Route path="/certificates/:id/edit" element={<CertificateBuilderPage />} />
          <Route path="/certificates/:id/issue" element={<CertificateDetailPage />} />

          {/* 4. Global Coupons & Discounts */}
          <Route path="/coupons" element={<CouponListPage />} />
          <Route path="/coupons/new" element={<CouponCreatePage />} />
          <Route path="/coupons/:couponId" element={<CouponDetailPage />} />
          <Route path="/coupons/:couponId/edit" element={<CouponEditPage />} />

          {/* 5. Global Discussions & Classroom */}
          <Route path="/discussions" element={<CourseDiscussionsPage />} />
          <Route path="/discussions/*" element={<CourseDiscussionsPage />} />
          <Route path="/live-classroom" element={<GlobalLiveClassroomPage />} />
          <Route path="/live-classroom/create" element={<CreateLiveSessionPage />} />
          <Route path="/live-classroom/*" element={<GlobalLiveClassroomPage />} />

          {/* 6. Global Demo Leads */}
          <Route path="/demo-leads" element={<DemoLeadsPage />} />
          <Route path="/demo-leads/*" element={<DemoLeadsPage />} />

          {/* 7. Dual Payments Architecture Routes */}
          <Route path="/payments" element={<PaymentsOverviewPage />} />
          <Route path="/payments/overview" element={<PaymentsOverviewPage />} />
          <Route path="/payments/transactions" element={<TransactionsPage />} />
          <Route path="/payments/settlements" element={<SettlementsPage />} />
          <Route path="/settings/payments" element={<PaymentSettingsPage />} />

          {/* 8. Credits & Wallet */}
          <Route path="/credits" element={<CreditsPage />} />
          <Route path="/credits/buy" element={<BuyCreditsPage />} />
          <Route path="/credits/history" element={<CreditsPage />} />
          <Route path="/credits/usage" element={<CreditsPage />} />
          <Route path="/fees" element={<GlobalFeesPage />} />
          <Route path="/fees/*" element={<GlobalFeesPage />} />

          {/* 9. Media Library */}
          <Route path="/media" element={<MediaPage />} />
          <Route path="/media/*" element={<MediaPage />} />

          {/* 10. Staff Directory & Roles */}
          <Route path="/staff" element={<StaffDirectoryPage />} />
          <Route path="/staff/*" element={<StaffDirectoryPage />} />
          <Route path="/roles" element={<RolesPage />} />
          <Route path="/roles/*" element={<RolesPage />} />

          {/* 11. Website Builder & Sub-pages */}
          <Route path="/website-builder" element={<WebsiteBuilderPage />} />
          <Route path="/website-builder/landing" element={<WebsiteBuilderLandingPage />} />
          <Route path="/website-builder/branding" element={<StudentPortalBrandingPage />} />
          <Route path="/website-builder/public" element={<PublicSiteBuilderPage />} />
          <Route path="/website-builder/*" element={<WebsiteBuilderPage />} />

          {/* 12. Reports & Analytics */}
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/reports/*" element={<ReportsPage />} />

          {/* 13. Quiz Builder */}
          <Route path="/quizzes/builder" element={<QuizBuilderPage />} />
          <Route path="/quizzes/:quizId" element={<QuizBuilderPage />} />

          {/* 14. Settings */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/general" element={<SettingsPage />} />

          {/* 15. Support Desk */}
          <Route path="/support" element={<SupportPage />} />
          <Route path="/support/*" element={<SupportPage />} />

          {/* 16. Access Control Page */}
          <Route path="/access-denied" element={<AccessDeniedPage />} />
        </Route>
      </Route>

      {/* CANONICAL NOT FOUND PAGE FOR UNKNOWN ROUTES */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
