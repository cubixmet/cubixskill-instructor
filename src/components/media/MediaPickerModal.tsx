import React, { useState } from 'react';
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
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';
import {
  usePlatformStore,
  MediaAssetEntity,
  detectMediaType,
} from '../../store/usePlatformStore';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectAsset: (asset: MediaAssetEntity) => void;
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
  const mediaAssets = usePlatformStore((state) => state.mediaAssets || []);
  const totalCredits = usePlatformStore((state) => state.totalCredits);
  const uploadMediaAsset = usePlatformStore((state) => state.uploadMediaAsset);
  const touchMediaAssetLastUsed = usePlatformStore(
    (state) => state.touchMediaAssetLastUsed
  );

  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'upload'>(
    'recent'
  );
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>(
    defaultMediaType === 'all' ? 'All' : defaultMediaType
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<{
    name: string;
    sizeMb: number;
    format: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);

  if (!isOpen) return null;

  const getFormatIcon = (format: string, name: string) => {
    const mType = detectMediaType(format, name);
    if (mType === 'video') return <FileVideo className="w-5 h-5 text-blue-600" />;
    if (mType === 'audio') return <FileAudio className="w-5 h-5 text-indigo-600" />;
    if (mType === 'image') return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    if (mType === 'document') return <FileText className="w-5 h-5 text-amber-600" />;
    return <FileCode className="w-5 h-5 text-slate-600" />;
  };

  const matchesTypeFilter = (asset: MediaAssetEntity) => {
    const filter = selectedTypeFilter.toLowerCase();
    if (filter === 'all') return true;
    const mType = detectMediaType(asset.format, asset.name);
    if (filter === 'video' || filter === 'videos') return mType === 'video';
    if (filter === 'audio') return mType === 'audio';
    if (filter === 'image' || filter === 'images') return mType === 'image';
    if (filter === 'document' || filter === 'documents') return mType === 'document';
    return true;
  };

  const matchesSearch = (asset: MediaAssetEntity) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      asset.name.toLowerCase().includes(q) ||
      asset.format.toLowerCase().includes(q) ||
      asset.folder.toLowerCase().includes(q)
    );
  };

  // Recent assets sorted by lastUsedAt or uploadedAt
  const recentAssets = [...mediaAssets]
    .filter(matchesTypeFilter)
    .filter(matchesSearch)
    .sort(
      (a, b) =>
        new Date(b.lastUsedAt || b.uploadedAt).getTime() -
        new Date(a.lastUsedAt || a.uploadedAt).getTime()
    );

  // All Media assets
  const allFilteredAssets = [...mediaAssets]
    .filter(matchesTypeFilter)
    .filter(matchesSearch)
    .sort(
      (a, b) =>
        new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );

  const handleSelectAsset = (asset: MediaAssetEntity) => {
    touchMediaAssetLastUsed(asset.id);
    onSelectAsset(asset);
    onClose();
  };

  const handleFilePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const sizeMb = Math.round((file.size / (1024 * 1024)) * 10) / 10 || 0.5;
      setUploadFile({
        name: file.name,
        sizeMb,
        format: file.type || file.name.split('.').pop() || 'media',
      });
      setUploadError(null);
    }
  };

  const requiredCredits = uploadFile
    ? Math.max(0.1, Math.round((uploadFile.sizeMb / 100) * 10) / 10)
    : 0;
  const isCreditInsufficient = uploadFile && totalCredits < requiredCredits;

  const handleStartUpload = () => {
    if (!uploadFile) return;
    if (isCreditInsufficient) {
      setUploadError(
        `Insufficient Credits. Required: ${requiredCredits} Credits, Available: ${totalCredits} Credits.`
      );
      return;
    }

    setUploadProgress(15);
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev === null || prev >= 100) {
          clearInterval(interval);
          const res = uploadMediaAsset(uploadFile);
          if (res.success && res.asset) {
            handleSelectAsset(res.asset);
          } else {
            setUploadError(
              res.error ||
                `Upload failed. Required: ${res.requiredCredits} Credits, Available: ${res.availableCredits} Credits.`
            );
          }
          return null;
        }
        return prev + 25;
      });
    }, 150);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4 font-sans text-left pb-2">
        {/* Main Tab Controls */}
        <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-200">
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => setActiveTab('recent')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'recent'
                  ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-3.5 h-3.5" /> Recent
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> All Media ({mediaAssets.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'upload'
                  ? 'bg-white text-[#2563EB] shadow-2xs font-extrabold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" /> Upload New
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-1 text-xs text-slate-500 font-medium">
            <HardDrive className="w-3.5 h-3.5 text-blue-600" />
            <span>Credits: <strong>{totalCredits}</strong></span>
          </div>
        </div>

        {/* Filter & Search Bar for Recent / All Media */}
        {activeTab !== 'upload' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              {/* Type Filter Buttons */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar py-0.5">
                {['All', 'Video', 'Audio', 'Images', 'Documents'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setSelectedTypeFilter(f)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all cursor-pointer whitespace-nowrap ${
                      selectedTypeFilter.toLowerCase() === f.toLowerCase()
                        ? 'bg-blue-50 text-[#2563EB] border border-blue-200'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {f}
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
                  className="w-full h-8 pl-8 pr-3 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            {/* Assets Grid / List */}
            <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
              {(activeTab === 'recent' ? recentAssets : allFilteredAssets).length >
              0 ? (
                (activeTab === 'recent' ? recentAssets : allFilteredAssets).map(
                  (asset) => {
                    const isSelected = selectedAssetId === asset.id;
                    const mType = detectMediaType(asset.format, asset.name);

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAssetId(asset.id)}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50/80 border-[#2563EB] ring-1 ring-[#2563EB]/30'
                            : 'bg-white border-slate-200 hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {asset.thumbnailUrl ? (
                            <img
                              src={asset.thumbnailUrl}
                              alt={asset.name}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                              {getFormatIcon(asset.format, asset.name)}
                            </div>
                          )}

                          <div className="min-w-0">
                            <h4 className="text-xs font-bold text-slate-900 truncate">
                              {asset.name}
                            </h4>
                            <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5 flex-wrap">
                              <Badge variant="outline" size="sm" className="capitalize text-[10px] py-0">
                                {mType}
                              </Badge>
                              <span>{asset.sizeMb} MB</span>
                              {asset.durationMinutes && (
                                <span>• {asset.durationMinutes} min</span>
                              )}
                              {asset.resolution && (
                                <span>• {asset.resolution}</span>
                              )}
                              <span>
                                • {new Date(asset.lastUsedAt || asset.uploadedAt).toLocaleDateString()}
                              </span>
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
                          className="bg-[#2563EB] hover:bg-blue-700 text-white font-semibold shrink-0"
                        >
                          Select
                        </Button>
                      </div>
                    );
                  }
                )
              ) : (
                <div className="p-6 text-center bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    No media assets found
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Try switching filters or click "Upload New" to add a new media asset.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Upload New Tab View */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-blue-500 rounded-xl p-6 text-center space-y-3 bg-slate-50 relative cursor-pointer">
              <input
                type="file"
                onChange={handleFilePicked}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <UploadCloud className="w-8 h-8 text-blue-600 mx-auto" />
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  {uploadFile ? uploadFile.name : 'Click to select or drag media file'}
                </strong>
                <span className="text-[11px] text-slate-500">
                  Supports MP4, MP3, PNG, JPG, PDF, DOCX formats
                </span>
              </div>
            </div>

            {uploadFile && (
              <div className="p-3 bg-blue-50/60 border border-blue-100 rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-700 font-medium">
                  <span>File Size: <strong>{uploadFile.sizeMb} MB</strong></span>
                  <span>Required Credits: <strong>{requiredCredits} Credits</strong></span>
                </div>
                <div className="flex items-center justify-between text-slate-700 font-medium border-t border-blue-100 pt-1.5">
                  <span>Available Credits: <strong>{totalCredits} Credits</strong></span>
                  <span className={isCreditInsufficient ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>
                    {isCreditInsufficient ? 'Insufficient Credits' : 'Credits Available'}
                  </span>
                </div>
              </div>
            )}

            {uploadError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-semibold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {uploadProgress !== null ? (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold text-slate-700">
                  <span>Uploading file...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
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
                  disabled={!uploadFile || Boolean(isCreditInsufficient)}
                  onClick={handleStartUpload}
                  className="bg-[#2563EB] text-white font-semibold"
                >
                  Upload & Select
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
