import React from 'react';
import { Star } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseRatingProps {
  rating: number;
  reviewCount?: number;
  compact?: boolean;
  showNumeric?: boolean;
  className?: string;
}

export const CourseRating: React.FC<CourseRatingProps> = ({
  rating,
  reviewCount,
  compact = false,
  showNumeric = true,
  className = '',
}) => {
  const safeRating = Math.min(Math.max(rating || 0, 0), 5);
  const fullStars = Math.floor(safeRating);
  const hasHalfStar = safeRating % 1 >= 0.5;

  // Mobile / Compact Display: Single Star Icon + Numeric Value
  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1 text-[12px] font-semibold text-[#0F172A] ${className}`}
        aria-label={`Rated ${safeRating.toFixed(1)} out of 5 stars`}
      >
        <Star className="w-3.5 h-3.5 fill-[#2563EB] text-[#2563EB] shrink-0" aria-hidden="true" />
        <span>{safeRating.toFixed(1)}</span>
        {reviewCount !== undefined && (
          <span className="text-[11px] font-normal text-[#64748B]">({reviewCount})</span>
        )}
      </div>
    );
  }

  // Full Display (Desktop): 5 Animated Blue Stars + Numeric Value
  return (
    <div
      className={`inline-flex items-center gap-1.5 text-[12px] font-semibold text-[#0F172A] ${className}`}
      aria-label={`Rated ${safeRating.toFixed(1)} out of 5 stars`}
    >
      {showNumeric && <span className="font-semibold text-[#2563EB]">{safeRating.toFixed(1)}</span>}

      <div className="flex items-center gap-0.5" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((starIndex) => {
          const isFilled = starIndex <= fullStars;
          const isHalf = !isFilled && starIndex === fullStars + 1 && hasHalfStar;

          return (
            <motion.div
              key={starIndex}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, delay: starIndex * 0.03 }}
              whileHover={{ scale: 1.15 }}
            >
              <Star
                className={`w-3.5 h-3.5 transition-colors ${
                  isFilled
                    ? 'fill-[#2563EB] text-[#2563EB]'
                    : isHalf
                    ? 'fill-[#2563EB]/40 text-[#2563EB]'
                    : 'fill-transparent text-[#CBD5E1]'
                }`}
              />
            </motion.div>
          );
        })}
      </div>

      {reviewCount !== undefined && (
        <span className="text-[11px] font-normal text-[#64748B]">({reviewCount})</span>
      )}
    </div>
  );
};
