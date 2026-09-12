import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { PublicRoute } from './PublicRoute';
import { ProtectedRoute } from './ProtectedRoute';
import { CourseFeatureGuard } from '../components/CourseFeatureGuard';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { isValidCourseId, isValidModuleUuid } from '../utils/courseValidation.utils';

// Eager Core Auth Pages (Small initial bundle)
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { SetupPasswordPage } from '../features/auth/pages/SetupPasswordPage';

// Core Eager Shell Pages
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { AccessDeniedPage } from '../pages/AccessDeniedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

// Lazy-Loaded Feature Modules (Code-Splitting)
const CreditsPage = lazy(() => import('../features/credits/pages/CreditsPage').then(m => ({ default: m.CreditsPage })));
const BuyCreditsPage = lazy(() => import('../features/credits/pages/BuyCreditsPage').then(m => ({ default: m.BuyCreditsPage })));
const StorageBillingPage = lazy(() => import('../features/credits/pages/StorageBillingPage').then(m => ({ default: m.StorageBillingPage })));
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
const CertificateFontsPage = lazy(() => import('../features/certificates/pages/CertificateFontsPage').then(m => ({ default: m.CertificateFontsPage })));

const CouponListPage = lazy(() => import('../features/coupons/pages/CouponListPage').then(m => ({ default: m.CouponListPage })));
const CouponCreatePage = lazy(() => import('../features/coupons/pages/CouponCreatePage').then(m => ({ default: m.CouponCreatePage })));
const CouponEditPage = lazy(() => import('../features/coupons/pages/CouponEditPage').then(m => ({ default: m.CouponEditPage })));
const CouponDetailPage = lazy(() => import('../features/coupons/pages/CouponDetailPage').then(m => ({ default: m.CouponDetailPage })));

const DemoLeadsPage = lazy(() => import('../features/demo-leads/pages/DemoLeadsPage').then(m => ({ default: m.DemoLeadsPage })));
const LeadCreatePage = lazy(() => import('../features/demo-leads/pages/LeadCreatePage').then(m => ({ default: m.LeadCreatePage })));
const LeadDetailPage = lazy(() => import('../features/demo-leads/pages/LeadDetailPage').then(m => ({ default: m.LeadDetailPage })));
const LeadEditPage = lazy(() => import('../features/demo-leads/pages/LeadEditPage').then(m => ({ default: m.LeadEditPage })));

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
            <Route path="/setup-password" element={<SetupPasswordPage />} />
          </Route>
        </Route>

        {/* PROTECTED INSTRUCTOR APP ROUTES */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            {/* 1. Students Domain */}
            <Route path="/students" element={<ProtectedRoute requiredPermission="students.view"><StudentListPage /></ProtectedRoute>} />
            <Route path="/students/create" element={<ProtectedRoute requiredPermission="students.create"><StudentCreatePage /></ProtectedRoute>} />
            <Route path="/students/enroll" element={<ProtectedRoute requiredPermission="enrollments.create"><EnrollStudentPage /></ProtectedRoute>} />
            <Route path="/students/bulk-upload" element={<ProtectedRoute requiredPermission="students.create"><BulkUploadStudentsPage /></ProtectedRoute>} />
            <Route path="/students/reports" element={<ProtectedRoute requiredPermission="reports.view"><StudentReportsPage /></ProtectedRoute>} />
            <Route path="/students/:studentId" element={<ProtectedRoute requiredPermission="students.view"><StudentSinglePage /></ProtectedRoute>} />
            <Route path="/students/:studentId/edit" element={<ProtectedRoute requiredPermission="students.edit"><StudentEditPage /></ProtectedRoute>} />

            {/* 2. Course Management & Authoring */}
            <Route path="/courses" element={<ProtectedRoute requiredPermission="courses.view"><CourseListPage /></ProtectedRoute>} />
            <Route path="/courses/categories" element={<ProtectedRoute requiredPermission="courses.edit"><CourseCategoryManagerPage /></ProtectedRoute>} />
            <Route path="/courses/create" element={<ProtectedRoute requiredPermission="courses.create"><CourseCreateWizardPage /></ProtectedRoute>} />
            <Route path="/courses/:courseUuid/edit" element={<ProtectedRoute requiredPermission="courses.edit"><CourseCreateWizardPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/edit" element={<ProtectedRoute requiredPermission="courses.edit"><CourseCreateWizardPage /></ProtectedRoute>} />

            {/* Single Course Workspace */}
            <Route path="/courses/:courseId" element={<ProtectedRoute requiredPermission="courses.view"><CourseSingleViewLayout /></ProtectedRoute>}>
              <Route index element={<Navigate to="overview" replace />} />
              <Route path="overview" element={<CourseOverviewPage />} />
              <Route path="curriculum" element={<CourseFeatureGuard featureCode="LESSONS"><CourseCurriculumPage /></CourseFeatureGuard>} />
              <Route path="students" element={<CourseStudentsPage />} />
              <Route path="students/enroll" element={<ProtectedRoute requiredPermission="enrollments.create"><EnrollStudentPage /></ProtectedRoute>} />
              <Route path="students/bulk-upload" element={<ProtectedRoute requiredPermission="students.create"><BulkUploadStudentsPage /></ProtectedRoute>} />
              <Route path="students/:studentId" element={<StudentSinglePage />} />
              <Route path="students/:studentId/overview" element={<StudentSinglePage />} />
              <Route path="assignments" element={<CourseFeatureGuard featureCode="LESSONS"><CourseAssignmentsPage /></CourseFeatureGuard>} />
              <Route path="assignments/:assignmentUuid" element={<CourseFeatureGuard featureCode="LESSONS"><CourseAssignmentsPage /></CourseFeatureGuard>} />
              <Route path="assignments/:assignmentUuid/submissions/:submissionUuid" element={<CourseFeatureGuard featureCode="LESSONS"><CourseAssignmentsPage /></CourseFeatureGuard>} />
              <Route path="quizzes" element={<CourseFeatureGuard featureCode="LESSONS"><CourseQuizzesPage /></CourseFeatureGuard>} />
              <Route path="certificates" element={<CourseFeatureGuard featureCode="COMPLETION_CERTIFICATE"><CourseCertificatesPage /></CourseFeatureGuard>} />
              <Route path="discussions" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CourseDiscussionsPage /></CourseFeatureGuard>} />
              <Route path="discussions/community" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CourseDiscussionsPage /></CourseFeatureGuard>} />
              <Route path="discussions/community/:threadId" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CourseDiscussionsPage /></CourseFeatureGuard>} />
              <Route path="discussions/community-chat" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CommunityChatListPage /></CourseFeatureGuard>} />
              <Route path="discussions/community-chat/:courseId" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CommunityChatCoursePage /></CourseFeatureGuard>} />
              <Route path="discussions/personal" element={<CourseFeatureGuard featureCode="ONE_TO_ONE_SESSION"><PersonalChatListPage /></CourseFeatureGuard>} />
              <Route path="discussions/personal/:studentId" element={<CourseFeatureGuard featureCode="ONE_TO_ONE_SESSION"><PersonalChatStudentPage /></CourseFeatureGuard>} />
              <Route path="discussions/*" element={<CourseFeatureGuard featureCode="COURSE_DISCUSSION"><CourseDiscussionsPage /></CourseFeatureGuard>} />
              <Route path="announcements" element={<CourseFeatureGuard featureCode="COURSE_ANNOUNCEMENT"><CourseAnnouncementsPage /></CourseFeatureGuard>} />
              <Route path="announcements/*" element={<CourseFeatureGuard featureCode="COURSE_ANNOUNCEMENT"><CourseAnnouncementsPage /></CourseFeatureGuard>} />
              <Route path="live-sessions" element={<CourseFeatureGuard featureCode="LIVE_CLASS"><CourseLiveSessionsPage /></CourseFeatureGuard>} />
              <Route path="live-sessions/new" element={<CourseFeatureGuard featureCode="LIVE_CLASS"><CreateLiveSessionPage /></CourseFeatureGuard>} />
              <Route path="fees" element={<CourseFeatureGuard featureCode="FEE_COLLECTION"><CourseFeesPage /></CourseFeatureGuard>} />
              <Route path="coupons" element={<CouponListPage />} />
              <Route path="coupons/*" element={<CouponListPage />} />
              <Route path="features" element={<CourseFeaturesPage />} />
              <Route path="reports" element={<CourseReportsPage />} />
              <Route path="settings" element={<CourseSettingsPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>

            {/* Curriculum Authoring Canonical Sub-routes */}
            <Route path="/courses/:courseId/curriculum/modules/new" element={<ProtectedRoute requiredPermission="courses.edit"><ModuleCreatePage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/modules/:moduleId/edit" element={<ProtectedRoute requiredPermission="courses.edit"><ModuleEditPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/lessons/select-type" element={<ProtectedRoute requiredPermission="courses.edit"><LessonTypeSelectPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/lessons/new" element={<ProtectedRoute requiredPermission="courses.edit"><LessonCreatePage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/lessons/:lessonId/edit" element={<ProtectedRoute requiredPermission="courses.edit"><LessonEditPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/quizzes/new" element={<ProtectedRoute requiredPermission="courses.edit"><QuizBuilderPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/quizzes/:quizId/edit" element={<ProtectedRoute requiredPermission="courses.edit"><QuizBuilderPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/lessons/:lessonId/resources" element={<ProtectedRoute requiredPermission="courses.edit"><ResourcePickerPage /></ProtectedRoute>} />
            <Route path="/courses/:courseId/curriculum/resources/add" element={<ProtectedRoute requiredPermission="courses.edit"><ResourcePickerPage /></ProtectedRoute>} />

            {/* Legacy Curriculum Authoring Redirects */}
            <Route path="/courses/:courseId/modules/create" element={<ModuleCreatePage />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/create" element={<LegacyLessonCreateRedirect />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/edit" element={<LegacyLessonEditRedirect />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/:lessonId/resources" element={<ResourcePickerPage />} />
            <Route path="/courses/:courseId/modules/:moduleId/lessons/create/type" element={<LegacyLessonTypeRedirect />} />

            {/* 3. Certificate Builder 3-step canonical sub-routes */}
            <Route path="/certificates" element={<ProtectedRoute requiredPermission="certificates.view"><CertificateListPage /></ProtectedRoute>} />
            <Route path="/certificates/fonts" element={<ProtectedRoute requiredPermission="certificates.view"><CertificateFontsPage /></ProtectedRoute>} />
            <Route path="/certificates/new" element={<ProtectedRoute requiredPermission="certificates.create"><CertificateBuilderPage /></ProtectedRoute>} />
            <Route path="/certificates/:templateId/setup" element={<ProtectedRoute requiredPermission="certificates.edit"><CertificateBuilderPage /></ProtectedRoute>} />
            <Route path="/certificates/:templateId/fields" element={<ProtectedRoute requiredPermission="certificates.edit"><CertificateBuilderPage /></ProtectedRoute>} />
            <Route path="/certificates/:templateId/canvas" element={<ProtectedRoute requiredPermission="certificates.edit"><CertificateBuilderPage /></ProtectedRoute>} />
            <Route path="/certificates/:templateId/edit" element={<Navigate to="../canvas" replace />} />
            <Route path="/certificates/:id/issue" element={<ProtectedRoute requiredPermission="certificates.edit"><CertificateDetailPage /></ProtectedRoute>} />

            {/* 4. Coupons Management */}
            <Route path="/coupons" element={<ProtectedRoute requiredPermission="coupons.view"><CouponListPage /></ProtectedRoute>} />
            <Route path="/coupons/new" element={<ProtectedRoute requiredPermission="coupons.create"><CouponCreatePage /></ProtectedRoute>} />
            <Route path="/coupons/:couponId" element={<ProtectedRoute requiredPermission="coupons.view"><CouponDetailPage /></ProtectedRoute>} />
            <Route path="/coupons/:couponId/edit" element={<ProtectedRoute requiredPermission="coupons.edit"><CouponEditPage /></ProtectedRoute>} />

            {/* 5. Global Discussions & Chat */}
            <Route path="/discussions" element={<Navigate to="/discussions/personal" replace />} />
            <Route path="/discussions/community" element={<ProtectedRoute requiredPermission="discussions.view"><CommunityChatListPage /></ProtectedRoute>} />
            <Route path="/discussions/community/:courseId" element={<ProtectedRoute requiredPermission="discussions.view"><CommunityChatCoursePage /></ProtectedRoute>} />
            <Route path="/discussions/community-chat" element={<ProtectedRoute requiredPermission="discussions.view"><CommunityChatListPage /></ProtectedRoute>} />
            <Route path="/discussions/community-chat/:courseId" element={<ProtectedRoute requiredPermission="discussions.view"><CommunityChatCoursePage /></ProtectedRoute>} />
            <Route path="/discussions/personal" element={<ProtectedRoute requiredPermission="discussions.view"><PersonalChatListPage /></ProtectedRoute>} />
            <Route path="/discussions/personal/:studentId" element={<ProtectedRoute requiredPermission="discussions.view"><PersonalChatStudentPage /></ProtectedRoute>} />

            {/* 6. Live Classroom */}
            <Route path="/live-classroom" element={<ProtectedRoute requiredPermission="live_classes.view"><GlobalLiveClassroomPage /></ProtectedRoute>} />
            <Route path="/live-classroom/*" element={<ProtectedRoute requiredPermission="live_classes.view"><GlobalLiveClassroomPage /></ProtectedRoute>} />
            <Route path="/live-classroom/create" element={<ProtectedRoute requiredPermission="live_classes.create"><CreateLiveSessionPage /></ProtectedRoute>} />

            {/* 7. Demo Leads CRM */}
            <Route path="/demo-leads" element={<ProtectedRoute requiredPermission="demo_leads.view"><DemoLeadsPage /></ProtectedRoute>} />
            <Route path="/demo-leads/new" element={<ProtectedRoute requiredPermission="demo_leads.create"><LeadCreatePage /></ProtectedRoute>} />
            <Route path="/demo-leads/:leadId" element={<ProtectedRoute requiredPermission="demo_leads.view"><LeadDetailPage /></ProtectedRoute>} />
            <Route path="/demo-leads/:leadId/edit" element={<ProtectedRoute requiredPermission="demo_leads.edit"><LeadEditPage /></ProtectedRoute>} />

            {/* 8. Dual Payment Architecture */}
            <Route path="/payments" element={<ProtectedRoute requiredPermission="payments.view"><PaymentsOverviewPage /></ProtectedRoute>} />
            <Route path="/payments/overview" element={<ProtectedRoute requiredPermission="payments.view"><PaymentsOverviewPage /></ProtectedRoute>} />
            <Route path="/payments/transactions" element={<ProtectedRoute requiredPermission="payments.view"><TransactionsPage /></ProtectedRoute>} />
            <Route path="/payments/settlements" element={<ProtectedRoute requiredPermission="payments.view"><SettlementsPage /></ProtectedRoute>} />
            <Route path="/settings/payments" element={<ProtectedRoute requiredPermission="payments.manage"><PaymentSettingsPage /></ProtectedRoute>} />

            {/* 9. Credits Workspace */}
            <Route path="/credits" element={<ProtectedRoute requiredPermission="credits.view"><CreditsPage /></ProtectedRoute>} />
            <Route path="/credits/buy" element={<ProtectedRoute requiredPermission="credits.add"><BuyCreditsPage /></ProtectedRoute>} />
            <Route path="/credits/history" element={<ProtectedRoute requiredPermission="credits.view"><CreditsPage /></ProtectedRoute>} />
            <Route path="/credits/usage" element={<ProtectedRoute requiredPermission="credits.view"><CreditsPage /></ProtectedRoute>} />
            <Route path="/credits/storage" element={<ProtectedRoute requiredPermission="storage.view"><StorageBillingPage /></ProtectedRoute>} />
            <Route path="/storage/billing" element={<ProtectedRoute requiredPermission="storage.view"><StorageBillingPage /></ProtectedRoute>} />

            {/* 10. Global Fees */}
            <Route path="/fees" element={<ProtectedRoute requiredPermission="payments.view"><GlobalFeesPage /></ProtectedRoute>} />
            <Route path="/fees/*" element={<ProtectedRoute requiredPermission="payments.view"><GlobalFeesPage /></ProtectedRoute>} />

            {/* 11. Media Library */}
            <Route path="/media" element={<ProtectedRoute requiredPermission="media.view"><MediaPage /></ProtectedRoute>} />
            <Route path="/media/*" element={<ProtectedRoute requiredPermission="media.view"><MediaPage /></ProtectedRoute>} />

            {/* 12. Staff Directory & Roles */}
            <Route path="/staff" element={<ProtectedRoute requiredPermission="staff.view"><StaffDirectoryPage /></ProtectedRoute>} />
            <Route path="/staff/create" element={<ProtectedRoute requiredPermission="staff.create"><StaffCreatePage /></ProtectedRoute>} />
            <Route path="/staff/:staffId/edit" element={<ProtectedRoute requiredPermission="staff.edit"><StaffEditPage /></ProtectedRoute>} />
            <Route path="/staff/*" element={<ProtectedRoute requiredPermission="staff.view"><StaffDirectoryPage /></ProtectedRoute>} />
            <Route path="/roles" element={<ProtectedRoute requiredPermission="roles.view"><RolesPage /></ProtectedRoute>} />
            <Route path="/roles/create" element={<ProtectedRoute requiredPermission="roles.create"><RoleCreatePage /></ProtectedRoute>} />

            {/* 13. Website Builder */}
            <Route path="/website-builder" element={<ProtectedRoute requiredPermission="websites.view"><WebsiteBuilderPage /></ProtectedRoute>} />
            <Route path="/website-builder/landing" element={<ProtectedRoute requiredPermission="websites.view"><WebsiteBuilderLandingPage /></ProtectedRoute>} />
            <Route path="/website-builder/branding" element={<ProtectedRoute requiredPermission="websites.update"><StudentPortalBrandingPage /></ProtectedRoute>} />
            <Route path="/website-builder/public" element={<ProtectedRoute requiredPermission="websites.view"><PublicSiteBuilderPage /></ProtectedRoute>} />

            {/* 15. Quizzes & Assessments */}
            <Route path="/quizzes/builder" element={<ProtectedRoute requiredPermission="courses.edit"><QuizBuilderPage /></ProtectedRoute>} />
            <Route path="/quizzes/:quizId" element={<ProtectedRoute requiredPermission="courses.edit"><QuizBuilderPage /></ProtectedRoute>} />

            {/* 16. Settings */}
            <Route path="/settings" element={<ProtectedRoute requiredPermission="settings.view"><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/general" element={<ProtectedRoute requiredPermission="settings.view"><SettingsPage /></ProtectedRoute>} />
            <Route path="/settings/fonts" element={<ProtectedRoute requiredPermission="settings.edit"><CertificateFontsPage /></ProtectedRoute>} />

            {/* 17. Support Desk */}
            <Route path="/support" element={<ProtectedRoute requiredPermission="support.view"><SupportPage /></ProtectedRoute>} />
            <Route path="/support/*" element={<ProtectedRoute requiredPermission="support.view"><SupportPage /></ProtectedRoute>} />

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
