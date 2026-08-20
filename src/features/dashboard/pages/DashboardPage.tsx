import React, { useState } from "react";
import { useDashboardData } from "../hooks/useDashboardData";
import { AlertTriangle, RefreshCw } from "lucide-react";

// Component Suite Imports
import { DashboardGreeting } from "../components/DashboardGreeting";
import { DashboardStatGrid } from "../components/DashboardStatGrid";
import { QuickActions } from "../components/QuickActions";
import { RevenueOverview } from "../components/RevenueOverview";
import { CoursePerformance } from "../components/CoursePerformance";
import { PermissionGuard, FeatureGuard } from "../../../components/auth/access-control";

// Shared Modals & Skeletons
import { BuyCreditsModal } from "../../../components/common/BuyCreditsModal";
import { CreditCalculatorModal } from "../../../components/common/CreditCalculatorModal";
import { SkeletonDashboard } from "../../../components/ui/SkeletonDashboard";
import { Button } from "../../../components/ui/Button";

export const DashboardPage: React.FC = () => {
  const {
    isLoading,
    isError,
    errorMessage,
    welcome,
    dashboardAnalytics,
    courseAnalytics,
    revenueAnalytics,
    refetch,
  } = useDashboardData();

  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  if (isLoading) {
    return <SkeletonDashboard />;
  }

  if (isError) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-[#FFFFFF] dark:bg-[#111827] rounded-[14px] border border-[#E2E8F0] dark:border-[#263244] p-8 space-y-4 shadow-xs">
          <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 rounded-2xl flex items-center justify-center mx-auto border border-rose-100 dark:border-rose-900/50">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Failed to Load Dashboard</h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">{errorMessage || "An unexpected error occurred while fetching analytics."}</p>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={refetch}
            leftIcon={<RefreshCw className="w-4 h-4" />}
            className="w-full"
          >
            Retry Loading
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-7xl mx-auto pb-16 text-left overflow-x-hidden">
      {/* 1. Enterprise Header & Welcome Banner */}
      {welcome && (
        <DashboardGreeting
          welcome={welcome}
          onOpenBuyCredits={() => setBuyCreditsOpen(true)}
        />
      )}

      {/* 2. Quick Actions Grid */}
      <QuickActions onOpenBuyCredits={() => setBuyCreditsOpen(true)} />

      {/* 3. Summary Statistics Grid (Feature & Permission Filtered) */}
      <DashboardStatGrid analytics={dashboardAnalytics} />

      {/* 4. Revenue & Course Performance Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <FeatureGuard feature="payments">
          <PermissionGuard permission="payments.view">
            <RevenueOverview analytics={revenueAnalytics} />
          </PermissionGuard>
        </FeatureGuard>

        <FeatureGuard feature="courses">
          <PermissionGuard permission="courses.view">
            <CoursePerformance courses={courseAnalytics} />
          </PermissionGuard>
        </FeatureGuard>
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
