import React, { useState } from 'react';
import { useDashboardData } from '../hooks/useDashboardData';

// Component Suite Imports
import { DashboardGreeting } from '../components/DashboardGreeting';
import { DashboardStatGrid } from '../components/DashboardStatGrid';
import { QuickActions } from '../components/QuickActions';
import { RevenueOverview } from '../components/RevenueOverview';
import { EnrollmentOverview } from '../components/EnrollmentOverview';
import { CoursePerformance } from '../components/CoursePerformance';
import { PendingItemsWidget } from '../components/PendingItemsWidget';
import { RecentActivityTimeline } from '../components/RecentActivityTimeline';
import { StorageWidget } from '../components/StorageWidget';
import { CertificateWidget } from '../components/CertificateWidget';
import { AssignmentQuizWidget } from '../components/AssignmentQuizWidget';
import { AnnouncementsWidget } from '../components/AnnouncementsWidget';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { DashboardAlerts } from '../components/DashboardAlerts';
import { DashboardPermissionGuard } from '../components/DashboardPermissionGuard';

// Shared Modals
import { BuyCreditsModal } from '../../../components/common/BuyCreditsModal';
import { CreditCalculatorModal } from '../../../components/common/CreditCalculatorModal';
import { SkeletonDashboard } from '../../../components/ui/SkeletonDashboard';

export const DashboardPage: React.FC = () => {
  const data = useDashboardData();
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  if (!data) {
    return <SkeletonDashboard />;
  }

  const {
    welcome,
    stats,
    coursePerformance,
    revenueTrendData,
    studentGrowthData,
    storageBreakdown,
    certificateStats,
    assignmentStats,
    quizStats,
    announcements,
    recentTransactions,
    recentActivities,
    pendingItems,
    alerts,
  } = data;

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-16 text-left overflow-x-hidden">
      {/* 1. Critical System Alerts */}
      <DashboardAlerts alerts={alerts} />

      {/* 2. Enterprise Header & Welcome Banner */}
      <DashboardGreeting
        welcome={welcome}
        onOpenBuyCredits={() => setBuyCreditsOpen(true)}
      />

      {/* 3. Quick Actions Grid */}
      <QuickActions onOpenBuyCredits={() => setBuyCreditsOpen(true)} />

      {/* 4. Compact Mobile 2-Column / Desktop 4-Column Summary Statistics Cards */}
      <DashboardStatGrid stats={stats} />

      {/* 5. Revenue Analytics & Student Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <DashboardPermissionGuard permission="revenue">
          <RevenueOverview data={revenueTrendData} />
        </DashboardPermissionGuard>
        <DashboardPermissionGuard permission="students">
          <EnrollmentOverview data={studentGrowthData} />
        </DashboardPermissionGuard>
      </div>

      {/* 6. Course Performance & Pending Items Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <CoursePerformance courses={coursePerformance} />
        <PendingItemsWidget items={pendingItems} />
      </div>

      {/* 7. Storage Analytics & Certificates Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <StorageWidget
          usedGB={stats.storageUsedGB}
          totalGB={stats.storageTotalGB}
          breakdown={storageBreakdown}
        />
        <CertificateWidget stats={certificateStats} />
      </div>

      {/* 8. Assignment & Quiz Evaluation Widgets */}
      <AssignmentQuizWidget
        assignmentStats={assignmentStats}
        quizStats={quizStats}
      />

      {/* 9. Real-time Activity Timeline & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <RecentActivityTimeline activities={recentActivities} />
        <AnnouncementsWidget announcements={announcements} />
      </div>

      {/* 10. Financial Transactions (Permission Guarded) */}
      <DashboardPermissionGuard permission="revenue">
        <RecentTransactionsWidget transactions={recentTransactions} />
      </DashboardPermissionGuard>

      {/* Shared Modals */}
      <BuyCreditsModal
        isOpen={buyCreditsOpen}
        onClose={() => setBuyCreditsOpen(false)}
      />
      <CreditCalculatorModal
        isOpen={calculatorOpen}
        onClose={() => setCalculatorOpen(false)}
      />
    </div>
  );
};
