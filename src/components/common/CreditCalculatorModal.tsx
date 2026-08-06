import React from 'react';
import { Modal } from '../ui/Modal';
import { CreditCalculator } from './CreditCalculator';

export interface CreditCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialEnrolledCount?: number;
  courseTitle?: string;
}

export const CreditCalculatorModal: React.FC<CreditCalculatorModalProps> = ({
  isOpen,
  onClose,
  initialEnrolledCount = 50,
  courseTitle,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Credit Usage & Cost Estimator Calculator"
      subtitle="Calculate exact media credit requirements for your courses based on features and student volume."
      maxWidth="xl"
    >
      <div className="pt-2">
        <CreditCalculator
          initialEnrolledCount={initialEnrolledCount}
          courseTitle={courseTitle}
        />
      </div>
    </Modal>
  );
};
