# Responsive UI changes and page inventory

Mobile form fields use 16px text to avoid focus zoom on iOS. Flexible children can shrink without forcing the whole page wider. Shared overlays render at the document body, retain scroll locks across nested dialogs, trap keyboard focus, close on Escape, and restore the opener focus.

The instructor bottom navigation includes the device safe area in its height. The compact header stays active until 1280px. Course lists, category cards, course features, overview cards, credit purchases and storage cards use later column breakpoints to account for the desktop sidebar. Form header actions wrap. Student report actions stack on small screens. Table cards wrap long values; pagination has larger mobile controls and accessible names.

Validation: production Vite build passed. Overlay DOM interaction checks passed for nested locks, Escape, Tab/Shift+Tab and focus restoration. Focused overlay ESLint checks passed. TypeScript baseline and modified source both report the same 247 diagnostics; there are no new diagnostics. The existing lockfile fails npm ci due to missing ajv/json-schema-traverse entries; dependencies were installed locally without changing the lockfile.

Browser visual validation is pending: this environment has no browser binary, and the Chromium download returned an invalid archive. Builds and DOM checks do not establish pixel layout correctness. Before merging, check 320px, 390px, 768px, 1024px and 1440px widths with long names, populated and empty lists, loading/error states, open dialogs, keyboard navigation, iOS safe areas and mobile keyboards. Certificate canvases, media controls, checkout, chat and live classroom require real browser checks with representative data.

Mobile follow-up: viewport-fit=cover enables safe-area insets on supported phones; small shared buttons keep a 44px mobile height. Compact inputs, checkbox labels and view controls have larger mobile targets. The enrollment footer renders outside the animated page container, stacks its actions below 360px and stays above bottom navigation. Tablet enrollment actions remain in the page summary. Both production builds passed after this follow-up. Browser visual verification remains pending.

## Page inventory

All pages below receive the shared CSS foundations. “Page adjustment” identifies files directly changed in this PR. Other pages keep their existing page layout; listing them is not a claim of completed browser testing.

| Page source | Coverage |
| --- | --- |
| `src/features/announcements/pages/GlobalAnnouncementsPage.tsx` | Shared foundations; existing page layout |
| `src/features/assignments/pages/AssignmentSinglePage.tsx` | Shared foundations; existing page layout |
| `src/features/assignments/pages/AssignmentsPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/ForgotPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/LoginPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/ResetPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/auth/pages/SetupPasswordPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/CertificateBuilderPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/CertificateDetailPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/CertificateFontsPage.tsx` | Shared foundations; existing page layout |
| `src/features/certificates/pages/CertificateListPage.tsx` | Shared foundations; existing page layout |
| `src/features/coupons/pages/CouponCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/coupons/pages/CouponDetailPage.tsx` | Shared foundations; existing page layout |
| `src/features/coupons/pages/CouponEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/coupons/pages/CouponListPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseAnnouncementsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseAssignmentsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseCategoryManagerPage.tsx` | Page adjustment + shared foundations |
| `src/features/courses/pages/CourseCertificatesPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseCreateWizardPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseCurriculumPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseDiscussionsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseFeaturesPage.tsx` | Page adjustment + shared foundations |
| `src/features/courses/pages/CourseListPage.tsx` | Page adjustment + shared foundations |
| `src/features/courses/pages/CourseLiveSessionsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseOverviewPage.tsx` | Page adjustment + shared foundations |
| `src/features/courses/pages/CourseQuizzesPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseReportsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseSettingsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/CourseStudentsPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/LessonCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/LessonEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/LessonTypeSelectPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/ModuleCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/ModuleEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/courses/pages/ResourcePickerPage.tsx` | Shared foundations; existing page layout |
| `src/features/credits/pages/BuyCreditsPage.tsx` | Page adjustment + shared foundations |
| `src/features/credits/pages/CreditsPage.tsx` | Shared foundations; existing page layout |
| `src/features/credits/pages/StorageBillingPage.tsx` | Page adjustment + shared foundations |
| `src/features/dashboard/pages/DashboardPage.tsx` | Shared foundations; existing page layout |
| `src/features/demo-leads/pages/DemoLeadsPage.tsx` | Shared foundations; existing page layout |
| `src/features/demo-leads/pages/LeadCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/demo-leads/pages/LeadDetailPage.tsx` | Shared foundations; existing page layout |
| `src/features/demo-leads/pages/LeadEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/discussions/pages/CommunityChatCoursePage.tsx` | Shared foundations; existing page layout |
| `src/features/discussions/pages/CommunityChatListPage.tsx` | Shared foundations; existing page layout |
| `src/features/discussions/pages/PersonalChatListPage.tsx` | Shared foundations; existing page layout |
| `src/features/discussions/pages/PersonalChatStudentPage.tsx` | Shared foundations; existing page layout |
| `src/features/fees/pages/CourseFeesPage.tsx` | Shared foundations; existing page layout |
| `src/features/fees/pages/GlobalFeesPage.tsx` | Shared foundations; existing page layout |
| `src/features/live-sessions/pages/CreateLiveSessionPage.tsx` | Shared foundations; existing page layout |
| `src/features/live-sessions/pages/GlobalLiveClassroomPage.tsx` | Shared foundations; existing page layout |
| `src/features/media/pages/MediaPage.tsx` | Shared foundations; existing page layout |
| `src/features/payments/pages/PaymentSettingsPage.tsx` | Shared foundations; existing page layout |
| `src/features/payments/pages/PaymentsOverviewPage.tsx` | Shared foundations; existing page layout |
| `src/features/payments/pages/SettlementsPage.tsx` | Shared foundations; existing page layout |
| `src/features/payments/pages/TransactionsPage.tsx` | Shared foundations; existing page layout |
| `src/features/quizzes/pages/QuizBuilderPage.tsx` | Shared foundations; existing page layout |
| `src/features/settings/pages/SettingsPage.tsx` | Shared foundations; existing page layout |
| `src/features/staff/pages/RoleCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/staff/pages/RolesPage.tsx` | Shared foundations; existing page layout |
| `src/features/staff/pages/StaffCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/staff/pages/StaffDirectoryPage.tsx` | Shared foundations; existing page layout |
| `src/features/staff/pages/StaffEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/students/pages/BulkUploadStudentsPage.tsx` | Shared foundations; existing page layout |
| `src/features/students/pages/EnrollStudentPage.tsx` | Page adjustment + shared foundations |
| `src/features/students/pages/StudentCreatePage.tsx` | Shared foundations; existing page layout |
| `src/features/students/pages/StudentEditPage.tsx` | Shared foundations; existing page layout |
| `src/features/students/pages/StudentListPage.tsx` | Shared foundations; existing page layout |
| `src/features/students/pages/StudentReportsPage.tsx` | Page adjustment + shared foundations |
| `src/features/students/pages/StudentSinglePage.tsx` | Shared foundations; existing page layout |
| `src/features/support/pages/SupportPage.tsx` | Shared foundations; existing page layout |
| `src/features/website-builder/pages/PublicSiteBuilderPage.tsx` | Shared foundations; existing page layout |
| `src/features/website-builder/pages/StudentPortalBrandingPage.tsx` | Shared foundations; existing page layout |
| `src/features/website-builder/pages/WebsiteBuilderLandingPage.tsx` | Shared foundations; existing page layout |
| `src/features/website-builder/pages/WebsiteBuilderPage.tsx` | Shared foundations; existing page layout |
| `src/pages/AccessDeniedPage.tsx` | Shared foundations; existing page layout |
| `src/pages/NotFoundPage.tsx` | Shared foundations; existing page layout |
