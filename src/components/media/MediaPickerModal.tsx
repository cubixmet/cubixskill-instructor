import React, { useState, useEffect, useCallback } from 'react';
import {
  Search,
  UploadCloud,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileCode,
  AlertTriangle,
  Clock,
  HardDrive,
  Layers,
  RefreshCw,
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  storageService,
  MediaFileApiItem,
} from '../../services/storage.service';
import { resolveMediaUrl, formatBytes } from '../../utils/media.utils';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MediaFileApiItem) => void;
  defaultMediaType?: 'all' | 'video' | 'audio' | 'image' | 'document';
  title?: string;
}

export const MediaPickerModal: React.FC<MediaPickerModalProps> = ({
  isOpen,
  onClose,
  onSelectAsset,
  defaultMediaType = 'all',
  title = 'Select Media Asset',
}) => {
  const [mediaAssets, setMediaAssets] = useState<MediaFileApiItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'upload'>('recent');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(
    defaultMediaType === 'all' ? 'ALL' : defaultMediaType.toUpperCase()
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Upload Form State
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fetchAssets = useCallback(async () => {
    if (!isOpen) return;
    try {
      setLoading(true);
      setError(null);
      const res = await storageService.getMediaFiles({
        search: searchQuery,
        media_type: selectedTypeFilter,
        ordering: '-created_at',
      });
      setMediaAssets(res.results);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to load media assets.');
    } finally {
      setLoading(false);
    }
  }, [isOpen, searchQuery, selectedTypeFilter]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  if (!isOpen) return null;

  const getFormatIcon = (mime: string, name: string, typeStr: string) => {
    const t = (typeStr || '').toUpperCase();
    const m = (mime || '').toLowerCase();
    if (t === 'VIDEO' || m.includes('video')) return <FileVideo className="w-5 h-5 text-blue-600" />;
    if (t === 'AUDIO' || m.includes('audio')) return <FileAudio className="w-5 h-5 text-indigo-600" />;
    if (t === 'IMAGE' || m.includes('image')) return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (t === 'DOCUMENT' || m.includes('pdf') || m.includes('doc')) return <FileText className="w-5 h-5 text-amber-600" />;
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  const handleSelectAsset = (asset: MediaFileApiItem) => {
    onSelectAsset(asset);
    onClose();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadError(null);
    }
  };

  const handleStartUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      setUploadError(null);
      setUploadProgress(10);
      const newAsset = await storageService.uploadFile(selectedFile, (pct) => {
        setUploadProgress(Math.max(10, pct));
      });
      handleSelectAsset(newAsset);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 font-sans text-left pb-2">
        {/* Main Tab Controls */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-[#263244]">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-[#0F172A] rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recent'
                  ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Media ({mediaAssets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white dark:bg-[#111827] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                  : 'text-slate-600 dark:text-[#94A3B8] hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload New
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        {activeTab !== 'upload' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {[
                  { id: 'ALL', label: 'All' },
                  { id: 'VIDEO', label: 'Video' },
                  { id: 'AUDIO', label: 'Audio' },
                  { id: 'IMAGE', label: 'Images' },
                  { id: 'DOCUMENT', label: 'Documents' },
                ].map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelectedTypeFilter(f.id)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedTypeFilter === f.id
                        ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-[#2563EB] dark:text-[#60A5FA] border border-blue-200 dark:border-[#3B82F6]'
                        : 'bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-[#CBD5E1] border border-slate-200 dark:border-[#334155]'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Search Bar */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search media..."
                  className="w-full h-8 pl-8 pr-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>
            </div>

            {/* Assets List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {loading ? (
                <div className="p-6 text-center text-slate-400 text-xs flex items-center justify-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin" /> Loading assets...
                </div>
              ) : error ? (
                <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs rounded-xl text-center">
                  {error}
                </div>
              ) : mediaAssets.length > 0 ? (
                mediaAssets.map((asset) => {
                  const isSelected = selectedAssetId === asset.id;
                  const resolvedUrl = resolveMediaUrl(asset.url);
                  const displayName = asset.display_name || asset.original_filename;

                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-[#172033] border-[#2563EB] ring-1 ring-[#2563EB]/30'
                          : 'bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] hover:border-blue-300'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {asset.media_type === 'IMAGE' ? (
                          <img
                            src={resolvedUrl}
                            alt={displayName}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200 dark:border-[#334155] shrink-0"
                            onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center shrink-0">
                            {getFormatIcon(asset.mime_type, asset.original_filename, asset.media_type)}
                          </div>
                        )}

                        <div className="min-w-0">
                          <h4 className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] truncate max-w-xs sm:max-w-sm">
                            {displayName}
                          </h4>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-[#94A3B8] mt-0.5 flex-wrap">
                            <Badge variant="neutral" size="sm" className="capitalize text-[10px] py-0">
                              {asset.media_type}
                            </Badge>
                            <span>{formatBytes(asset.size_bytes)}</span>
                            <span>• {new Date(asset.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      <Button
                        type="button"
                        size="xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAsset(asset);
                        }}
                        className="bg-[#2563EB] hover:bg-blue-700 text-white font-medium shrink-0"
                      >
                        Select
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="p-6 text-center bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl space-y-1">
                  <p className="text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                    No media assets found
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                    Click "Upload New" to add a new media file to your Academy.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload New Tab View */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-[#334155] hover:border-blue-500 rounded-xl p-6 text-center space-y-3 bg-slate-50 dark:bg-[#0F172A] relative cursor-pointer">
              <input
                type="file"
                onChange={handleFilePicked}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
              <div>
                <strong className="text-xs font-semibold text-slate-900 dark:text-[#F8FAFC] block">
                  {selectedFile ? selectedFile.name : 'Click to select or drag media file'}
                </strong>
                <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  Supports MP4, MP3, PNG, JPG, PDF, DOCX formats
                </span>
              </div>
            </div>

            {selectedFile && (
              <div className="p-3 bg-blue-50/60 dark:bg-[#0F172A] border border-blue-100 dark:border-[#334155] rounded-xl text-xs flex items-center justify-between text-slate-700 dark:text-[#CBD5E1]">
                <span>Selected: <strong>{selectedFile.name}</strong></span>
                <span>Size: <strong>{formatBytes(selectedFile.size)}</strong></span>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploading ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700 dark:text-[#CBD5E1]">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 transition-all duration-150"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={!selectedFile}
                  onClick={handleStartUpload}
                  className="bg-[#2563EB] text-white font-medium"
                >
                  Upload &amp; Select
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
