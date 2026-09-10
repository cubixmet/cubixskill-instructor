import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowLeft } from "lucide-react";
import { cn } from "../../lib/cn";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
  side?: "left" | "right";
  size?: "sm" | "md" | "lg";
  noPadding?: boolean;
}

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  side = "right",
  size = "md",
  noPadding = false,
}) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Responsive Drawer Width Classes
  const sizeClasses = {
    sm: "w-full max-w-full sm:max-w-[440px]",
    md: "w-full max-w-full sm:max-w-[520px]",
    lg: "w-full max-w-full sm:max-w-[560px]",
    full: "w-full max-w-full",
  };

  const variants = {
    hidden: side === "right" ? { x: "100%" } : { x: "-100%" },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-[#0F172A]/60 backdrop-blur-xs"
          />

          <div
            className={cn(
              "fixed inset-y-0 flex max-w-full w-full sm:w-auto h-full h-[100dvh]",
              side === "right" ? "right-0" : "left-0"
            )}
          >
            <motion.div
              variants={variants}
              initial="hidden"
              animate="visible"
              exit="hidden"
              transition={{ type: "spring", damping: 25, stiffness: 220, duration: 0.25 }}
              className={cn(
                "w-full max-w-full bg-white dark:bg-[#0B1120] text-slate-900 dark:text-slate-50 shadow-2xl flex flex-col border-slate-200/80 dark:border-[#1E293B] text-left h-full h-[100dvh] max-h-[100dvh] overflow-hidden",
                side === "right" ? "border-l" : "border-r",
                sizeClasses[size]
              )}
            >
              {/* Drawer Header */}
              {title && (
                <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b border-slate-200/80 dark:border-[#1E293B] bg-white dark:bg-[#0B1120] shrink-0 min-h-[56px]">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <button
                      type="button"
                      onClick={onClose}
                      className="p-2 -ml-1.5 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] flex items-center justify-center"
                      aria-label="Close drawer"
                    >
                      <ArrowLeft className="w-5 h-5 sm:hidden" />
                      <X className="w-5 h-5 hidden sm:block" />
                    </button>
                    <div className="min-w-0">
                      {title && <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50 truncate leading-tight">{title}</h3>}
                      {subtitle && <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 truncate">{subtitle}</p>}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={onClose}
                    className="hidden sm:flex p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-white/10 transition-colors cursor-pointer shrink-0 min-w-[44px] min-h-[44px] items-center justify-center"
                    aria-label="Close drawer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}

              {/* Drawer Body */}
              <div
                className={cn(
                  "flex-1 min-h-0 overflow-y-auto no-scrollbar flex flex-col w-full",
                  !noPadding && "p-4 sm:p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))]"
                )}
              >
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

