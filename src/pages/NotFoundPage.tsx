import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileQuestion, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '../components/ui/Button';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-4 sm:p-6 text-center font-sans text-xs">
      <div className="max-w-md w-full bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-[#263244] shadow-sm p-6 sm:p-8 space-y-6">
        <div className="w-16 h-16 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800/40">
          <FileQuestion className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
            The page or route you are looking for does not exist or has been moved.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            variant="outline"
            size="md"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            className="cursor-pointer"
          >
            Go Back
          </Button>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              leftIcon={<LayoutDashboard className="w-4 h-4" />}
              className="w-full cursor-pointer"
            >
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};
