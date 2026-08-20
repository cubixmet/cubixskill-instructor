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
    if (type === 'video') return <FileVideo className="w-4 h-4 text-blue-600" />;
    if (type === 'audio') return <FileAudio className="w-4 h-4 text-indigo-600" />;
    if (type === 'image') return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    if (type === 'web_link') return <ExternalLink className="w-4 h-4 text-purple-600" />;
    return <FileText className="w-4 h-4 text-amber-600" />;
  };

  return (
    <div className="space-y-3 pt-4 border-t border-slate-200 dark:border-[#334155] text-left font-sans">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] uppercase tracking-wider">
            Resources {resources.length > 0 && `(${resources.length})`}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Attach supporting materials, documents, audio, or external URLs for learners.
          </p>
        </div>

        <Button
          type="button"
          size="xs"
          onClick={handleAddResourceClick}
          className="bg-white dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] hover:bg-blue-50 dark:hover:bg-[#2563EB]/10 font-medium border border-[#2563EB] dark:border-[#3B82F6] cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>Add Resource</span>
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="p-4 bg-slate-50 dark:bg-[#0F172A] border border-dashed border-slate-300 dark:border-[#334155] hover:bg-slate-100/60 dark:hover:bg-[#172033] hover:border-blue-400 dark:hover:border-[#3B82F6] rounded-xl text-center space-y-2 transition-all">
          <p className="text-xs font-medium text-slate-900 dark:text-[#F8FAFC]">
            No resources added yet
          </p>
          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Add downloadable files or external references to enrich this lesson.
          </p>
          <Button
            type="button"
            size="xs"
            onClick={handleAddResourceClick}
            className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium mx-auto shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Add Resource</span>
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-3 bg-white dark:bg-[#172033] border border-slate-200 dark:border-[#334155] rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-blue-300 dark:hover:border-[#3B82F6] transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center shrink-0">
                  {getResourceIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <h5 className="font-medium text-slate-900 dark:text-[#F8FAFC] truncate">
                    {res.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-[#94A3B8]">
                    <Badge variant="neutral" size="sm" className="capitalize py-0 dark:bg-[#0F172A] dark:text-[#CBD5E1]">
                      {res.type.replace('_', ' ')}
                    </Badge>
                    {res.sizeMb && <span>{res.sizeMb} MB</span>}
                    {res.provider && <span>• {res.provider}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={res.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-500 dark:text-[#CBD5E1] hover:text-blue-600 dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-[#0F172A] rounded-lg transition-colors"
                  title="View / Open Resource"
                >
                  <Eye className="w-4 h-4" />
                </a>

                {res.allowDownload && (
                  <a
                    href={res.url}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 text-slate-500 dark:text-[#CBD5E1] hover:text-blue-600 dark:hover:text-[#60A5FA] hover:bg-slate-100 dark:hover:bg-[#0F172A] rounded-lg transition-colors"
                    title="Download Resource"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                {onRemoveResource && (
                  <button
                    type="button"
                    onClick={() => onRemoveResource(res.id)}
                    className="p-1.5 text-slate-400 dark:text-[#F87171] hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                    title="Remove from Lesson"
                  >
                    <Trash2 className="w-4 h-4" />
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
