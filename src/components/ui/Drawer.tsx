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

  // Desktop Drawer Width 480px - 560px
  const sizeClasses = {
    sm: "max-w-[440px]",
    md: "max-w-[520px]",
    lg: "max-w-[560px]",
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
              "fixed inset-y-0 flex max-w-full w-full sm:w-auto",
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
                "w-screen bg-white shadow-2xl flex flex-col border-l border-[#E2E8F0] text-left h-full",
                sizeClasses[size]
              )}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-[#E2E8F0] bg-white shrink-0">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={onClose}
                    className="sm:hidden p-1.5 -ml-1.5 rounded-lg text-[#0F172A] hover:bg-slate-100"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    {title && <h3 className="text-[18px] font-semibold text-[#0F172A]">{title}</h3>}
                    {subtitle && <p className="text-[13px] text-[#64748B] font-normal mt-0.5">{subtitle}</p>}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="hidden sm:flex p-2 rounded-xl text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Body */}
              <div className={cn("flex-1 overflow-y-auto no-scrollbar pb-[calc(24px+env(safe-area-inset-bottom))]", !noPadding && "p-5 sm:p-6")}>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
