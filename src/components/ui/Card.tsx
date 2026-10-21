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
    md: "p-4 sm:p-5 lg:p-6",
    lg: "p-5 sm:p-6 lg:p-8",
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : undefined}
      transition={{ duration: 0.16, ease: "easeOut" }}
      className={cn(
        "bg-[var(--surface)] text-[var(--text-primary)] rounded-[var(--radius-lg)] transition-[transform,border-color,box-shadow,background-color] duration-200 text-left",
        bordered && "border border-[var(--border)] shadow-[var(--shadow-card)]",
        paddingClasses[padding],
        hoverable && "cursor-pointer hover:border-[var(--primary-border)] hover:shadow-[var(--shadow-elevated)]",
        className
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
};
