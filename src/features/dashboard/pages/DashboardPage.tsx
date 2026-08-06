import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
import { CreditWidget } from '../components/CreditWidget';
import { CertificateWidget } from '../components/CertificateWidget';
import { AssignmentQuizWidget } from '../components/AssignmentQuizWidget';
import { AnnouncementsWidget } from '../components/AnnouncementsWidget';
import { RecentTransactionsWidget } from '../components/RecentTransactionsWidget';
import { NotificationCenterWidget } from '../components/NotificationCenterWidget';
import { DashboardAlerts } from '../components/DashboardAlerts';

// Common UI Modals & Shared Elements
import { BuyCreditsModal } from '../../../components/common/BuyCreditsModal';
import { CreditCalculatorModal } from '../../../components/common/CreditCalculatorModal';
import { SkeletonDashboard } from '../../../components/ui/SkeletonDashboard';
import { ErrorState } from '../../../components/ui/ErrorState';

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
    notifications,
    recentActivities,
    pendingItems,
    alerts,
  } = data;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16 text-left overflow-x-hidden">
      {/* 1. Critical System Alerts */}
      <DashboardAlerts alerts={alerts as any} />

      {/* 2. Enterprise Header & Welcome Banner */}
      <DashboardGreeting
        welcome={welcome}
        onOpenBuyCredits={() => setBuyCreditsOpen(true)}
      />

      {/* 3. Available Credit Engine Banner */}
      <CreditWidget
        availableCredits={stats.availableCredits}
        usedThisMonth={stats.usedCreditsThisMonth}
        estimatedRemaining={stats.estimatedUpcomingCredits}
        onOpenBuyCredits={() => setBuyCreditsOpen(true)}
        onOpenCalculator={() => setCalculatorOpen(true)}
      />

      {/* 4. Quick Actions Grid */}
      <QuickActions onOpenBuyCredits={() => setBuyCreditsOpen(true)} />

      {/* 5. 12 Professional Summary Statistics Cards */}
      <DashboardStatGrid stats={stats} />

      {/* 6. Revenue Analytics & Student Retention */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueOverview data={revenueTrendData} />
        <EnrollmentOverview data={studentGrowthData as any} />
      </div>

      {/* 7. Course Performance & Pending Items Queue */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CoursePerformance courses={coursePerformance} />
        <PendingItemsWidget items={pendingItems} />
      </div>

      {/* 8. Storage Analytics & Certificates Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <StorageWidget
          usedGB={stats.storageUsedGB}
          totalGB={stats.storageTotalGB}
          breakdown={storageBreakdown}
        />
        <CertificateWidget stats={certificateStats} />
      </div>

      {/* 9. Assignment & Quiz Evaluation Widgets */}
      <AssignmentQuizWidget
        assignmentStats={assignmentStats}
        quizStats={quizStats}
      />

      {/* 10. Real-time Activity Timeline & Announcements */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentActivityTimeline activities={recentActivities} />
        <AnnouncementsWidget announcements={announcements} />
      </div>

      {/* 11. Credit Transactions & Notification Center */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentTransactionsWidget transactions={recentTransactions} />
        <NotificationCenterWidget notifications={notifications} />
      </div>

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
