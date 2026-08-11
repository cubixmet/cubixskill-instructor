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
  onRemoveResource: (resourceId: string) => void;
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
    navigate(
      `/courses/${courseUuid}/curriculum/resources/add?moduleUuid=${moduleUuid}${
        lessonUuid ? `&lessonUuid=${lessonUuid}` : ''
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
    <div className="space-y-3 pt-4 border-t border-slate-200 text-left font-sans">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div>
          <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
            Resources {resources.length > 0 && `(${resources.length})`}
          </h4>
          <p className="text-[11px] text-slate-500">
            Attach supporting materials, documents, audio, or external URLs for learners.
          </p>
        </div>

        <Button
          type="button"
          size="xs"
          onClick={handleAddResourceClick}
          className="bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-bold border border-blue-100 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5 stroke-[3]" />
          <span>+ Add Resource</span>
        </Button>
      </div>

      {resources.length === 0 ? (
        <div className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-xl text-center space-y-2">
          <p className="text-xs font-semibold text-slate-600">
            No resources added yet
          </p>
          <p className="text-[11px] text-slate-400">
            Add downloadable files or external references to enrich this lesson.
          </p>
          <Button
            type="button"
            size="xs"
            onClick={handleAddResourceClick}
            className="bg-[#2563EB] text-white font-bold mx-auto"
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
              className="p-3 bg-white border border-slate-200 rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-blue-200 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                  {getResourceIcon(res.type)}
                </div>
                <div className="min-w-0">
                  <h5 className="font-bold text-slate-900 truncate">
                    {res.name}
                  </h5>
                  <div className="flex items-center gap-2 text-[10px] text-slate-500">
                    <Badge variant="outline" size="sm" className="capitalize py-0">
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
                  className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                  title="View / Open Resource"
                >
                  <Eye className="w-4 h-4" />
                </a>

                {res.type !== 'web_link' && (
                  <a
                    href={res.url}
                    download
                    className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                    title="Download Resource"
                  >
                    <Download className="w-4 h-4" />
                  </a>
                )}

                <button
                  type="button"
                  onClick={() => onRemoveResource(res.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  title="Remove from Lesson"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
