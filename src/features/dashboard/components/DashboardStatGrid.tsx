import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CheckCircle2,
  Users,
  UserCheck,
  DollarSign,
  Coins,
  HardDrive,
  Award,
  Sparkles,
  Video,
  GraduationCap,
  TrendingUp,
  ChevronRight,
} from "lucide-react";
import type { BackendDashboardAnalytics } from "../types/analytics.types";
import { useAuthStore } from "../../../store/auth.store";

interface DashboardStatGridProps {
  analytics: BackendDashboardAnalytics | null;
}

export const DashboardStatGrid: React.FC<DashboardStatGridProps> = ({ analytics }) => {
  const { can, hasFeature } = useAuthStore();

  if (!analytics) return null;

  // Format revenue dictionary (e.g. { INR: "15000.00", USD: "200.00" })
  const formatRevenueDisplay = (revenueDict?: Record<string, string>): string => {
    if (!revenueDict || Object.keys(revenueDict).length === 0) return "0.00";
    const entries = Object.entries(revenueDict);
    return entries.map(([curr, amt]) => `${curr} ${Number(amt).toLocaleString()}`).join(" / ");
  };

  const allCards = [
    {
      title: "Total Students",
      value: (analytics.total_students ?? 0).toLocaleString(),
      subtitle: `${analytics.active_students ?? 0} active learners`,
      icon: Users,
      color: "text-sky-500",
      bgColor: "bg-sky-500/10",
      borderColor: "border-sky-500/20",
      permission: "students.view",
    },
    {
      title: "Active Students",
      value: (analytics.active_students ?? 0).toLocaleString(),
      subtitle: "Currently enrolled & active",
      icon: UserCheck,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      permission: "students.view",
    },
    {
      title: "Total Courses",
      value: (analytics.total_courses ?? 0).toLocaleString(),
      subtitle: `${analytics.published_courses ?? 0} Published`,
      icon: BookOpen,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      feature: "courses",
      permission: "courses.view",
    },
    {
      title: "Published Courses",
      value: (analytics.published_courses ?? 0).toLocaleString(),
      subtitle: "Active in catalog",
      icon: CheckCircle2,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      feature: "courses",
      permission: "courses.view",
    },
    {
      title: "Active Enrollments",
      value: (analytics.active_enrollments ?? 0).toLocaleString(),
      subtitle: "Ongoing enrollments",
      icon: GraduationCap,
      color: "text-indigo-500",
      bgColor: "bg-indigo-500/10",
      borderColor: "border-indigo-500/20",
      permission: "students.view",
    },
    {
      title: "Course Completions",
      value: (analytics.course_completions ?? 0).toLocaleString(),
      subtitle: "Learners completed",
      icon: CheckCircle2,
      color: "text-teal-500",
      bgColor: "bg-teal-500/10",
      borderColor: "border-teal-500/20",
      permission: "courses.view",
    },
    {
      title: "Total Revenue",
      value: formatRevenueDisplay(analytics.revenue_by_currency),
      subtitle: "Completed orders",
      icon: DollarSign,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
      feature: "payments",
      permission: "payments.view",
    },
    {
      title: "Credits Remaining",
      value: Number(analytics.credit_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      subtitle: "Available credits",
      icon: Coins,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
      feature: "credits",
    },
    {
      title: "Storage Used",
      value: analytics.storage_gb ?? "0.00 GB",
      subtitle: "Media files & assets",
      icon: HardDrive,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
      feature: "media",
    },
    {
      title: "Certificates Issued",
      value: (analytics.certificates_issued ?? 0).toLocaleString(),
      subtitle: "Issued to learners",
      icon: Award,
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      borderColor: "border-pink-500/20",
      feature: "certificates",
      permission: "certificates.view",
    },
    {
      title: "Total Leads",
      value: (analytics.total_leads ?? 0).toLocaleString(),
      subtitle: `${analytics.converted_leads ?? 0} converted (${analytics.lead_conversion_rate ?? "0.00%"})`,
      icon: Sparkles,
      color: "text-amber-500",
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/20",
      feature: "demo_leads",
    },
    {
      title: "Upcoming Live Sessions",
      value: (analytics.upcoming_live_sessions ?? 0).toLocaleString(),
      subtitle: "Scheduled broadcasts",
      icon: Video,
      color: "text-rose-500",
      bgColor: "bg-rose-500/10",
      borderColor: "border-rose-500/20",
      feature: "live_classes",
      permission: "live_classes.view",
    },
  ];

  const visibleCards = allCards.filter((card) => {
    if (card.feature && !hasFeature(card.feature)) return false;
    if (card.permission && !can(card.permission)) return false;
    return true;
  });

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 text-left">
      {visibleCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.015 }}
            className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-3.5 sm:p-4 shadow-xs flex flex-col justify-between h-full min-h-[110px] sm:min-h-[125px] group min-w-0 transition-all hover:border-[var(--brand-primary)]/40"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div
                  className={`w-8 h-8 rounded-xl ${card.bgColor} ${card.color} border ${card.borderColor} flex items-center justify-center shrink-0`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                  <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                  <span>Live</span>
                </span>
              </div>

              <p className="text-xs font-semibold text-[var(--text-secondary)] mb-0.5 truncate">
                {card.title}
              </p>
              <h3 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight truncate min-w-0">
                {card.value}
              </h3>
            </div>

            <div className="mt-2 pt-2 border-t border-[var(--border)] flex items-center justify-between text-[11px] font-medium text-[var(--text-muted)] min-w-0">
              <span className="truncate">{card.subtitle}</span>
              <ChevronRight className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--brand-primary)] transition-colors shrink-0" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

