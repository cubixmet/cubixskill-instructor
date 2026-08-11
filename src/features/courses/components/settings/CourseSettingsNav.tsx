import React from 'react';
import {
  FileText,
  Eye,
  Users,
  DollarSign,
  Lock,
  Film,
  FileCheck,
  HelpCircle,
  Award,
  MessageSquare,
  Radio,
  Send,
  Download,
  AlertTriangle,
} from 'lucide-react';

export interface SettingsSectionItem {
  id: string;
  label: string;
  icon: React.ElementType;
  featureKey?: string;
}

// eslint-disable-next-line react-refresh/only-export-components
export const SETTINGS_SECTIONS: SettingsSectionItem[] = [
  { id: 'basic', label: 'Basic Information', icon: FileText },
  { id: 'access', label: 'Access & Visibility', icon: Eye },
  { id: 'enrollment', label: 'Enrollment Settings', icon: Users },
  { id: 'pricing', label: 'Pricing (INR)', icon: DollarSign },
  { id: 'learning', label: 'Learning Rules', icon: Lock },
  { id: 'media', label: 'Media Settings', icon: Film },
  { id: 'assignments', label: 'Assignment Settings', icon: FileCheck, featureKey: 'assignments' },
  { id: 'quizzes', label: 'Quiz Settings', icon: HelpCircle, featureKey: 'quizzes' },
  { id: 'certificate-details', label: 'Certificate Details', icon: Award, featureKey: 'courseCertificates' },
  { id: 'discussions', label: 'Discussions & Chat', icon: MessageSquare, featureKey: 'courseDiscussion' },
  { id: 'live-sessions', label: 'Live Sessions', icon: Radio, featureKey: 'liveSessions' },
  { id: 'publishing', label: 'Publishing & Release', icon: Send },
  { id: 'data-export', label: 'Data & Export', icon: Download },
  { id: 'danger-zone', label: 'Danger Zone', icon: AlertTriangle },
];

export interface CourseSettingsNavProps {
  activeSection: string;
  onSelectSection: (id: string) => void;
  courseFeatures: Record<string, boolean | undefined>;
}

export const CourseSettingsNav: React.FC<CourseSettingsNavProps> = ({
  activeSection,
  onSelectSection,
  courseFeatures,
}) => {
  return (
    <nav className="w-full space-y-1 font-sans text-xs text-left">
      {SETTINGS_SECTIONS.map((sec) => {
        const Icon = sec.icon;
        const isSelected = activeSection === sec.id;
        const isDisabledFeature = sec.featureKey ? courseFeatures[sec.featureKey] === false : false;

        return (
          <button
            key={sec.id}
            type="button"
            onClick={() => onSelectSection(sec.id)}
            className={`w-full px-3 py-2.5 rounded-xl font-bold flex items-center justify-between transition-all cursor-pointer ${
              isSelected
                ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                : isDisabledFeature
                ? 'text-slate-400 bg-slate-50 hover:bg-slate-100'
                : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{sec.label}</span>
            </div>

            {isDisabledFeature && (
              <span className="text-[9px] font-extrabold bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded shrink-0">
                OFF
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
