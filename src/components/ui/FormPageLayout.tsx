import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface FormPageLayoutProps {
  title: string;
  subtitle?: string;
  backUrl?: string;
  onBack?: () => void;
  breadcrumbs?: { label: string; url?: string }[];
  children: React.ReactNode;
  actions?: React.ReactNode;
}

export const FormPageLayout: React.FC<FormPageLayoutProps> = ({
  title,
  subtitle,
  backUrl,
  onBack,
  breadcrumbs = [],
  children,
  actions,
}) => {
  const navigate = useNavigate();

  const handleBackClick = () => {
    if (onBack) {
      onBack();
    } else if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-left flex flex-col pb-16">
      {/* Top Sticky Header */}
      <header className="sticky top-0 z-30 bg-white border-b border-[#E2E8F0] shadow-2xs">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBackClick}
              className="p-2 -ml-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-all cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              {/* Mobile Back Link Indicator (Mobile Only) */}
              <div className="sm:hidden text-[11px] font-bold text-[#2563EB] mb-0.5 flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleBackClick}
                  className="hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>
                    ← {breadcrumbs.length >= 2 ? breadcrumbs[breadcrumbs.length - 2].label : 'Coupons'}
                  </span>
                </button>
              </div>

              {/* Full Desktop Breadcrumb Chain (Desktop Only) */}
              {breadcrumbs.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-[#64748B] mb-0.5 flex-wrap">
                  {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={`bc-${idx}-${b.label}`}>
                      {idx > 0 && <span>/</span>}
                      {b.url ? (
                        <button
                          type="button"
                          onClick={() => navigate(b.url!)}
                          className="hover:text-[#2563EB] hover:underline"
                        >
                          {b.label}
                        </button>
                      ) : (
                        <span className="text-[#0F172A] font-bold">{b.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Page Main Title (Never truncated with ...) */}
              <h1 className="text-base sm:text-lg font-bold text-[#0F172A] leading-tight whitespace-normal break-words font-sans">
                {title}
              </h1>

              {/* Subtitle / Module Context */}
              {subtitle && (
                <p className="text-xs text-[#64748B] font-medium leading-normal whitespace-normal break-words mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex items-center gap-2 shrink-0">{actions}</div>
          )}
        </div>
      </header>

      {/* Main Page Form Body */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {children}
      </main>
    </div>
  );
};
