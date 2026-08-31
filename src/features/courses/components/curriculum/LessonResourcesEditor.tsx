import React, { useState, useRef } from 'react';
import {
  Paperclip,
  Upload,
  FolderOpen,
  FileText,
  FileVideo,
  FileAudio,
  Image as ImageIcon,
  Trash2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../../../components/ui/Button';
import { MediaPickerModal } from '../../../../components/media/MediaPickerModal';
import type { MediaFileApiItem } from '../../../../services/storage.service';

export interface PendingResource {
  id: string;
  title: string;
  resourceType: string;
  file?: File;
  mediaFileId?: string;
  url?: string;
  sizeMb?: number;
  status: 'ready' | 'uploading' | 'error';
  errorMessage?: string;
}

interface LessonResourcesEditorProps {
  resources: PendingResource[];
  onChangeResources: (updated: PendingResource[]) => void;
  courseUuid?: string;
}

export const LessonResourcesEditor: React.FC<LessonResourcesEditorProps> = ({
  resources,
  onChangeResources,
}) => {
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getResourceType = (mime: string, filename: string): string => {
    const lowerMime = (mime || '').toLowerCase();
    const lowerName = (filename || '').toLowerCase();
    if (lowerMime.startsWith('video/') || lowerName.match(/\.(mp4|webm|mkv|mov)$/)) return 'video';
    if (lowerMime.startsWith('audio/') || lowerName.match(/\.(mp3|wav|aac|m4a)$/)) return 'audio';
    if (lowerMime.startsWith('image/') || lowerName.match(/\.(png|jpg|jpeg|gif|webp)$/)) return 'image';
    if (lowerName.endsWith('.pdf')) return 'pdf';
    return 'document';
  };

  const getResourceIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'audio':
        return <FileAudio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'pdf':
      case 'document':
      default:
        return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newItems: PendingResource[] = Array.from(files).map((f) => {
      const type = getResourceType(f.type, f.name);
      const sizeMb = parseFloat((f.size / (1024 * 1024)).toFixed(2));
      return {
        id: `local-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: f.name,
        resourceType: type,
        file: f,
        sizeMb,
        status: 'ready',
      };
    });

    onChangeResources([...resources, ...newItems]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSelectMediaAsset = (asset: MediaFileApiItem) => {
    const type = getResourceType(asset.mime_type, asset.original_filename);
    const sizeMb = asset.size_bytes ? parseFloat((asset.size_bytes / (1024 * 1024)).toFixed(2)) : undefined;

    const newItem: PendingResource = {
      id: `media-${asset.id}`,
      title: asset.original_filename || asset.title || 'Media Library File',
      resourceType: type,
      mediaFileId: asset.id,
      sizeMb,
      status: 'ready',
    };

    onChangeResources([...resources, newItem]);
    setIsMediaModalOpen(false);
  };

  const handleRemove = (idToRemove: string) => {
    onChangeResources(resources.filter((r) => r.id !== idToRemove));
  };

  return (
    <div className="space-y-4 pt-4 border-t border-[var(--border)] font-sans text-left w-full min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 w-full min-w-0">
        <div>
          <div className="flex items-center gap-2">
            <Paperclip style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />
            <h4 className="text-xs font-bold text-[var(--text-primary)] uppercase tracking-wider">
              Resources (Optional)
            </h4>
            {resources.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-[var(--brand-primary)] border border-blue-200 dark:border-blue-800">
                {resources.length}
              </span>
            )}
          </div>
          <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
            Add files, documents, templates, or references students can use with this lesson.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileChange}
            className="hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.png,.jpg,.jpeg,.mp4,.mp3"
          />

          <Button
            type="button"
            size="xs"
            onClick={() => fileInputRef.current?.click()}
            style={{
              backgroundColor: 'var(--brand-primary)',
              color: 'var(--brand-primary-foreground, #FFFFFF)',
            }}
            className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 shrink-0 shadow-2xs cursor-pointer min-h-[38px]"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload File</span>
          </Button>

          <Button
            type="button"
            size="xs"
            variant="outline"
            onClick={() => setIsMediaModalOpen(true)}
            className="px-3 py-1.5 text-xs font-bold rounded-xl flex items-center gap-1.5 border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] hover:bg-[var(--surface-hover)] shrink-0 cursor-pointer min-h-[38px]"
          >
            <FolderOpen className="w-3.5 h-3.5 text-[var(--brand-primary)]" />
            <span>Choose from Media</span>
          </Button>
        </div>
      </div>

      {resources.length === 0 ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="p-5 border-2 border-dashed border-[var(--input-border)] hover:border-[var(--brand-primary)] bg-[var(--surface-secondary)]/50 hover:bg-[var(--surface-secondary)] rounded-2xl text-center space-y-2 cursor-pointer transition-all"
        >
          <Paperclip className="w-6 h-6 text-[var(--text-muted)] mx-auto opacity-70" />
          <p className="text-xs font-bold text-[var(--text-primary)]">
            No resources attached yet
          </p>
          <p className="text-[11px] text-[var(--text-muted)] max-w-sm mx-auto">
            Click <span className="font-semibold text-[var(--brand-primary)]">Upload File</span> or <span className="font-semibold text-[var(--brand-primary)]">Choose from Media</span> to attach supporting materials.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {resources.map((res) => (
            <div
              key={res.id}
              className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl flex items-center justify-between gap-3 text-xs shadow-2xs hover:border-[var(--brand-primary)] transition-all"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-8 h-8 rounded-lg bg-[var(--surface-secondary)] border border-[var(--border)] flex items-center justify-center shrink-0">
                  {getResourceIcon(res.resourceType)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-[var(--text-primary)] truncate text-xs">
                    {res.title}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)] flex items-center gap-2 flex-wrap">
                    <span className="uppercase font-bold text-[var(--brand-primary)]">
                      {res.resourceType}
                    </span>
                    {res.sizeMb !== undefined && <span>• {res.sizeMb} MB</span>}
                    {res.mediaFileId && (
                      <span className="px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold text-[9px]">
                        Media Library
                      </span>
                    )}
                    {res.file && (
                      <span className="px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold text-[9px]">
                        Pending Upload
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {res.status === 'uploading' && (
                  <span className="text-[10px] font-semibold text-blue-600 animate-pulse">
                    Uploading...
                  </span>
                )}
                {res.status === 'error' && (
                  <span className="text-[10px] font-semibold text-rose-600 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Error
                  </span>
                )}

                <button
                  type="button"
                  onClick={() => handleRemove(res.id)}
                  aria-label="Remove resource"
                  className="p-1.5 text-[var(--text-muted)] hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer"
                  title="Remove resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={isMediaModalOpen}
        onClose={() => setIsMediaModalOpen(false)}
        onSelectAsset={handleSelectMediaAsset}
        defaultMediaType="all"
        title="Select Resource from Media Library"
      />
    </div>
  );
};
