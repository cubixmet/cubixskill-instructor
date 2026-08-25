import React from 'react';
import { ShieldOff, Settings } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { isValidCourseId } from '../../../utils/courseValidation.utils';

export interface FeatureDisabledBannerProps {
  featureTitle: string;
  description: string;
  courseUuid?: string | null;
}

export const FeatureDisabledBanner: React.FC<FeatureDisabledBannerProps> = ({
  featureTitle,
  description,
  courseUuid,
}) => {
  const navigate = useNavigate();

  const handleNavigate = () => {
    if (isValidCourseId(courseUuid)) {
      navigate(`/courses/${courseUuid.trim()}/features`);
    } else {
      navigate('/courses');
    }
  };

  return (
    <Card padding="lg" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] text-center py-16 space-y-4 font-sans">
      <div className="w-16 h-16 bg-slate-100 dark:bg-[#0F172A] text-[#64748B] dark:text-[#94A3B8] rounded-full flex items-center justify-center mx-auto border border-[#E2E8F0] dark:border-[#263244]">
        <ShieldOff className="w-8 h-8 text-[#94A3B8] dark:text-[#64748B]" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{featureTitle} Disabled</h3>
        <p className="text-xs sm:text-sm text-[#64748B] dark:text-[#94A3B8] font-normal leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <Button
          onClick={handleNavigate}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium text-xs px-6 py-2.5 shadow-[0_4px_12px_rgba(37,99,235,0.12)]"
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Enable in Course Features
        </Button>
      </div>
    </Card>
  );
};
