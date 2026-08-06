import React from 'react';
import {
  Layers,
  CheckCircle2,
  Video,
  Image as ImageIcon,
  FileText,
  FileCheck,
  Folder,
  ArrowRight,
  Info,
  Clock,
  HardDrive,
  Music,
  History,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';

export interface MediaCreditUsageCardProps {
  provider?: string;
  connectionStatus?: string;
  totalUploadedDataGB?: number;
  creditsUsedThisMonth?: number;
  estimatedCurrentMonthCredits?: number;
  previousMonthCredits?: number;
  filesUploadedThisMonth?: number;
  credentialExpiry?: string;
  lastSyncTime?: string;
  categoryBreakdown?: {
    videoCredits: number;
    imageCredits: number;
    documentCredits: number;
    assignmentCredits: number;
    audioCredits: number;
  };
}

export const MediaCreditUsageCard: React.FC<MediaCreditUsageCardProps> = ({
  provider = 'Bunny Storage (S3 API)',
  connectionStatus = 'Connected & Active',
  totalUploadedDataGB = 14.8,
  creditsUsedThisMonth = 1280,
  estimatedCurrentMonthCredits = 1450,
  previousMonthCredits = 1110,
  filesUploadedThisMonth = 48,
  credentialExpiry = 'Valid (Key expires in 240 days)',
  lastSyncTime = 'Synced 5 mins ago',
  categoryBreakdown = {
    videoCredits: 820,
    imageCredits: 120,
    documentCredits: 190,
    assignmentCredits: 150,
    audioCredits: 90,
  },
}) => {
  const totalBreakdownCredits =
    categoryBreakdown.videoCredits +
    categoryBreakdown.imageCredits +
    categoryBreakdown.documentCredits +
    categoryBreakdown.assignmentCredits +
    categoryBreakdown.audioCredits;

  const categories = [
    {
      name: 'Video uploads',
      credits: categoryBreakdown.videoCredits,
      color: 'bg-purple-600',
      textColor: 'text-purple-600',
      icon: Video,
      percent: Math.round((categoryBreakdown.videoCredits / totalBreakdownCredits) * 100),
    },
    {
      name: 'Documents',
      credits: categoryBreakdown.documentCredits,
      color: 'bg-amber-500',
      textColor: 'text-amber-600',
      icon: FileText,
      percent: Math.round((categoryBreakdown.documentCredits / totalBreakdownCredits) * 100),
    },
    {
      name: 'Assignment files',
      credits: categoryBreakdown.assignmentCredits,
      color: 'bg-indigo-600',
      textColor: 'text-indigo-600',
      icon: FileCheck,
      percent: Math.round((categoryBreakdown.assignmentCredits / totalBreakdownCredits) * 100),
    },
    {
      name: 'Images',
      credits: categoryBreakdown.imageCredits,
      color: 'bg-emerald-500',
      textColor: 'text-emerald-600',
      icon: ImageIcon,
      percent: Math.round((categoryBreakdown.imageCredits / totalBreakdownCredits) * 100),
    },
    {
      name: 'Audio uploads',
      credits: categoryBreakdown.audioCredits,
      color: 'bg-sky-500',
      textColor: 'text-sky-600',
      icon: Music,
      percent: Math.round((categoryBreakdown.audioCredits / totalBreakdownCredits) * 100),
    },
  ];

  return (
    <Card className="space-y-5 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">Media Credit Usage</h3>
            <p className="text-xs text-slate-500">Usage-based media billing & deduction details</p>
          </div>
        </div>
        <Badge variant="success" dot size="md">
          {connectionStatus}
        </Badge>
      </div>

      {/* Hero Metric Banner */}
      <div className="p-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl text-white space-y-2 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-200 uppercase tracking-wider">
            Media Credits Used
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-[10px] font-bold">
            Usage-Based Billing
          </span>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-white tracking-tight">
            {creditsUsedThisMonth.toLocaleString()}
          </span>
          <span className="text-sm font-semibold text-blue-200">Credits Used</span>
        </div>
        <p className="text-xs text-blue-100 font-medium">
          You used {creditsUsedThisMonth.toLocaleString()} credits for media uploads this month.
        </p>
      </div>

      {/* Category Breakdown (This Month) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-900">Deduction Breakdown (This Month)</span>
          <span className="text-slate-500 font-medium">{filesUploadedThisMonth} Files uploaded</span>
        </div>

        {/* Visual Category Distribution Bar */}
        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`h-full ${cat.color} transition-all duration-300`}
              style={{ width: `${cat.percent}%` }}
              title={`${cat.name}: ${cat.credits} credits (${cat.percent}%)`}
            />
          ))}
        </div>

        {/* Detailed Items List */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs"
            >
              <div className="flex items-center gap-2">
                <cat.icon className={`w-3.5 h-3.5 ${cat.textColor}`} />
                <span className="font-semibold text-slate-700">{cat.name}:</span>
              </div>
              <span className="font-extrabold text-slate-900">{cat.credits} credits</span>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly & Storage Overview Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 block font-medium">Total Media Size</span>
          <strong className="text-slate-900 text-sm font-extrabold block mt-0.5">
            {totalUploadedDataGB} GB
          </strong>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 block font-medium">Files This Month</span>
          <strong className="text-slate-900 text-sm font-extrabold block mt-0.5">
            {filesUploadedThisMonth} Files
          </strong>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 block font-medium">Est. Current Month</span>
          <strong className="text-slate-900 text-sm font-extrabold block mt-0.5">
            ~{estimatedCurrentMonthCredits} Cr
          </strong>
        </div>
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
          <span className="text-[11px] text-slate-500 block font-medium">Previous Month</span>
          <strong className="text-slate-900 text-sm font-extrabold block mt-0.5">
            {previousMonthCredits} Cr
          </strong>
        </div>
      </div>

      {/* Connected Provider Info */}
      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-slate-900">Storage Provider:</span>
            <span className="text-slate-700 font-semibold">{provider}</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Active
          </span>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-slate-500 text-[11px] pt-1 border-t border-slate-200/50">
          <span>Total Uploaded Data: <strong className="text-slate-800">{totalUploadedDataGB} GB</strong></span>
          <span>{credentialExpiry}</span>
          <span className="flex items-center gap-1 text-slate-400">
            <Clock className="w-3 h-3" /> {lastSyncTime}
          </span>
        </div>
      </div>

      {/* Mandatory Business Rule Note */}
      <div className="p-3.5 bg-blue-50/80 border border-blue-200/80 rounded-2xl flex items-start gap-2.5 text-xs text-blue-950 leading-relaxed shadow-xs">
        <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
        <p className="font-medium">
          Media usage is billed through credits based on actual usage. CubixSkill does not provide fixed storage packages.
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-2">
          <Link to="/media">
            <Button size="sm" variant="outline" leftIcon={<Folder className="w-3.5 h-3.5" />}>
              Manage Media
            </Button>
          </Link>
          <Link to="/credits">
            <Button size="sm" variant="ghost" leftIcon={<History className="w-3.5 h-3.5" />}>
              View Credit History
            </Button>
          </Link>
        </div>
        <Link to="/media" className="text-blue-600 font-bold hover:underline flex items-center gap-1">
          View Media Usage <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </Card>
  );
};

// Backwards-compatible export
export const StorageUsageCard = MediaCreditUsageCard;
