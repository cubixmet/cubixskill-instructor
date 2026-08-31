import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  Trash2,
  Download,
  Eye,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import type { LessonResourceAttachment } from '../../../../types/curriculum.types';

interface LessonResourcesSectionProps {
  resources?: LessonResourceAttachment[];
  courseUuid: string;
  moduleUuid?: string;
  lessonUuid?: string;
  onRemoveResource?: (resourceId: string) => void;
}

export const LessonResourcesSection: React.FC<LessonResourcesSectionProps> = ({
  resources = [],
  courseUuid,
  moduleUuid = '',
  lessonUuid = '',
  onRemoveResource,
}) => {
  const navigate = useNavigate();

  const handleAddResourceClick = () => {
    if (!courseUuid || courseUuid === 'undefined' || !moduleUuid) {
      console.warn('Cannot navigate to Add Resource: missing valid courseUuid or moduleUuid', {
        courseUuid,
        moduleUuid,
      });
      return;
    }

    navigate(
      `/courses/${courseUuid}/curriculum/resources/add?moduleUuid=${encodeURIComponent(moduleUuid)}${
        lessonUuid ? `&lessonUuid=${encodeURIComponent(lessonUuid)}` : ''
      }`
    );
  };

  const getResourceIcon = (type: string) => {
    if (type === 'video') return <FileVideo style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />;
    if (type === 'audio') return <FileAudio style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />;
    if (type === 'image') return <ImageIcon style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />;
    if (type === 'web_link') return <ExternalLink style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />;
    return <FileText style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />;
  };

  return (
    <div style={{ borderColor: 'var(--border)' }} className="space-y-3 pt-4 border-t text-left font-sans w-full min-w-0 max-w-full">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 style={{ color: 'var(--text-primary)' }} className="text-xs font-semibold uppercase tracking-wider">
            Resources {resources.length > 0 && `(${resources.length})`}
          </h4>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Attach supporting materials, documents, audio, or external URLs for learners.
          </p>
        </div>

        <button
          type="button"
          onClick={handleAddResourceClick}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--text-secondary)',
          }}
          className="h-7 px-2.5 border rounded-lg font-medium text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] active:scale-[0.98]"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5] stroke-current" />
          <span>Add Resource</span>
        </button>
      </div>

      {resources.length === 0 ? (
        <div
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
          }}
          className="p-4 border border-dashed rounded-xl text-center space-y-2 transition-all w-full min-w-0"
        >
          <p style={{ color: 'var(--text-primary)' }} className="text-xs font-medium">
            No resources added yet
          </p>
          <p style={{ color: 'var(--text-secondary)' }} className="text-[11px]">
            Add downloadable files or external references to enrich this lesson.
          </p>
          <button
            type="button"
            onClick={handleAddResourceClick}
            style={{
              backgroundColor: 'var(--surface-secondary)',
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
            }}
            className="h-7 px-2.5 border rounded-lg font-medium text-[11px] inline-flex items-center gap-1 transition-all cursor-pointer hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)] mx-auto"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5] stroke-current" />
            <span>Add Resource</span>
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((res) => (
            <div
              key={res.id}
              style={{
                backgroundColor: 'var(--surface-secondary)',
                borderColor: 'var(--border)',
              }}
              className="p-3 border rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-[var(--brand-primary)] transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  style={{
                    backgroundColor: 'color-mix(in srgb, var(--brand-primary) 10%, transparent)',
                    color: 'var(--brand-primary)',
                  }}
                  className="w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center shrink-0"
                >
                  {getResourceIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <h5 style={{ color: 'var(--text-primary)' }} className="font-medium truncate">
                    {res.name}
                  </h5>
                  <div style={{ color: 'var(--text-secondary)' }} className="flex items-center gap-2 text-[10px]">
                    <span className="capitalize font-semibold" style={{ color: 'var(--brand-primary)' }}>
                      {res.type.replace('_', ' ')}
                    </span>
                    {res.sizeMb && <span>• {res.sizeMb} MB</span>}
                    {res.provider && <span>• {res.provider}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  style={{
                    backgroundColor: 'var(--surface)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-primary)',
                  }}
                  className="p-1.5 border rounded-lg transition-colors hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                  title="View / Open Resource"
                >
                  <Eye className="w-4 h-4 stroke-current" />
                </a>

                {res.allowDownload && (
                  <a
                    href={res.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      backgroundColor: 'var(--surface)',
                      borderColor: 'var(--border)',
                      color: 'var(--text-primary)',
                    }}
                    className="p-1.5 border rounded-lg transition-colors hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)] hover:text-[var(--brand-primary)]"
                    title="Download Resource"
                  >
                    <Download className="w-4 h-4 stroke-current" />
                  </a>
                )}

                {onRemoveResource && (
                  <button
                    type="button"
                    onClick={() => onRemoveResource(res.id)}
                    style={{ color: '#F87171' }}
                    className="p-1.5 rounded-lg transition-colors cursor-pointer hover:bg-rose-500/10 hover:text-[#FCA5A5]"
                    title="Remove from Lesson"
                  >
                    <Trash2 className="w-4 h-4 stroke-current" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
