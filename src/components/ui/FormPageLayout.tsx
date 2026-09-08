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
        <div className="max-w-5xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <button
              type="button"
              onClick={handleBackClick}
              style={{ color: 'var(--text-secondary)' }}
              className="p-2 -ml-2 hover:bg-[var(--surface-hover)] hover:text-[var(--brand-primary)] rounded-xl transition-all cursor-pointer shrink-0"
              title="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <div className="min-w-0 flex-1">
              {/* Full Desktop Breadcrumb Chain (Desktop Only) */}
              {breadcrumbs.length > 0 && (
                <div
                  style={{ color: 'var(--text-muted)' }}
                  className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold mb-0.5 flex-wrap"
                >
                  {breadcrumbs.map((b, idx) => (
                    <React.Fragment key={`bc-${idx}-${b.label}`}>
                      {idx > 0 && <span className="opacity-50">/</span>}
                      {b.url ? (
                        <button
                          type="button"
                          onClick={() => navigate(b.url!)}
                          className="hover:text-[var(--brand-primary)] hover:underline cursor-pointer"
                        >
                          {b.label}
                        </button>
                      ) : (
                        <span style={{ color: 'var(--text-primary)' }} className="font-bold">
                          {b.label}
                        </span>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}

              {/* Page Main Title */}
              <h1
                style={{ color: 'var(--text-primary)' }}
                className="text-base sm:text-lg font-semibold leading-tight whitespace-normal break-words font-sans"
              >
                {title}
              </h1>

              {/* Subtitle / Module Context */}
              {subtitle && (
                <p
                  style={{ color: 'var(--text-muted)' }}
                  className="text-xs font-normal leading-normal whitespace-normal break-words mt-0.5"
                >
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
      <main className="flex-1 max-w-5xl w-full min-w-0 mx-auto px-3 sm:px-6 lg:px-8 pt-3 sm:pt-4">
        {children}
      </main>
    </div>
  );
};
