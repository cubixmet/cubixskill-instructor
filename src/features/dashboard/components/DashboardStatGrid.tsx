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
  ArrowUpRight,
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
      color: "text-[#0EA5E9]",
      bgColor: "bg-[#E0F2FE]",
      borderColor: "border-[#BAE6FD]",
      permission: "students.view",
    },
    {
      title: "Active Students",
      value: (analytics.active_students ?? 0).toLocaleString(),
      subtitle: "Currently enrolled & active",
      icon: UserCheck,
      color: "text-[#0D9488]",
      bgColor: "bg-[#CCFBF1]",
      borderColor: "border-[#99F6E4]",
      permission: "students.view",
    },
    {
      title: "Total Courses",
      value: (analytics.total_courses ?? 0).toLocaleString(),
      subtitle: `${analytics.published_courses ?? 0} Published`,
      icon: BookOpen,
      color: "text-[#2563EB]",
      bgColor: "bg-[#EFF6FF]",
      borderColor: "border-[#BFDBFE]",
      feature: "courses",
      permission: "courses.view",
    },
    {
      title: "Published Courses",
      value: (analytics.published_courses ?? 0).toLocaleString(),
      subtitle: "Active in catalog",
      icon: CheckCircle2,
      color: "text-[#16A34A]",
      bgColor: "bg-[#F0FDF4]",
      borderColor: "border-[#BBF7D0]",
      feature: "courses",
      permission: "courses.view",
    },
    {
      title: "Active Enrollments",
      value: (analytics.active_enrollments ?? 0).toLocaleString(),
      subtitle: "Ongoing course enrollments",
      icon: GraduationCap,
      color: "text-[#6366F1]",
      bgColor: "bg-[#EEF2FF]",
      borderColor: "border-[#C7D2FE]",
      permission: "students.view",
    },
    {
      title: "Course Completions",
      value: (analytics.course_completions ?? 0).toLocaleString(),
      subtitle: "Learners completed courses",
      icon: CheckCircle2,
      color: "text-[#059669]",
      bgColor: "bg-[#ECFDF5]",
      borderColor: "border-[#A7F3D0]",
      permission: "courses.view",
    },
    {
      title: "Total Revenue",
      value: formatRevenueDisplay(analytics.revenue_by_currency),
      subtitle: "Completed purchase orders",
      icon: DollarSign,
      color: "text-[#16A34A]",
      bgColor: "bg-[#F0FDF4]",
      borderColor: "border-[#BBF7D0]",
      feature: "payments",
      permission: "payments.view",
    },
    {
      title: "Credits Remaining",
      value: Number(analytics.credit_balance ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2 }),
      subtitle: "Available Academy wallet credits",
      icon: Coins,
      color: "text-[#2563EB]",
      bgColor: "bg-[#EFF6FF]",
      borderColor: "border-[#BFDBFE]",
      feature: "credits",
    },
    {
      title: "Storage Used",
      value: analytics.storage_gb ?? "0.00 GB",
      subtitle: "Active media files & assets",
      icon: HardDrive,
      color: "text-[#8B5CF6]",
      bgColor: "bg-[#F3E8FF]",
      borderColor: "border-[#DDD6FE]",
      feature: "media",
    },
    {
      title: "Certificates Issued",
      value: (analytics.certificates_issued ?? 0).toLocaleString(),
      subtitle: "Issued to eligible learners",
      icon: Award,
      color: "text-[#EC4899]",
      bgColor: "bg-[#FCE7F3]",
      borderColor: "border-[#FBCFE8]",
      feature: "certificates",
      permission: "certificates.view",
    },
    {
      title: "Total Leads",
      value: (analytics.total_leads ?? 0).toLocaleString(),
      subtitle: `${analytics.converted_leads ?? 0} Converted (${analytics.lead_conversion_rate ?? "0.00%"})`,
      icon: Sparkles,
      color: "text-[#D97706]",
      bgColor: "bg-[#FEF3C7]",
      borderColor: "border-[#FDE68A]",
      feature: "demo_leads",
    },
    {
      title: "Upcoming Live Sessions",
      value: (analytics.upcoming_live_sessions ?? 0).toLocaleString(),
      subtitle: "Scheduled classroom broadcasts",
      icon: Video,
      color: "text-[#DC2626]",
      bgColor: "bg-[#FEF2F2]",
      borderColor: "border-[#FCA5A5]",
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
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 text-left">
      {visibleCards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, delay: idx * 0.02 }}
            whileHover={{ y: -2 }}
            className="bg-white border border-slate-200 text-slate-900 dark:bg-[#111827] dark:border-[#263244] dark:text-white rounded-[12px] p-3 sm:p-4 shadow-[0_1px_2px_rgba(15,23,42,0.03),0_4px_12px_rgba(15,23,42,0.04)] dark:shadow-[0_4px_14px_rgba(37,99,235,0.06)] transition-all flex flex-col justify-between h-full min-h-[145px] sm:min-h-[160px] group min-w-0"
          >
            <div>
              <div className="flex items-center justify-between gap-1 mb-2">
                <div
                  className={`p-1.5 sm:p-2 rounded-xl ${card.bgColor} dark:bg-[#172033] ${card.color} border ${card.borderColor} dark:border-[#263244] transition-transform group-hover:scale-105 shrink-0`}
                >
                  <IconComponent className="w-4 h-4" />
                </div>
                <span className="inline-flex items-center gap-0.5 text-[9px] sm:text-[10px] font-bold text-[#16A34A] dark:text-emerald-400 bg-[#F0FDF4] dark:bg-emerald-950/50 border border-[#BBF7D0] dark:border-emerald-800 px-1.5 py-0.5 rounded-full shrink-0 max-w-full truncate">
                  <TrendingUp className="w-2.5 h-2.5 shrink-0" />
                  <span className="truncate">Live Data</span>
                </span>
              </div>

              <p className="text-[11px] sm:text-xs font-medium text-[#2563EB] dark:text-[#93C5FD] mb-1 leading-snug line-clamp-2">
                {card.title}
              </p>
              <h3 className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors truncate min-w-0">
                {card.value}
              </h3>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#263244] flex items-center justify-between text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-slate-400 min-w-0">
              <span className="truncate">{card.subtitle}</span>
              <ArrowUpRight className="w-3 h-3 text-slate-400 group-hover:text-[#2563EB] dark:group-hover:text-[#60A5FA] transition-colors shrink-0" />
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

