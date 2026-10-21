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
    if (onBack) onBack();
    else if (backUrl) navigate(backUrl);
    else navigate(-1);
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--page-background)',
        color: 'var(--text-primary)',
      }}
      className="min-h-screen font-sans text-left flex flex-col pb-0"
    >
      {/* Top Sticky Header */}
      <header
        style={{
          backgroundColor: 'var(--surface)',
          borderColor: 'var(--border)',
        }}
        className="sticky top-0 z-30 border-b shadow-2xs"
      >
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBackClick}
              style={{ color: 'var(--text-secondary)' }}
              className="min-h-11 min-w-11 flex items-center justify-center p-2 -ml-2 hover:bg-[var(--surface-hover)] hover:text-[var(--brand-primary)] rounded-xl transition-all cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              {breadcrumbs.length > 0 && (
                <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium mb-0.5 flex-wrap text-[var(--text-muted)]">
                  {breadcrumbs.map((breadcrumb, idx) => (
                    <React.Fragment key={`bc-${idx}-${breadcrumb.label}`}>
                      {idx > 0 && <span className="opacity-60">/</span>}
                      {breadcrumb.url ? (
                        <button
                          type="button"
                          onClick={() => navigate(breadcrumb.url!)}
                          className="hover:text-[var(--brand-primary)] transition-colors cursor-pointer"
                        >
                          {breadcrumb.label}
                        </button>
                      ) : (
                        <span className="text-[var(--text-secondary)]">{breadcrumb.label}</span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              <h1 className="text-base sm:text-lg font-semibold leading-tight whitespace-normal break-words tracking-[-0.015em]">
                {title}
              </h1>

              {subtitle && (
                <p className="text-xs sm:text-[13px] text-[var(--text-muted)] font-normal leading-normal whitespace-normal break-words mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {actions && (
            <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:w-auto">{actions}</div>
          )}
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full min-w-0 mx-auto pt-4 sm:pt-5">
        {children}
      </main>
    </div>
  );
};

