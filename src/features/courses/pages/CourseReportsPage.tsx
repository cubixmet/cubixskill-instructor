import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  BarChart3,
  Download,
  Users,
  FileCheck,
  HelpCircle,
  Award,
  Video,
  Megaphone,
  MessageSquare,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';

import { useCourseReportsData } from '../hooks/useCourseReportsData';
import { ReportSummaryCards } from '../components/reports/ReportSummaryCards';
import { ReportTabOverview } from '../components/reports/ReportTabOverview';
import { ReportTabStudents } from '../components/reports/ReportTabStudents';
import { ReportTabModuleSpecific } from '../components/reports/ReportTabModuleSpecific';
import { ReportExportModal } from '../components/reports/ReportExportModal';
import { GenerateReportModal } from '../components/reports/GenerateReportModal';

import { normalizeCourseId } from '../../../utils/courseValidation.utils';

export const CourseReportsPage: React.FC = () => {
  const params = useParams<{ courseId?: string; courseUuid?: string }>();
  const courseUuid = normalizeCourseId(params.courseId || params.courseUuid);

  const {
    courseObj,
    courseFeatures,
    metrics,
    courseAnnouncements,
    courseLiveSessions,
    students,
  } = useCourseReportsData(courseUuid);

  const [activeTab, setActiveTab] = useState('overview');
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  // Tab definitions with Feature-based visibility filter
  const visibleTabs = useMemo(() => {
    const allTabs = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'students', label: 'Students Progress', icon: Users },
      { id: 'assignments', label: 'Assignments', icon: FileCheck, featureKey: 'assignments' },
      { id: 'quizzes', label: 'Quizzes', icon: HelpCircle, featureKey: 'quizzes' },
      { id: 'certificates', label: 'Certificates', icon: Award, featureKey: 'courseCertificates' },
      { id: 'live-sessions', label: 'Live Sessions', icon: Video, featureKey: 'liveSessions' },
      { id: 'announcements', label: 'Announcements', icon: Megaphone, featureKey: 'courseAnnouncements' },
      { id: 'discussions', label: 'Discussions', icon: MessageSquare, featureKey: 'courseDiscussion' },
      { id: 'credits', label: 'Credits', icon: CreditCard },
      { id: 'revenue', label: 'Revenue', icon: DollarSign },
    ];

    return allTabs.filter((tab) => {
      if (!tab.featureKey) return true;
      return (courseFeatures as unknown as Record<string, boolean>)[tab.featureKey] !== false;
    });
  }, [courseFeatures]);

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">
                {courseObj.title} - Analytics &amp; Reports
              </h1>
              <Badge variant="info" size="sm" className="font-bold">
                Live Data Center
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Analyze student performance, engagement, completion rates, revenue, and syllabus activity.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExportOpen(true)}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<Download className="w-4 h-4 text-blue-600" />}
            >
              Export Reports
            </Button>

            <Button
              size="sm"
              onClick={() => setIsGenerateOpen(true)}
              className="h-9 bg-[#2563EB] text-white font-extrabold text-xs px-4 hover:bg-blue-700"
              leftIcon={<BarChart3 className="w-4 h-4" />}
            >
              Generate Report
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. SUMMARY CARDS */}
      <ReportSummaryCards metrics={metrics} />

      {/* 3. REPORT TAB BAR */}
      <div className="bg-white border border-slate-200/90 p-1.5 rounded-2xl shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar font-sans text-xs">
        {visibleTabs.map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-2 rounded-xl font-bold flex items-center gap-1.5 transition-all shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 4. TAB CONTENT */}
      {activeTab === 'overview' && <ReportTabOverview metrics={metrics} />}
      {activeTab === 'students' && <ReportTabStudents students={students} />}
      {activeTab !== 'overview' && activeTab !== 'students' && (
        <ReportTabModuleSpecific
          tab={activeTab}
          metrics={metrics}
          courseAnnouncements={courseAnnouncements}
          courseLiveSessions={courseLiveSessions}
        />
      )}

      {/* EXPORT & GENERATOR MODALS */}
      <ReportExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        activeTab={activeTab}
      />

      <GenerateReportModal
        isOpen={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
      />
    </div>
  );
};
