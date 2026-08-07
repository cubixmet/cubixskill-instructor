import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import type { RevenueDataPoint } from '../types/dashboard.types';

interface RevenueOverviewProps {
  data: RevenueDataPoint[];
}

export const RevenueOverview: React.FC<RevenueOverviewProps> = ({ data }) => {
  const [filterPeriod, setFilterPeriod] = useState<'7D' | '30D' | '90D' | '1Y' | 'Custom'>('30D');
  const [metricType, setMetricType] = useState<'revenue' | 'sales' | 'students' | 'credits'>('revenue');

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      {/* Widget Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Revenue & Performance Analytics
            </h3>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16A34A] bg-[#F0FDF4] px-2 py-0.5 rounded-full border border-[#BBF7D0]">
              <TrendingUp className="w-3 h-3" /> +24.8%
            </span>
          </div>
          <p className="text-xs font-medium text-[#64748B] mt-0.5">
            Monitor earnings, student enrollments, course sales, and credit consumption trends
          </p>
        </div>

        {/* Time Filters */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#F8FAFC] border border-[#E2E8F0] p-1 rounded-xl shrink-0">
          {(['7D', '30D', '90D', '1Y', 'Custom'] as const).map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setFilterPeriod(period)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                filterPeriod === period
                  ? 'bg-[#2563EB] text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              {period === '7D' ? '7 Days' : period === '30D' ? '30 Days' : period === '90D' ? '90 Days' : period === '1Y' ? '1 Year' : 'Custom'}
            </button>
          ))}
        </div>
      </div>

      {/* Metric Switcher Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { key: 'revenue', label: 'Total Revenue', value: '$174,000', color: 'text-[#2563EB]' },
          { key: 'sales', label: 'Course Sales', value: '1,196 Orders', color: 'text-[#0EA5E9]' },
          { key: 'students', label: 'Student Growth', value: '4,880 Enrolled', color: 'text-[#16A34A]' },
          { key: 'credits', label: 'Credits Usage', value: '1,620 Used', color: 'text-[#8B5CF6]' },
        ].map((m) => (
          <button
            key={m.key}
            type="button"
            onClick={() => setMetricType(m.key as 'revenue' | 'sales' | 'students' | 'credits')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              metricType === m.key
                ? 'bg-[#EFF6FF] border-[#2563EB] ring-2 ring-[#2563EB]/10'
                : 'bg-[#F8FAFC] border-[#E2E8F0] hover:bg-[#F1F5F9]'
            }`}
          >
            <p className="text-[11px] font-semibold text-[#64748B]">{m.label}</p>
            <p className={`text-base font-extrabold ${m.color} mt-0.5`}>{m.value}</p>
          </button>
        ))}
      </div>

      {/* Main Responsive Chart */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#2563EB" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#2563EB" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
            <XAxis dataKey="date" tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0F172A',
                border: 'none',
                borderRadius: '12px',
                color: '#FFFFFF',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Area
              type="monotone"
              dataKey={metricType === 'revenue' ? 'revenue' : metricType === 'sales' ? 'sales' : metricType === 'students' ? 'students' : 'creditsUsed'}
              stroke="#2563EB"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
