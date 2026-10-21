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
    <div className="min-h-full text-[var(--text-primary)] text-left flex flex-col">
      <header className="sticky top-0 z-30 -mx-3 sm:-mx-5 lg:-mx-7 px-3 sm:px-5 lg:px-7 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-md shadow-[var(--shadow-xs)]">
        <div className="max-w-[1440px] mx-auto py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBackClick}
              className="size-10 -ml-1 inline-flex items-center justify-center text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--brand-primary)] rounded-[var(--radius-sm)] transition-colors cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--focus-ring)]"
              aria-label="Go back"
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

          {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
      </header>

      <main className="flex-1 max-w-[1440px] w-full min-w-0 mx-auto pt-4 sm:pt-5">
        {children}
      </main>
    </div>
  );
};
