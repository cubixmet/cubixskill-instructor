import React from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { HardDrive, Video, FileAudio, FileText, Image as ImageIcon, FileCode, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { StorageBreakdownItem } from '../types/dashboard.types';

interface StorageWidgetProps {
  usedGB: number;
  totalGB: number;
  breakdown: StorageBreakdownItem[];
}

export const StorageWidget: React.FC<StorageWidgetProps> = ({
  usedGB,
  totalGB,
  breakdown,
}) => {
  const percentageUsed = Math.round((usedGB / totalGB) * 100);

  const getIcon = (type: StorageBreakdownItem['type']) => {
    switch (type) {
      case 'Video': return <Video className="w-4 h-4 text-[#2563EB]" />;
      case 'Audio': return <FileAudio className="w-4 h-4 text-[#0EA5E9]" />;
      case 'PDF': return <FileText className="w-4 h-4 text-[#F59E0B]" />;
      case 'Images': return <ImageIcon className="w-4 h-4 text-[#10B981]" />;
      default: return <FileCode className="w-4 h-4 text-[#8B5CF6]" />;
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Storage Engine Analytics
            </h3>
            <span className="bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE] text-[10px] font-extrabold px-2 py-0.5 rounded-full">
              {usedGB} GB / {totalGB} GB
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Cloud storage consumption split across course media types
          </p>
        </div>

        <Link
          to="/credits"
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] flex items-center gap-1 hover:underline cursor-pointer"
        >
          <span>Upgrade Limit</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5 mb-5">
        <div className="flex items-center justify-between text-xs font-bold">
          <span className="text-[#0F172A]">{percentageUsed}% Capacity Consumed</span>
          <span className="text-[#64748B]">{(totalGB - usedGB).toFixed(1)} GB Available</span>
        </div>
        <div className="w-full h-3 bg-[#E2E8F0] rounded-full overflow-hidden flex">
          {breakdown.map((item) => (
            <div
              key={item.type}
              style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
              className="h-full transition-all"
              title={`${item.type}: ${item.sizeGB} GB`}
            />
          ))}
        </div>
      </div>

      {/* Media Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {breakdown.map((item) => (
          <div
            key={item.type}
            className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl flex items-center gap-3"
          >
            <div className="p-2 rounded-lg bg-white border border-[#E2E8F0] shadow-2xs">
              {getIcon(item.type)}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#64748B]">{item.type}</p>
              <p className="text-xs font-extrabold text-[#0F172A]">
                {item.sizeGB} GB <span className="text-[10px] font-normal text-[#94A3B8]">({item.fileCount} files)</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
