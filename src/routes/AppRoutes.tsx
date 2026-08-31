import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { isValidCourseId, isValidModuleUuid } from '../utils/courseValidation.utils';

// Eager Core Auth Pages (Small initial bundle)
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { ChangePasswordPage } from '../features/auth/pages/ChangePasswordPage';
import { SetupPasswordPage } from '../features/auth/pages/SetupPasswordPage';
import { VerifyEmailPage } from '../features/auth/pages/VerifyEmailPage';
import { AcceptInvitePage } from '../features/auth/pages/AcceptInvitePage';
import { AccountActivationPage } from '../features/auth/pages/AccountActivationPage';
import { PasswordUpdatedSuccessPage } from '../features/auth/pages/PasswordUpdatedSuccessPage';

// Core Eager Shell Pages
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Lazy-Loaded Feature Modules (Code-Splitting)
const CreditsPage = lazy(() => import('../features/credits/pages/CreditsPage').then(m => ({ default: m.CreditsPage })));
const BuyCreditsPage = lazy(() => import('../features/credits/pages/BuyCreditsPage').then(m => ({ default: m.BuyCreditsPage })));
const MediaPage = lazy(() => import('../features/media/pages/MediaPage').then(m => ({ default: m.MediaPage })));

const CourseListPage = lazy(() => import('../features/courses/pages/CourseListPage').then(m => ({ default: m.CourseListPage })));
const CourseCategoryManagerPage = lazy(() => import('../features/courses/pages/CourseCategoryManagerPage').then(m => ({ default: m.CourseCategoryManagerPage })));
const CourseCreateWizardPage = lazy(() => import('../features/courses/pages/CourseCreateWizardPage').then(m => ({ default: m.CourseCreateWizardPage })));
const CourseFeaturesPage = lazy(() => import('../features/courses/pages/CourseFeaturesPage').then(m => ({ default: m.CourseFeaturesPage })));

const CourseSingleViewLayout = lazy(() => import('../features/courses/layouts/CourseSingleViewLayout').then(m => ({ default: m.CourseSingleViewLayout })));
const CourseOverviewPage = lazy(() => import('../features/courses/pages/CourseOverviewPage').then(m => ({ default: m.CourseOverviewPage })));
const CourseCurriculumPage = lazy(() => import('../features/courses/pages/CourseCurriculumPage').then(m => ({ default: m.CourseCurriculumPage })));
const CourseStudentsPage = lazy(() => import('../features/courses/pages/CourseStudentsPage').then(m => ({ default: m.CourseStudentsPage })));
const CourseAssignmentsPage = lazy(() => import('../features/courses/pages/CourseAssignmentsPage').then(m => ({ default: m.CourseAssignmentsPage })));
const CourseQuizzesPage = lazy(() => import('../features/courses/pages/CourseQuizzesPage').then(m => ({ default: m.CourseQuizzesPage })));
const CourseCertificatesPage = lazy(() => import('../features/courses/pages/CourseCertificatesPage').then(m => ({ default: m.CourseCertificatesPage })));
const CourseDiscussionsPage = lazy(() => import('../features/courses/pages/CourseDiscussionsPage').then(m => ({ default: m.CourseDiscussionsPage })));
const PersonalChatListPage = lazy(() => import('../features/discussions/pages/PersonalChatListPage').then(m => ({ default: m.PersonalChatListPage })));
const PersonalChatStudentPage = lazy(() => import('../features/discussions/pages/PersonalChatStudentPage').then(m => ({ default: m.PersonalChatStudentPage })));
const CommunityChatListPage = lazy(() => import('../features/discussions/pages/CommunityChatListPage').then(m => ({ default: m.CommunityChatListPage })));
const CommunityChatCoursePage = lazy(() => import('../features/discussions/pages/CommunityChatCoursePage').then(m => ({ default: m.CommunityChatCoursePage })));
const CourseAnnouncementsPage = lazy(() => import('../features/courses/pages/CourseAnnouncementsPage').then(m => ({ default: m.CourseAnnouncementsPage })));
const CourseLiveSessionsPage = lazy(() => import('../features/courses/pages/CourseLiveSessionsPage').then(m => ({ default: m.CourseLiveSessionsPage })));
const CourseReportsPage = lazy(() => import('../features/courses/pages/CourseReportsPage').then(m => ({ default: m.CourseReportsPage })));
const CourseSettingsPage = lazy(() => import('../features/courses/pages/CourseSettingsPage').then(m => ({ default: m.CourseSettingsPage })));
const CourseFeesPage = lazy(() => import('../features/fees/pages/CourseFeesPage').then(m => ({ default: m.CourseFeesPage })));

const ModuleCreatePage = lazy(() => import('../features/courses/pages/ModuleCreatePage').then(m => ({ default: m.ModuleCreatePage })));
const ModuleEditPage = lazy(() => import('../features/courses/pages/ModuleEditPage').then(m => ({ default: m.ModuleEditPage })));
const LessonCreatePage = lazy(() => import('../features/courses/pages/LessonCreatePage').then(m => ({ default: m.LessonCreatePage })));
const LessonTypeSelectPage = lazy(() => import('../features/courses/pages/LessonTypeSelectPage').then(m => ({ default: m.LessonTypeSelectPage })));
const LessonEditPage = lazy(() => import('../features/courses/pages/LessonEditPage').then(m => ({ default: m.LessonEditPage })));
const ResourcePickerPage = lazy(() => import('../features/courses/pages/ResourcePickerPage').then(m => ({ default: m.ResourcePickerPage })));

const WebsiteBuilderPage = lazy(() => import('../features/website-builder/pages/WebsiteBuilderPage').then(m => ({ default: m.WebsiteBuilderPage })));
const WebsiteBuilderLandingPage = lazy(() => import('../features/website-builder/pages/WebsiteBuilderLandingPage').then(m => ({ default: m.WebsiteBuilderLandingPage })));
const StudentPortalBrandingPage = lazy(() => import('../features/website-builder/pages/StudentPortalBrandingPage').then(m => ({ default: m.StudentPortalBrandingPage })));
const PublicSiteBuilderPage = lazy(() => import('../features/website-builder/pages/PublicSiteBuilderPage').then(m => ({ default: m.PublicSiteBuilderPage })));

const CertificateListPage = lazy(() => import('../features/certificates/pages/CertificateListPage').then(m => ({ default: m.CertificateListPage })));
const CertificateBuilderPage = lazy(() => import('../features/certificates/pages/CertificateBuilderPage').then(m => ({ default: m.CertificateBuilderPage })));
const CertificateDetailPage = lazy(() => import('../features/certificates/pages/CertificateDetailPage').then(m => ({ default: m.CertificateDetailPage })));

const CouponListPage = lazy(() => import('../features/coupons/pages/CouponListPage').then(m => ({ default: m.CouponListPage })));
const CouponCreatePage = lazy(() => import('../features/coupons/pages/CouponCreatePage').then(m => ({ default: m.CouponCreatePage })));
const CouponEditPage = lazy(() => import('../features/coupons/pages/CouponEditPage').then(m => ({ default: m.CouponEditPage })));
const CouponDetailPage = lazy(() => import('../features/coupons/pages/CouponDetailPage').then(m => ({ default: m.CouponDetailPage })));

const DemoLeadsPage = lazy(() => import('../features/demo-leads/pages/DemoLeadsPage').then(m => ({ default: m.DemoLeadsPage })));

const StaffDirectoryPage = lazy(() => import('../features/staff/pages/StaffDirectoryPage').then(m => ({ default: m.StaffDirectoryPage })));
const StaffCreatePage = lazy(() => import('../features/staff/pages/StaffCreatePage').then(m => ({ default: m.StaffCreatePage })));
const StaffEditPage = lazy(() => import('../features/staff/pages/StaffEditPage').then(m => ({ default: m.StaffEditPage })));
const RolesPage = lazy(() => import('../features/staff/pages/RolesPage').then(m => ({ default: m.RolesPage })));
const RoleCreatePage = lazy(() => import('../features/staff/pages/RoleCreatePage').then(m => ({ default: m.RoleCreatePage })));

const GlobalFeesPage = lazy(() => import('../features/fees/pages/GlobalFeesPage').then(m => ({ default: m.GlobalFeesPage })));
const SupportPage = lazy(() => import('../features/support/pages/SupportPage').then(m => ({ default: m.SupportPage })));

const StudentListPage = lazy(() => import('../features/students/pages/StudentListPage').then(m => ({ default: m.StudentListPage })));
const StudentSinglePage = lazy(() => import('../features/students/pages/StudentSinglePage').then(m => ({ default: m.StudentSinglePage })));
const StudentCreatePage = lazy(() => import('../features/students/pages/StudentCreatePage').then(m => ({ default: m.StudentCreatePage })));
const StudentEditPage = lazy(() => import('../features/students/pages/StudentEditPage').then(m => ({ default: m.StudentEditPage })));
const EnrollStudentPage = lazy(() => import('../features/students/pages/EnrollStudentPage').then(m => ({ default: m.EnrollStudentPage })));
const BulkUploadStudentsPage = lazy(() => import('../features/students/pages/BulkUploadStudentsPage').then(m => ({ default: m.BulkUploadStudentsPage })));
const StudentReportsPage = lazy(() => import('../features/students/pages/StudentReportsPage').then(m => ({ default: m.StudentReportsPage })));

const PaymentsOverviewPage = lazy(() => import('../features/payments/pages/PaymentsOverviewPage').then(m => ({ default: m.PaymentsOverviewPage })));
const TransactionsPage = lazy(() => import('../features/payments/pages/TransactionsPage').then(m => ({ default: m.TransactionsPage })));
const SettlementsPage = lazy(() => import('../features/payments/pages/SettlementsPage').then(m => ({ default: m.SettlementsPage })));
const PaymentSettingsPage = lazy(() => import('../features/payments/pages/PaymentSettingsPage').then(m => ({ default: m.PaymentSettingsPage })));

const GlobalLiveClassroomPage = lazy(() => import('../features/live-sessions/pages/GlobalLiveClassroomPage').then(m => ({ default: m.GlobalLiveClassroomPage })));
const CreateLiveSessionPage = lazy(() => import('../features/live-sessions/pages/CreateLiveSessionPage').then(m => ({ default: m.CreateLiveSessionPage })));

const QuizBuilderPage = lazy(() => import('../features/quizzes/pages/QuizBuilderPage').then(m => ({ default: m.QuizBuilderPage })));
const ReportsPage = lazy(() => import('../features/reports/pages/ReportsPage').then(m => ({ default: m.ReportsPage })));
const SettingsPage = lazy(() => import('../features/settings/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));

const PageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-[400px] w-full font-sans">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      <span className="text-xs font-semibold text-slate-500">Loading module...</span>
    </div>
  </div>
);

const LegacyLessonTypeRedirect: React.FC = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  if (courseId && moduleId && isValidCourseId(courseId) && isValidModuleUuid(moduleId)) {
    return <Navigate to={`/courses/${courseId}/curriculum/lessons/select-type?moduleUuid=${moduleId}`} replace />;
  }
  if (courseId && isValidCourseId(courseId)) {
    return <Navigate to={`/courses/${courseId}/curriculum/lessons/select-type`} replace />;
  }
  return <Navigate to="/courses" replace />;
};

const LegacyLessonCreateRedirect: React.FC = () => {
  const { courseId, moduleId } = useParams<{ courseId: string; moduleId: string }>();
  if (courseId && moduleId && isValidCourseId(courseId) && isValidModuleUuid(moduleId)) {
    return <Navigate to={`/courses/${courseId}/curriculum/lessons/new?moduleUuid=${moduleId}`} replace />;
  }
  if (courseId && isValidCourseId(courseId)) {
    return <Navigate to={`/courses/${courseId}/curriculum/lessons/select-type`} replace />;
  }
  return <Navigate to="/courses" replace />;
};

const LegacyLessonEditRedirect: React.FC = () => {
  const { courseId, moduleId, lessonId } = useParams<{ courseId: string; moduleId: string; lessonId: string }>();
  if (courseId && lessonId && isValidCourseId(courseId)) {
    const modQuery = moduleId && isValidModuleUuid(moduleId) ? `?moduleUuid=${moduleId}` : '';
    return <Navigate to={`/courses/${courseId}/curriculum/lessons/${lessonId}/edit${modQuery}`} replace />;
  }
  if (courseId && isValidCourseId(courseId)) {
    return <Navigate to={`/courses/${courseId}/curriculum`} replace />;
  }
  return <Navigate to="/courses" replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        {/* PUBLIC AUTH ROUTES */}
        <Route element={<PublicRoute />}>
          <Route element={<AuthLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
            <Route path="/setup-password" element={<SetupPasswordPage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/accept-invite" element={<AcceptInvitePage />} />
            <Route path="/activate-account" element={<AccountActivationPage />} />
            <Route path="/password-updated" element={<PasswordUpdatedSuccessPage />} />
          </Route>
        </Route>

        {/* PROTECTED INSTRUCTOR APP ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 1. Students Domain */}
            <Route path="/students" element={<StudentListPage />} />
            <Route path="/students/create" element={<StudentCreatePage />} />
            <Route path="/students/enroll" element={<EnrollStudentPage />} />
            <Route path="/students/bulk-upload" element={<BulkUploadStudentsPage />} />
            <Route path="/students/reports" element={<StudentReportsPage />} />
            <Route path="/students/:studentId" element={<StudentSinglePage />} />
            <Route path="/students/:studentId/edit" element={<StudentEditPage />} />

            {/* 2. Course Management & Authoring */}
            <Route path="/courses" element={<CourseListPage />} />
            <Route path="/courses/categories" element={<CourseCategoryManagerPage />} />
            <Route path="/courses/create" element={<CourseCreateWizardPage />} />
            <Route path="/courses/:courseUuid/edit" element={<CourseCreateWizardPage />} />
            <Route path="/courses/:courseId/edit" element={<CourseCreateWizardPage />} />

            {/* Single Course Workspace */}
            <Route path="/courses/:courseId" element={<CourseSingleViewLayout />}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<CourseOverviewPage />} />
              <Route path="curriculum" element={<CourseCurriculumPage />} />
              <Route path="students" element={<CourseStudentsPage />} />
              <Route path="students/enroll" element={<CourseStudentsPage />} />
              <Route path="students/bulk-upload" element={<CourseStudentsPage />} />
              <Route path="students/:studentId" element={<StudentSinglePage />} />
              <Route path="students/:studentId/overview" element={<StudentSinglePage />} />
              <Route path="assignments" element={<CourseAssignmentsPage />} />
              <Route path="assignments/:assignmentUuid" element={<CourseAssignmentsPage />} />
              <Route path="assignments/:assignmentUuid/submissions/:submissionUuid" element={<CourseAssignmentsPage />} />
              <Route path="quizzes" element={<CourseQuizzesPage />} />
              <Route path="certificates" element={<CourseCertificatesPage />} />
              <Route path="discussions" element={<CourseDiscussionsPage />} />
              <Route path="discussions/community" element={<CourseDiscussionsPage />} />
              <Route path="discussions/community/:threadId" element={<CourseDiscussionsPage />} />
              <Route path="discussions/community-chat" element={<CommunityChatListPage />} />
              <Route path="discussions/community-chat/:courseId" element={<CommunityChatCoursePage />} />
              <Route path="discussions/personal" element={<PersonalChatListPage />} />
              <Route path="discussions/personal/:studentId" element={<PersonalChatStudentPage />} />
              <Route path="discussions/*" element={<CourseDiscussionsPage />} />
              <Route path="announcements" element={<CourseAnnouncementsPage />} />
              <Route path="announcements/*" element={<CourseAnnouncementsPage />} />
              <Route path="live-sessions" element={<CourseLiveSessionsPage />} />
              <Route path="live-sessions/new" element={<CreateLiveSessionPage />} />
              <Route path="fees" element={<CourseFeesPage />} />
              <Route path="coupons" element={<CouponListPage />} />
              <Route path="coupons/*" element={<CouponListPage />} />
              <Route path="features" element={<CourseFeaturesPage />} />
              <Route path="reports" element={<CourseReportsPage />} />
              <Route path="settings" element={<CourseSettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Curriculum Authoring Canonical Sub-routes */}
            <Route path="/courses/:courseId/curriculum/modules/new" element={<ModuleCreatePage />} />
            <Route path="/courses/:courseId/curriculum/modules/:moduleId/edit" element={<ModuleEditPage />} />
            <Route path="/courses/:courseId/curriculum/lessons/select-type" element={<LessonTypeSelectPage />} />
            <Route path="/courses/:courseId/curriculum/lessons/new" element={<LessonCreatePage />} />
            <Route path="/courses/:courseId/curriculum/lessons/:lessonId/edit" element={<LessonEditPage />} />
            <Route path="/courses/:courseId/curriculum/quizzes/new" element={<QuizBuilderPage />} />
            <Route path="/courses/:courseId/curriculum/quizzes/:quizId/edit" element={<QuizBuilderPage />} />
            <Route path="/courses/:courseId/curriculum/lessons/:lessonId/resources" element={<ResourcePickerPage />} />
            <Route path="/courses/:courseId/curriculum/resources/add" element={<ResourcePickerPage />} />

            {/* Legacy Curriculum Authoring Redirects */}
            <Route path="/courses/:courseId/modules/create" element={<ModuleCreatePage />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/create" element={<LegacyLessonCreateRedirect />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit" element={<LegacyLessonEditRedirect />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources" element={<ResourcePickerPage />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/create/type" element={<LegacyLessonTypeRedirect />} />

            {/* 3. Certificate Builder */}
            <Route path="/certificates" element={<CertificateListPage />} />
            <Route path="/certificates/new" element={<CertificateBuilderPage />} />
            <Route path="/certificates/:id/edit" element={<CertificateBuilderPage />} />
            <Route path="/certificates/:id/issue" element={<CertificateDetailPage />} />

            {/* 4. Coupons Management */}
            <Route path="/coupons" element={<CouponListPage />} />
            <Route path="/coupons/new" element={<CouponCreatePage />} />
            <Route path="/coupons/:couponId" element={<CouponDetailPage />} />
            <Route path="/coupons/:couponId/edit" element={<CouponEditPage />} />

            {/* 5. Global Discussions & Chat */}
            <Route path="/discussions" element={<Navigate to="/discussions/personal" replace />} />
            <Route path="/discussions/community" element={<CommunityChatListPage />} />
            <Route path="/discussions/community/:courseId" element={<CommunityChatCoursePage />} />
            <Route path="/discussions/community-chat" element={<CommunityChatListPage />} />
            <Route path="/discussions/community-chat/:courseId" element={<CommunityChatCoursePage />} />
            <Route path="/discussions/personal" element={<PersonalChatListPage />} />
            <Route path="/discussions/personal/:studentId" element={<PersonalChatStudentPage />} />

            {/* 6. Live Classroom */}
            <Route path="/live-classroom" element={<GlobalLiveClassroomPage />} />
            <Route path="/live-classroom/create" element={<CreateLiveSessionPage />} />

            {/* 7. Demo Leads CRM */}
            <Route path="/demo-leads" element={<DemoLeadsPage />} />
            <Route path="/demo-leads/*" element={<DemoLeadsPage />} />

            {/* 8. Dual Payment Architecture */}
            <Route path="/payments" element={<PaymentsOverviewPage />} />
            <Route path="/payments/overview" element={<PaymentsOverviewPage />} />
            <Route path="/payments/transactions" element={<TransactionsPage />} />
            <Route path="/payments/settlements" element={<SettlementsPage />} />
            <Route path="/settings/payments" element={<PaymentSettingsPage />} />

            {/* 9. Credits Workspace */}
            <Route path="/credits" element={<CreditsPage />} />
            <Route path="/credits/buy" element={<BuyCreditsPage />} />
            <Route path="/credits/history" element={<CreditsPage />} />
            <Route path="/credits/usage" element={<CreditsPage />} />

            {/* 10. Global Fees */}
            <Route path="/fees" element={<GlobalFeesPage />} />
            <Route path="/fees/*" element={<GlobalFeesPage />} />

            {/* 11. Media Library */}
            <Route path="/media" element={<MediaPage />} />
            <Route path="/media/*" element={<MediaPage />} />

            {/* 12. Staff Directory & Roles */}
            <Route path="/staff" element={<StaffDirectoryPage />} />
            <Route path="/staff/create" element={<StaffCreatePage />} />
            <Route path="/staff/:staffId/edit" element={<StaffEditPage />} />
            <Route path="/staff/*" element={<StaffDirectoryPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/roles/create" element={<RoleCreatePage />} />

            {/* 13. Website Builder */}
            <Route path="/website-builder" element={<WebsiteBuilderPage />} />
            <Route path="/website-builder/landing" element={<WebsiteBuilderLandingPage />} />
            <Route path="/website-builder/branding" element={<StudentPortalBrandingPage />} />
            <Route path="/website-builder/public" element={<PublicSiteBuilderPage />} />

            {/* 14. Reports & Analytics */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/*" element={<ReportsPage />} />

            {/* 15. Quizzes & Assessments */}
            <Route path="/quizzes/builder" element={<QuizBuilderPage />} />
            <Route path="/quizzes/:quizId" element={<QuizBuilderPage />} />

            {/* 16. Settings */}
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/general" element={<SettingsPage />} />

            {/* 17. Support Desk */}
            <Route path="/support" element={<SupportPage />} />
            <Route path="/support/*" element={<SupportPage />} />

            {/* 18. Access Control Page */}
            <Route path="/access-denied" element={<AccessDeniedPage />} />
          </Route>
        </Route>

        {/* CANONICAL NOT FOUND PAGE FOR UNKNOWN ROUTES */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};
