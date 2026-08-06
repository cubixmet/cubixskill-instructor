import React from "react";
import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "../../lib/cn";

export interface CardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  padding?: "none" | "sm" | "md" | "lg";
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hoverable = false,
  bordered = true,
  padding = "md",
  ...props
}) => {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-6",
    lg: "p-8",
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -2, boxShadow: "0 10px 30px -10px rgba(0,0,0,0.08)" } : undefined}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className={cn(
        "bg-white rounded-2xl transition-all duration-200 text-left",
        bordered && "border border-slate-200/80 shadow-xs",
        paddingClasses[padding],
        hoverable && "cursor-pointer hover:border-slate-300",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
