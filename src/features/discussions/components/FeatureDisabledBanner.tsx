import React from 'react';
import { ShieldOff, Settings, Sparkles } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';

export interface FeatureDisabledBannerProps {
  featureTitle: string;
  description: string;
  courseUuid: string;
}

export const FeatureDisabledBanner: React.FC<FeatureDisabledBannerProps> = ({
  featureTitle,
  description,
  courseUuid,
}) => {
  const navigate = useNavigate();

  return (
    <Card padding="lg" className="bg-white border border-slate-200 text-center py-16 space-y-4 font-sans">
      <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto border border-slate-200">
        <ShieldOff className="w-8 h-8 text-slate-400" />
      </div>

      <div className="space-y-1 max-w-md mx-auto">
        <h3 className="text-lg font-extrabold text-slate-900">{featureTitle} Disabled</h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">{description}</p>
      </div>

      <div className="pt-2">
        <Button
          onClick={() => navigate(`/courses/${courseUuid}/features`)}
          className="bg-[#2563EB] text-white font-extrabold text-xs px-6 py-2.5 hover:bg-blue-700"
          leftIcon={<Settings className="w-4 h-4" />}
        >
          Enable in Course Features
        </Button>
      </div>
    </Card>
  );
};
