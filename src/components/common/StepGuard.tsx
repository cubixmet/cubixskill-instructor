import React from 'react';
import { Check, Lock } from 'lucide-react';

export interface StepItem {
  id: number | string;
  name: string;
  shortName?: string;
  subtitle?: string;
}

export interface StepGuardProps {
  steps: StepItem[];
  currentStep: number; // 1-indexed (e.g. 1, 2, 3)
  completedSteps: number[]; // list of completed step numbers (e.g. [1, 2])
  onStepClick: (stepNum: number) => void;
  onBlockedClick?: (blockedStep: StepItem) => void;
  className?: string;
}

export const StepGuard: React.FC<StepGuardProps> = ({
  steps,
  currentStep,
  completedSteps,
  onStepClick,
  onBlockedClick,
  className = '',
}) => {
  const handleStepClick = (step: StepItem, index: number) => {
    const stepNum = typeof step.id === 'number' ? step.id : index + 1;
    const isCompleted = completedSteps.includes(stepNum);
    const isCurrent = currentStep === stepNum;
    const isUnlocked = isCompleted || isCurrent || stepNum === 1 || completedSteps.includes(stepNum - 1);

    if (isUnlocked) {
      onStepClick(stepNum);
    } else {
      if (onBlockedClick) {
        onBlockedClick(step);
      }
    }
  };

  return (
    <div className={`bg-white rounded-2xl border border-[#E2E8F0] p-4 sm:p-5 font-sans ${className}`}>
      <div className="relative flex items-center justify-between overflow-x-auto no-scrollbar gap-4">
        {/* Background Connecting Line */}
        <div className="absolute top-4 left-10 right-10 h-[2px] bg-[#E2E8F0] -z-0 hidden md:block" />

        {steps.map((st, index) => {
          const stepNum = typeof st.id === 'number' ? st.id : index + 1;
          const isCurrent = currentStep === stepNum;
          const isCompleted = completedSteps.includes(stepNum);
          const isLocked = !isCurrent && !isCompleted && stepNum > 1 && !completedSteps.includes(stepNum - 1);

          return (
            <button
              key={st.id}
              type="button"
              onClick={() => handleStepClick(st, index)}
              disabled={isLocked}
              className={`flex flex-col items-center gap-2 relative z-10 shrink-0 transition-all select-none ${
                isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer group'
              }`}
            >
              {/* Circle Indicator */}
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold transition-all shadow-xs ${
                  isCurrent
                    ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 shadow-md'
                    : isCompleted
                    ? 'bg-[#2563EB] text-white'
                    : 'bg-[#F8FAFC] border border-[#CBD5E1] text-[#94A3B8]'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4.5 h-4.5 stroke-[3]" />
                ) : isLocked ? (
                  <Lock className="w-4 h-4 text-[#94A3B8]" />
                ) : (
                  stepNum
                )}
              </div>

              {/* Step Title Label */}
              <div className="text-center">
                <span
                  className={`text-xs font-semibold block whitespace-nowrap ${
                    isCurrent
                      ? 'text-[#2563EB]'
                      : isCompleted
                      ? 'text-[#0F172A]'
                      : 'text-[#94A3B8]'
                  }`}
                >
                  {st.shortName || st.name}
                </span>
                {st.subtitle && (
                  <span className="text-[10px] text-[#64748B] block mt-0.5 max-w-[100px] truncate hidden sm:block">
                    {st.subtitle}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
