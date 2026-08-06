import React from "react";

export const SkeletonDashboard: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse text-left max-w-7xl mx-auto pb-12">
      {/* Alert Skeleton */}
      <div className="h-16 bg-[#E2E8F0]/70 rounded-2xl" />

      {/* Header Banner Skeleton */}
      <div className="h-28 bg-[#E2E8F0]/80 rounded-2xl" />

      {/* Quick Actions Skeleton */}
      <div className="h-36 bg-[#E2E8F0]/60 rounded-2xl" />

      {/* 12 Stat Cards Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
          <div key={i} className="h-36 bg-[#E2E8F0]/60 rounded-2xl" />
        ))}
      </div>

      {/* Analytics Charts Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-96 bg-[#E2E8F0]/60 rounded-2xl" />
        <div className="h-96 bg-[#E2E8F0]/60 rounded-2xl" />
      </div>

      {/* Table & Pending Items Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="h-80 bg-[#E2E8F0]/60 rounded-2xl" />
        <div className="h-80 bg-[#E2E8F0]/60 rounded-2xl" />
      </div>
    </div>
  );
};
