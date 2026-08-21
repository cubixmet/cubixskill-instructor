import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  Check,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { useParams, Link, NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { Skeleton } from "../../../components/ui/Skeleton";
import { coursesService } from "../../../services/courses.service";
import { COURSE_NAV_SECTIONS } from "../config/courseNavigation.config";
import type { CourseDetail } from "../types/course.types";
import { SharedCourseHeader } from "../components/SharedCourseHeader";
import { useCourseFeatures } from "../../../hooks/useCourseFeatures";

export const CourseSingleViewLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseUuid } = useParams<{ courseUuid: string }>();
  const { isFeatureEnabled } = useCourseFeatures(courseUuid);

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isActionBusy, setIsActionBusy] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const mobileTabNavRef = useRef<HTMLDivElement>(null);
  const activeMobileTabRef = useRef<HTMLAnchorElement>(null);

  const fetchCourseDetail = useCallback(async () => {
    if (!courseUuid) return;
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(null);

    try {
      const data = await coursesService.getCourse(courseUuid);
      setCourse(data);
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err?.message || "Failed to load course details from server.");
    } finally {
      setIsLoading(false);
    }
  }, [courseUuid]);

  useEffect(() => {
    fetchCourseDetail();
  }, [fetchCourseDetail]);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const handleConfirmDelete = async () => {
    if (!courseUuid) return;
    setIsActionBusy(true);
    try {
      await coursesService.deleteCourse(courseUuid);
      setIsDeleteModalOpen(false);
      showToast("Course deleted successfully.");
      navigate("/courses");
    } catch (err: any) {
      showToast(err?.response?.data?.message || "Failed to delete course.");
    } finally {
      setIsActionBusy(false);
    }
  };

  // Detect current active tab from pathname
  const pathParts = location.pathname.split("/");
  const currentRoute = pathParts[pathParts.length - 1] || "overview";

  if (isLoading) {
    return (
      <div className="p-6 space-y-4 max-w-7xl mx-auto text-left">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-96 w-full rounded-2xl" />
      </div>
    );
  }

  if (isError || !course) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-rose-200 space-y-4 max-w-lg mx-auto mt-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
        <div>
          <h3 className="text-base font-bold text-slate-900">Course Not Found</h3>
          <p className="text-xs text-slate-500">{errorMessage || "The requested course could not be loaded."}</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchCourseDetail} leftIcon={<RefreshCw className="w-4 h-4" />}>
          Retry API
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="w-full max-w-[1600px] mx-auto px-3 sm:px-6 lg:px-8 py-3 sm:py-6 space-y-4 text-left font-sans pb-[calc(96px+env(safe-area-inset-bottom))] no-scrollbar"
    >
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* 1. REUSABLE SHARED COURSE HEADER */}
      <SharedCourseHeader course={course} />

      {/* 2. TABS NAVIGATION */}
      <div className="hidden md:block sticky top-0 z-20">
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-1.5 h-13 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full">
            {COURSE_NAV_SECTIONS.filter((sec) => !sec.requiredFeature || isFeatureEnabled(sec.requiredFeature)).map((sec) => {
              const Icon = sec.icon;
              const isActive = currentRoute === sec.route;

              return (
                <NavLink
                  key={sec.id}
                  to={`/courses/${course.id}/${sec.route}`}
                  className={`h-10 px-4 rounded-xl flex items-center gap-2 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                    isActive
                      ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                      : "text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033]"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-[#94A3B8]"}`} />
                  <span>{sec.label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      {/* 3. MOBILE TABS */}
      <div
        ref={mobileTabNavRef}
        className="md:hidden sticky top-0 z-30 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-1.5 shadow-2xs overflow-x-auto no-scrollbar touch-pan-x w-full max-w-full min-w-0"
      >
        <div className="flex items-center gap-1.5 flex-nowrap w-max px-1">
          {COURSE_NAV_SECTIONS.filter((sec) => !sec.requiredFeature || isFeatureEnabled(sec.requiredFeature)).map((sec) => {
            const Icon = sec.icon;
            const isActive = currentRoute === sec.route;

            return (
              <NavLink
                key={sec.id}
                ref={isActive ? activeMobileTabRef : undefined}
                to={`/courses/${course.id}/${sec.route}`}
                className={`h-10 px-3.5 rounded-xl flex items-center gap-1.5 text-xs font-medium transition-all cursor-pointer whitespace-nowrap shrink-0 flex-none ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-xs font-semibold"
                    : "text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033]"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 shrink-0 ${isActive ? "text-white" : "text-slate-500 dark:text-[#94A3B8]"}`} />
                <span>{sec.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* 4. ACTIVE SUB-ROUTE OUTLET */}
      <div className="min-h-[500px]">
        <Outlet context={{ course, fetchCourseDetail }} />
      </div>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Course?">
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-[#64748B]">
            Are you sure you want to delete <strong className="text-[#0F172A]">{course.title}</strong>?
          </p>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" size="sm" onClick={() => setIsDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" disabled={isActionBusy} onClick={handleConfirmDelete} className="bg-rose-600 hover:bg-rose-700 text-white font-semibold">
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
};

