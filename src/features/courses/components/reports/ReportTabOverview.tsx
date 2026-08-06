import React from 'react';
import { TrendingUp, Users, Award, BookOpen, Clock, Activity, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../../components/ui/Card';

export interface ReportTabOverviewProps {
  metrics: any;
}

export const ReportTabOverview: React.FC<ReportTabOverviewProps> = ({ metrics }) => {
  const weeklyEngagement = [
    { day: 'Mon', active: 310, completed: 85 },
    { day: 'Tue', active: 380, completed: 110 },
    { day: 'Wed', active: 415, completed: 140 },
    { day: 'Thu', active: 395, completed: 125 },
    { day: 'Fri', active: 360, completed: 95 },
    { day: 'Sat', active: 290, completed: 70 },
    { day: 'Sun', active: 340, completed: 105 },
  ];

  const recentTimeline = [
    { title: 'Aarav Sharma completed Module 3 Quiz', time: '10 minutes ago', type: 'quiz' },
    { title: 'Priya Patel submitted Assignment 2', time: '45 minutes ago', type: 'assignment' },
    { title: 'Dr. Vikramaditya Rao published Announcement', time: '2 hours ago', type: 'announcement' },
    { title: 'Kavita Sundaram joined Live Q&A Session', time: '5 hours ago', type: 'live' },
    { title: 'Rohan Mehta was issued Certificate of Completion', time: '1 day ago', type: 'certificate' },
  ];

  return (
    <div className="space-y-4 font-sans text-left">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Weekly Engagement Chart Simulation (8 cols) */}
        <Card padding="md" className="lg:col-span-8 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-blue-600" /> Weekly Learning &amp; Engagement Activity
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Daily active students &amp; lesson completions</p>
            </div>
            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              +18.4% vs last week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-2 pt-4 border-t border-slate-100">
            {weeklyEngagement.map((item) => (
              <div key={item.day} className="flex flex-col items-center space-y-2 text-center">
                <div className="w-full bg-slate-100 rounded-t-lg h-32 flex flex-col justify-end p-1 relative group">
                  <div
                    style={{ height: `${(item.active / 420) * 100}%` }}
                    className="w-full bg-blue-600 rounded-t transition-all group-hover:bg-blue-700"
                  />
                </div>
                <span className="text-[11px] font-extrabold text-slate-700">{item.day}</span>
                <span className="text-[9px] font-medium text-slate-400">{item.active} active</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Course Completion Telemetry (4 cols) */}
        <Card padding="md" className="lg:col-span-4 bg-white border border-slate-200/90 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Syllabus Completion Funnel
            </h3>
            <p className="text-[11px] text-slate-500 font-medium">Cohort progress distribution</p>
          </div>

          <div className="space-y-3 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Module 1 (Foundations)</span>
                <span className="text-blue-600">96%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[96%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Module 2 (API Architecture)</span>
                <span className="text-blue-600">82%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[82%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Module 3 (State Synchronization)</span>
                <span className="text-blue-600">68%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[68%]" />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-slate-700">Module 4 (Production Capstone)</span>
                <span className="text-blue-600">42%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 rounded-full w-[42%]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Activity Timeline Stream */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs space-y-3">
        <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" /> Live Course Activity Timeline
        </h3>

        <div className="space-y-2">
          {recentTimeline.map((item, i) => (
            <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs">
              <div className="flex items-center gap-2.5">
                <div className="w-2 h-2 rounded-full bg-blue-600" />
                <span className="font-bold text-slate-900">{item.title}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-medium">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
