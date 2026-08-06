import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Download, ShieldCheck, FileCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CertificateStats } from '../types/dashboard.types';

interface CertificateWidgetProps {
  stats: CertificateStats;
}

export const CertificateWidget: React.FC<CertificateWidgetProps> = ({ stats }) => {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-2xs text-left transition-all">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
            Certificates Hub
          </h3>
          <p className="text-xs font-medium text-[#64748B]">
            Automated certificate issuance & QR verification metrics
          </p>
        </div>
        <Link
          to="/courses"
          className="text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] hover:underline cursor-pointer"
        >
          Manage Templates
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="p-2 rounded-lg bg-[#EFF6FF] text-[#2563EB] w-fit mb-2">
            <FileCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-[#64748B]">Active Templates</p>
          <p className="text-lg font-black text-[#0F172A] mt-0.5">{stats.templates}</p>
        </div>

        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="p-2 rounded-lg bg-[#F0FDF4] text-[#16A34A] w-fit mb-2">
            <Award className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-[#64748B]">Total Issued</p>
          <p className="text-lg font-black text-[#0F172A] mt-0.5">{stats.issued}</p>
        </div>

        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="p-2 rounded-lg bg-[#E0F2FE] text-[#0EA5E9] w-fit mb-2">
            <Download className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-[#64748B]">Downloaded</p>
          <p className="text-lg font-black text-[#0F172A] mt-0.5">{stats.downloaded}</p>
        </div>

        <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
          <div className="p-2 rounded-lg bg-[#F3E8FF] text-[#8B5CF6] w-fit mb-2">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <p className="text-[11px] font-semibold text-[#64748B]">QR Verified</p>
          <p className="text-lg font-black text-[#0F172A] mt-0.5">{stats.verified}</p>
        </div>
      </div>
    </div>
  );
};
