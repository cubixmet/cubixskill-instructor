import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { Button } from '../ui/Button';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class FormErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Form Component Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 bg-rose-50/80 border border-rose-200 rounded-[16px] text-left space-y-4 max-w-lg mx-auto font-sans">
          <div className="flex items-center gap-2 text-rose-700 font-semibold text-sm">
            <AlertOctagon className="w-5 h-5 shrink-0" />
            <span>Something went wrong</span>
          </div>
          <p className="text-xs text-[#0F172A] font-normal">
            The form component encountered an unexpected error and could not be displayed correctly.
          </p>

          <Button
            size="sm"
            leftIcon={<RotateCcw className="w-4 h-4" />}
            onClick={() => this.setState({ hasError: false, error: undefined })}
            className="bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs"
          >
            Try Again
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}
