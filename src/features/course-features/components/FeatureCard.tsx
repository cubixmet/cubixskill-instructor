import React from 'react';
import {
  Sliders,
  Sparkles,
  BookOpen,
  Award,
  MessageCircle,
  MessageSquare,
  Radio,
  HelpCircle,
  FileCheck,
  Lock,
  DollarSign,
  Video,
  Mic,
  FileText,
  File,
  Download,
  Link,
  Code,
  QrCode,
  Megaphone,
  Clock,
  Eye,
  Users,
  TrendingUp,
  Globe,
  Key,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import type { CourseFeatureDefinition } from '../config/course-features';

export interface FeatureCardProps {
  feature: CourseFeatureDefinition;
  isEnabled: boolean;
  onToggle: (featureId: string, newState: boolean) => void;
  onConfigure?: (feature: CourseFeatureDefinition) => void;
}

const getFeatureIcon = (iconName: string, isEnabled: boolean) => {
  const iconProps = { className: `w-4 h-4 ${isEnabled ? 'text-blue-600' : 'text-slate-500'}` };
  switch (iconName) {
    case 'BookOpen': return <BookOpen {...iconProps} />;
    case 'Award': return <Award {...iconProps} />;
    case 'MessageCircle': return <MessageCircle {...iconProps} />;
    case 'MessageSquare': return <MessageSquare {...iconProps} />;
    case 'Radio': return <Radio {...iconProps} />;
    case 'HelpCircle': return <HelpCircle {...iconProps} />;
    case 'FileCheck': return <FileCheck {...iconProps} />;
    case 'Lock': return <Lock {...iconProps} />;
    case 'DollarSign': return <DollarSign {...iconProps} />;
    case 'Video': return <Video {...iconProps} />;
    case 'Mic': return <Mic {...iconProps} />;
    case 'FileText': return <FileText {...iconProps} />;
    case 'File': return <File {...iconProps} />;
    case 'Download': return <Download {...iconProps} />;
    case 'Link': return <Link {...iconProps} />;
    case 'Code': return <Code {...iconProps} />;
    case 'QrCode': return <QrCode {...iconProps} />;
    case 'Megaphone': return <Megaphone {...iconProps} />;
    case 'Clock': return <Clock {...iconProps} />;
    case 'Eye': return <Eye {...iconProps} />;
    case 'Users': return <Users {...iconProps} />;
    case 'TrendingUp': return <TrendingUp {...iconProps} />;
    case 'Globe': return <Globe {...iconProps} />;
    case 'Key': return <Key {...iconProps} />;
    default: return <Sliders {...iconProps} />;
  }
};

export const FeatureCard: React.FC<FeatureCardProps> = ({
  feature,
  isEnabled,
  onToggle,
  onConfigure,
}) => {
  const handleCardClick = (e: React.MouseEvent) => {
    if (feature.isRequired) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input')) return;
    onToggle(feature.id, !isEnabled);
  };

  return (
    <Card
      padding="sm"
      onClick={handleCardClick}
      className={`transition-all border font-sans text-xs text-left p-3.5 sm:p-4 space-y-2.5 shadow-2xs h-auto cursor-pointer ${
        isEnabled
          ? 'bg-blue-50/20 border-blue-300 ring-1 ring-blue-500/10'
          : 'bg-white border-slate-200 hover:border-slate-300'
      }`}
    >
      {/* ROW 1: ICON + TITLE + BADGES + TOGGLE */}
      <div className="flex items-start justify-between gap-2.5">
        <div className="flex items-start gap-2.5 min-w-0 flex-1">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
            isEnabled ? 'bg-blue-50 border-blue-100' : 'bg-slate-100 border-slate-200'
          }`}>
            {getFeatureIcon(feature.iconName, isEnabled)}
          </div>

          <div className="min-w-0 flex-1 space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-snug break-words">
                {feature.name}
              </h3>
              {feature.isRequired && (
                <Badge variant="error" size="sm" className="font-bold text-[10px] py-0 px-1.5">
                  Base
                </Badge>
              )}
              {feature.isRecommended && (
                <Badge variant="success" size="sm" className="font-bold text-[10px] py-0 px-1.5">
                  Recommended
                </Badge>
              )}
              {feature.isPremium && (
                <Badge variant="warning" size="sm" className="font-bold text-[10px] py-0 px-1.5 flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> Premium
                </Badge>
              )}
            </div>

            <span className="inline-block text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded border border-blue-200">
              +{feature.creditCostPerStudent} Credits/Student
            </span>
          </div>
        </div>

        {/* SWITCH TOGGLE */}
        <label
          className="relative inline-flex items-center cursor-pointer shrink-0 pt-0.5"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={isEnabled}
            disabled={feature.isRequired}
            onChange={(e) => onToggle(feature.id, e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#2563EB] peer-disabled:opacity-50" />
        </label>
      </div>

      {/* ROW 2: FULL DESCRIPTION (NO TRUNCATION) */}
      <p className="text-slate-600 text-xs leading-relaxed font-medium break-words">
        {feature.description}
      </p>

      {/* DEPENDENCIES & CONFIGURE FOOTER */}
      {(feature.dependencies?.length || feature.settingsSchema) && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] shrink-0">
          {feature.dependencies && feature.dependencies.length > 0 ? (
            <span className="text-[10px] text-slate-500 font-medium">
              Requires: {feature.dependencies.join(', ')}
            </span>
          ) : <span />}

          {feature.settingsSchema && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onConfigure?.(feature);
              }}
              className="text-blue-600 font-bold text-xs flex items-center gap-1 hover:underline cursor-pointer ml-auto"
            >
              <Sliders className="w-3.5 h-3.5" /> Configure
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
