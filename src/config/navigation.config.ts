import {
  LayoutDashboard,
  BookOpen,
  Users,
  Award,
  CreditCard,
  Layers,
  MessageSquare,
  Video,
  Settings,
  HelpCircle as SupportIcon,
  Globe,
  UserCheck,
  ShieldAlert,
  Sparkles,
  IndianRupee,
  Wallet,
  Building2,
  Ticket,
  BarChart2,
  type LucideIcon,
} from "lucide-react";
import type { UserRole } from "../features/auth/types/auth.types";
import { authStore } from "../store/auth.store";

export interface NavItemConfig {
  label: string;
  href: string;
  icon: LucideIcon;
  requiredFeature?: string;
  requiredPermission?: string | string[];
  allowedRoles?: (UserRole | string)[];
  children?: NavItemConfig[];
}

export interface NavSectionConfig {
  group: string;
  items: NavItemConfig[];
}

export const navigationConfig: NavSectionConfig[] = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      {
        label: "Courses",
        href: "/courses",
        icon: BookOpen,
        requiredFeature: "courses",
        requiredPermission: "courses.view",
      },
      {
        label: "Students",
        href: "/students",
        icon: Users,
        requiredPermission: "students.view",
      },
      {
        label: "Demo Leads",
        href: "/demo-leads",
        icon: Sparkles,
        requiredFeature: "demo_leads",
      },
    ],
  },
  {
    group: "Teaching & Content",
    items: [
      {
        label: "Certificates",
        href: "/certificates",
        icon: Award,
        requiredFeature: "certificates",
        requiredPermission: "certificates.view",
      },
      {
        label: "Discussions",
        href: "/discussions",
        icon: MessageSquare,
        requiredFeature: "discussions",
        requiredPermission: "discussions.view",
      },
      {
        label: "Live Classroom",
        href: "/live-classroom",
        icon: Video,
        requiredFeature: "live_classes",
        requiredPermission: "live_classes.view",
      },
      {
        label: "Media Library",
        href: "/media",
        icon: Layers,
        requiredFeature: "media",
      },
    ],
  },
  {
    group: "Credits & Finance",
    items: [
      {
        label: "Payments",
        href: "/payments",
        icon: Wallet,
        requiredFeature: "payments",
        requiredPermission: "payments.view",
        children: [
          { label: "Overview", href: "/payments", icon: LayoutDashboard },
          { label: "Transactions", href: "/payments/transactions", icon: CreditCard },
          { label: "Settlements", href: "/payments/settlements", icon: Building2 },
          { label: "Settings", href: "/settings/payments", icon: Settings },
        ],
      },
      {
        label: "Fees Collection",
        href: "/fees",
        icon: IndianRupee,
        requiredFeature: "payments",
        requiredPermission: "payments.view",
      },
      {
        label: "Credits & Wallet",
        href: "/credits",
        icon: CreditCard,
        requiredFeature: "credits",
      },
      {
        label: "Coupons & Discounts",
        href: "/coupons",
        icon: Ticket,
        requiredFeature: "coupons",
      },
    ],
  },
  {
    group: "Academy & Team",
    items: [
      {
        label: "Website Builder",
        href: "/website-builder",
        icon: Globe,
        requiredFeature: "website_builder",
      },
      {
        label: "Staff Directory",
        href: "/staff",
        icon: UserCheck,
        requiredFeature: "staff_management",
        requiredPermission: "staff.view",
      },
      {
        label: "Roles & Access",
        href: "/roles",
        icon: ShieldAlert,
        allowedRoles: ["ACADEMY_ADMIN", "SUPER_ADMIN"],
      },
    ],
  },
  {
    group: "System & Help",
    items: [
      { label: "Reports", href: "/reports", icon: BarChart2 },
      { label: "Support Desk", href: "/support", icon: SupportIcon },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function getFilteredNavigation(): NavSectionConfig[] {
  return navigationConfig
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => {
        if (item.requiredFeature && !authStore.hasFeature(item.requiredFeature)) {
          return false;
        }
        if (item.allowedRoles && !authStore.hasRole(item.allowedRoles)) {
          return false;
        }
        if (item.requiredPermission) {
          if (Array.isArray(item.requiredPermission)) {
            if (!authStore.canAny(item.requiredPermission)) return false;
          } else {
            if (!authStore.can(item.requiredPermission)) return false;
          }
        }
        return true;
      }),
    }))
    .filter((section) => section.items.length > 0);
}
