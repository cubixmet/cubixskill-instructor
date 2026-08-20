import React, { useState } from 'react';
import {
  Layers,
  Upload,
  Search,
  Trash2,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  FileCode,
  AlertTriangle,
  HardDrive,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  MoreVertical,
  Eye,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import {
  usePlatformStore,
  MediaAssetEntity,
  detectMediaType,
} from '../../../store/usePlatformStore';

export const MediaPage: React.FC = () => {
  const mediaAssets = usePlatformStore((state) => state.mediaAssets || []);
  const totalCredits = usePlatformStore((state) => state.totalCredits);
  const uploadMediaAsset = usePlatformStore((state) => state.uploadMediaAsset);
  const deleteMediaAsset = usePlatformStore((state) => state.deleteMediaAsset);
  const isMediaAssetInUse = usePlatformStore((state) => state.isMediaAssetInUse);

  const [activeTab, setActiveTab] = useState<'recent' | 'all' | 'upload'>('recent');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'name'>('newest');
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);

  // Delete Target Modal State
  const [deleteTarget, setDeleteTarget] = useState<MediaAssetEntity | null>(null);
  const [deleteWarning, setDeleteWarning] = useState<string | null>(null);

  // Upload Form State
  const [uploadFile, setUploadFile] = useState<{
    name: string;
    sizeMb: number;
    format: string;
    folder: string;
  }>({
    name: '',
    sizeMb: 15,
    format: 'video/mp4',
    folder: 'General',
  });
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccessToast, setUploadSuccessToast] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<MediaAssetEntity | null>(null);

  const getFormatIcon = (format: string, name: string) => {
    const mType = detectMediaType(format, name);
    if (mType === 'video') return <FileVideo className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />;
    if (mType === 'audio') return <FileAudio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    if (mType === 'image') return <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (mType === 'document') return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <FileCode className="w-4 h-4 text-slate-600 dark:text-[#94A3B8]" />;
  };

  const matchesCategory = (asset: MediaAssetEntity) => {
    const cat = selectedCategory.toLowerCase();
    if (cat === 'all') return true;
    const mType = detectMediaType(asset.format, asset.name);
    if (cat === 'video' || cat === 'videos') return mType === 'video';
    if (cat === 'audio') return mType === 'audio';
    if (cat === 'image' || cat === 'images') return mType === 'image';
    if (cat === 'document' || cat === 'documents') return mType === 'document';
    return true;
  };

  const matchesSearch = (asset: MediaAssetEntity) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    return (
      asset.name.toLowerCase().includes(q) ||
      asset.format.toLowerCase().includes(q) ||
      asset.folder.toLowerCase().includes(q)
    );
  };

  const filteredAssets = [...mediaAssets]
    .filter(matchesCategory)
    .filter(matchesSearch);

  const sortedAssets = filteredAssets.sort((a, b) => {
    if (activeTab === 'recent') {
      return (
        new Date(b.lastUsedAt || b.uploadedAt).getTime() -
        new Date(a.lastUsedAt || a.uploadedAt).getTime()
      );
    }
    if (sortBy === 'oldest') {
      return new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
    }
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name);
    }
    return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
  });

  const handleDeleteClick = (asset: MediaAssetEntity) => {
    setDeleteTarget(asset);
    const usage = isMediaAssetInUse(asset.id);
    if (usage.isInUse) {
      setDeleteWarning(
        `Warning: This media asset is currently in use (${usage.reason}). Deleting it from the global Media Library will break existing references.`
      );
    } else {
      setDeleteWarning(null);
    }
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteMediaAsset(deleteTarget.id);
    setDeleteTarget(null);
    setDeleteWarning(null);
  };

  const requiredCredits = Math.max(
    0.1,
    Math.round((uploadFile.sizeMb / 100) * 10) / 10
  );
  const isCreditInsufficient = totalCredits < requiredCredits;

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile.name.trim()) return;

    if (isCreditInsufficient) {
      setUploadError(
        `Insufficient Credits. Required: ${requiredCredits} Credits, Available: ${totalCredits} Credits.`
      );
      return;
    }

    const res = uploadMediaAsset(uploadFile);
    if (res.success) {
      setUploadFile({
        name: '',
        sizeMb: 15,
        format: 'video/mp4',
        folder: 'General',
      });
      setUploadError(null);
      setActiveTab('recent');
      setUploadSuccessToast('Asset uploaded successfully and added to Media Library!');
      setTimeout(() => setUploadSuccessToast(null), 4000);
    } else {
      setUploadError(
        res.error ||
          `Upload failed. Required: ${res.requiredCredits} Credits, Available: ${res.availableCredits} Credits.`
      );
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Alert */}
      {uploadSuccessToast && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] text-xs font-medium rounded-2xl shadow-2xl border border-slate-800 dark:border-[#334155] flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{uploadSuccessToast}</span>
        </div>
      )}

      {/* Header */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Media Library
              </h1>
              <Badge variant="info" size="sm" className="font-medium shrink-0 text-[10px]">
                {mediaAssets.length} Assets
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed">
              Centralized media storage. Upload once, store once, and reuse across all lessons & courses.
            </p>
          </div>

          <Button
            size="sm"
            onClick={() => setActiveTab('upload')}
            className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-medium text-xs px-3.5 sm:px-4 rounded-xl hover:bg-[#1D4ED8] shrink-0 w-full sm:w-auto flex items-center justify-center gap-1.5 shadow-2xs"
            leftIcon={<Upload className="w-4 h-4" />}
          >
            Upload Media
          </Button>
        </div>
      </Card>

      {/* Storage & Credit Summary Bar */}
      <div className="p-3 sm:p-4 bg-blue-50/70 dark:bg-[#0F172A] border border-blue-200/80 dark:border-[#334155] rounded-2xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-[#CBD5E1]">
        <HardDrive className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0 mt-0.5" />
        <div className="space-y-0.5 min-w-0 flex-1">
          <h4 className="font-semibold text-blue-950 dark:text-[#F8FAFC] text-xs">
            Media Credit Billing Engine
          </h4>
          <p className="text-blue-800 dark:text-[#94A3B8] font-normal text-[11px] sm:text-xs leading-relaxed">
            Uploads operate on media credits. Current Balance:{' '}
            <strong className="font-semibold text-blue-950 dark:text-[#F8FAFC]">{totalCredits} Credits</strong>.
          </p>
        </div>
      </div>

      {/* Navigation Tabs Bar (Scrollable Strip on Mobile) */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-[#263244] pb-1 overflow-x-auto no-scrollbar touch-pan-x w-full">
        <button
          type="button"
          onClick={() => setActiveTab('recent')}
          className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'recent'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263244]'
          }`}
        >
          <Clock className="w-3.5 h-3.5" /> Recent
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('all')}
          className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263244]'
          }`}
        >
          <Layers className="w-3.5 h-3.5" /> All Media ({mediaAssets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 ${
            activeTab === 'upload'
              ? 'bg-[#2563EB] text-white shadow-2xs'
              : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#263244]'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload New
        </button>
      </div>

      {/* Search & Filter Toolbar */}
      {activeTab !== 'upload' && (
        <div className="space-y-3 font-sans text-xs w-full">
          {/* Mobile Filter & Search Bar */}
          <div className="md:hidden space-y-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3 rounded-2xl shadow-2xs">
            <Input
              placeholder="Search media..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400 dark:text-[#64748B]" />}
              className="h-10 text-xs w-full font-normal bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
            />

            {/* Quick Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 w-full">
              {['All', 'Video', 'Audio', 'Images', 'Documents'].map((folder) => (
                <button
                  key={folder}
                  type="button"
                  onClick={() => setSelectedCategory(folder)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium shrink-0 transition-colors ${
                    selectedCategory.toLowerCase() === folder.toLowerCase()
                      ? 'bg-[#2563EB] text-white dark:bg-[rgba(37,99,235,0.14)] dark:text-[#60A5FA] dark:border dark:border-[#3B82F6]'
                      : 'bg-slate-100 dark:bg-[#0F172A] text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#172033]'
                  }`}
                >
                  {folder}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] text-slate-700 dark:text-[#CBD5E1] font-medium text-xs shrink-0 transition-colors ml-auto cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:flex flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3.5 rounded-2xl shadow-2xs">
            <div className="w-72">
              <Input
                placeholder="Search media by title or format..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                leftIcon={<Search className="w-4 h-4 text-slate-400 dark:text-[#64748B]" />}
                className="font-normal bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                {['All', 'Video', 'Audio', 'Images', 'Documents'].map((folder) => (
                  <button
                    key={folder}
                    type="button"
                    onClick={() => setSelectedCategory(folder)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      selectedCategory.toLowerCase() === folder.toLowerCase()
                        ? 'bg-[#2563EB] text-white dark:bg-[rgba(37,99,235,0.14)] dark:text-[#60A5FA] dark:border dark:border-[#3B82F6] shadow-2xs'
                        : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#172033]'
                    }`}
                  >
                    {folder}
                  </button>
                ))}
              </div>

              {activeTab === 'all' && (
                <div className="flex items-center gap-1 ml-2">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                    className="h-8.5 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                  >
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="name">Name (A-Z)</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Media Assets Grid */}
      {activeTab !== 'upload' && (
        <>
          {sortedAssets.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
              {sortedAssets.map((asset) => {
                const mType = detectMediaType(asset.format, asset.name);
                const isMenuOpen = activeMenuAssetId === asset.id;

                return (
                  <Card
                    key={asset.id}
                    padding="sm"
                    className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-3 font-sans text-xs hover:border-blue-300 dark:hover:border-blue-500/40 dark:hover:bg-[#172033] transition-all shadow-2xs rounded-2xl p-3 flex flex-col justify-between min-w-0 w-full"
                  >
                    <div className="space-y-2.5 min-w-0">
                      {/* Media Card Aspect Viewport */}
                      {mType === 'image' && asset.thumbnailUrl ? (
                        <div className="relative w-full aspect-video rounded-xl bg-slate-100 dark:bg-[#0F172A] overflow-hidden border border-slate-200 dark:border-[#263244]">
                          <img
                            src={asset.thumbnailUrl}
                            alt={asset.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : mType === 'video' ? (
                        <div className="relative w-full aspect-video rounded-xl bg-slate-900 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-white">
                          <FileVideo className="w-8 h-8 text-[#2563EB] dark:text-[#60A5FA] opacity-90" />
                          <span className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/70 px-1.5 py-0.5 rounded text-white">
                            Video
                          </span>
                        </div>
                      ) : (
                        <div className="w-full h-20 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-center gap-2 text-slate-600 dark:text-[#94A3B8]">
                          {getFormatIcon(asset.format, asset.name)}
                          <span className="text-xs font-medium uppercase">{mType}</span>
                        </div>
                      )}

                      {/* Header Title & Details */}
                      <div className="flex items-start justify-between gap-2 min-w-0">
                        <div className="min-w-0 flex-1 space-y-0.5">
                          <h3
                            className="font-medium text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm leading-snug line-clamp-2 break-words"
                            title={asset.name}
                          >
                            {asset.name}
                          </h3>

                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal flex-wrap">
                            <Badge variant="neutral" size="sm" className="capitalize text-[10px] py-0 font-medium">
                              {mType}
                            </Badge>
                            <span>•</span>
                            <span className="text-slate-700 dark:text-[#CBD5E1]">{asset.sizeMb} MB</span>
                            {asset.durationMinutes && (
                              <span>• {asset.durationMinutes}m</span>
                            )}
                          </div>
                        </div>

                        {/* 3-Dot Overflow Menu */}
                        <div className="relative shrink-0">
                          <button
                            type="button"
                            onClick={() => setActiveMenuAssetId(isMenuOpen ? null : asset.id)}
                            className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#334155] shadow-xl p-1 z-20 text-left space-y-0.5 animate-in fade-in slide-in-from-top-1">
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewAsset(asset);
                                  setActiveMenuAssetId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] dark:hover:text-white rounded-lg text-left"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                                <span>Preview</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleDeleteClick(asset);
                                  setActiveMenuAssetId(null);
                                }}
                                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-[rgba(239,68,68,0.08)] rounded-lg text-left"
                              >
                                <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-[#F87171]" />
                                <span>Delete</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Metadata */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#263244] text-[10.5px] font-normal text-slate-500 dark:text-[#94A3B8]">
                      <span className="bg-slate-100 dark:bg-[#0F172A] px-2 py-0.5 rounded text-slate-700 dark:text-[#CBD5E1] font-medium border border-slate-200/60 dark:border-[#263244]">
                        {asset.folder || 'General'}
                      </span>
                      <span>
                        {activeTab === 'recent' && asset.lastUsedAt
                          ? `Used ${new Date(asset.lastUsedAt).toLocaleDateString()}`
                          : `Uploaded ${new Date(asset.uploadedAt).toLocaleDateString()}`}
                      </span>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            <EmptyState
              icon={Layers}
              title="No Media Assets Found"
              description="No assets match your search or filter. Switch filters or upload a new media file."
              actionLabel="Upload New Asset"
              onAction={() => setActiveTab('upload')}
              actionIcon={<Upload className="w-4 h-4" />}
            />
          )}
        </>
      )}

      {/* Upload New Tab View */}
      {activeTab === 'upload' && (
        <Card padding="lg" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] max-w-2xl mx-auto space-y-5 rounded-2xl shadow-2xs p-4 sm:p-6 text-left">
          <div className="border-b border-slate-100 dark:border-[#263244] pb-3 space-y-1">
            <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Upload New Asset to Media Library
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal">
              Upload media once to use across Video, Audio, Document, or Image lessons.
            </p>
          </div>

          <form onSubmit={handleUploadSubmit} className="space-y-4 font-sans text-xs text-left">
            <div>
              <label className="block font-medium text-slate-900 dark:text-[#CBD5E1] mb-1">
                File Name <span className="text-rose-500 dark:text-[#F87171]">*</span>
              </label>
              <Input
                placeholder="e.g. react19_state_management.mp4"
                value={uploadFile.name}
                onChange={(e) => setUploadFile({ ...uploadFile, name: e.target.value })}
                required
                className="h-10 text-xs font-normal bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-medium text-slate-900 dark:text-[#CBD5E1] mb-1">Format</label>
                <select
                  value={uploadFile.format}
                  onChange={(e) => setUploadFile({ ...uploadFile, format: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] font-medium text-xs"
                >
                  <option value="video/mp4">MP4 Video</option>
                  <option value="audio/mp3">MP3 Audio</option>
                  <option value="application/pdf">PDF Document</option>
                  <option value="image/png">PNG Image</option>
                  <option value="image/jpeg">JPEG Image</option>
                  <option value="application/zip">ZIP Archive</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-slate-900 dark:text-[#CBD5E1] mb-1">Size (MB)</label>
                <Input
                  type="number"
                  step="0.1"
                  value={uploadFile.sizeMb}
                  onChange={(e) => setUploadFile({ ...uploadFile, sizeMb: parseFloat(e.target.value) || 1 })}
                  required
                  className="h-10 text-xs font-normal bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC]"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-900 dark:text-[#CBD5E1] mb-1">Folder</label>
                <select
                  value={uploadFile.folder}
                  onChange={(e) => setUploadFile({ ...uploadFile, folder: e.target.value })}
                  className="w-full h-10 rounded-xl border border-slate-200 dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] font-medium text-xs"
                >
                  <option value="General">General</option>
                  <option value="Course Videos">Course Videos</option>
                  <option value="Audio Clips">Audio Clips</option>
                  <option value="Documents">Documents</option>
                  <option value="Infographics">Infographics</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-blue-50/70 dark:bg-[#0F172A] border border-blue-100 dark:border-[#334155] rounded-xl space-y-1.5 text-slate-700 dark:text-[#CBD5E1] text-xs">
              <div className="flex justify-between font-medium">
                <span>Required: <strong className="font-semibold text-blue-950 dark:text-[#F8FAFC]">{requiredCredits} Credits</strong></span>
                <span>Available: <strong className="font-semibold text-blue-950 dark:text-[#F8FAFC]">{totalCredits} Credits</strong></span>
              </div>
              {isCreditInsufficient && (
                <p className="text-rose-600 dark:text-[#F87171] font-medium flex items-center gap-1 pt-1 border-t border-blue-100 dark:border-[#263244]">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                  <span>Insufficient Credits</span>
                </p>
              )}
            </div>

            {uploadError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-xs text-rose-700 dark:text-rose-300 font-medium flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-[#263244]">
              <Button
                type="submit"
                disabled={Boolean(isCreditInsufficient)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium px-6 h-10 text-xs rounded-xl"
              >
                Confirm &amp; Upload
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* MOBILE FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="relative bg-white dark:bg-[#111827] rounded-t-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200 text-left font-sans text-xs border-t border-slate-200 dark:border-[#263244]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#263244]">
              <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-sm">Filter & Sort Media</h3>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-slate-400 dark:text-[#94A3B8] hover:text-slate-600 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1.5">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] font-medium text-xs"
              >
                {['All', 'Video', 'Audio', 'Images', 'Documents'].map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1] mb-1.5">Sort Order</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'name')}
                className="w-full h-10 rounded-xl border border-slate-200 dark:border-[#334155] px-3 bg-white dark:bg-[#0F172A] text-slate-900 dark:text-[#F8FAFC] font-medium text-xs"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
            </div>

            <Button
              onClick={() => setIsFilterSheetOpen(false)}
              className="w-full h-10 text-xs font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl mt-2"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* Asset Preview Modal */}
      <Modal
        isOpen={Boolean(previewAsset)}
        onClose={() => setPreviewAsset(null)}
        title={previewAsset?.name || 'Media Preview'}
      >
        <div className="space-y-3 text-xs font-sans text-left">
          {previewAsset && detectMediaType(previewAsset.format, previewAsset.name) === 'image' && previewAsset.thumbnailUrl ? (
            <img src={previewAsset.thumbnailUrl} alt={previewAsset.name} className="w-full rounded-xl object-contain max-h-80" />
          ) : previewAsset && detectMediaType(previewAsset.format, previewAsset.name) === 'video' ? (
            <div className="w-full min-w-0 bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden p-1">
              <video controls className="w-full max-h-80 rounded-lg dark:[color-scheme:dark]" src={previewAsset.url || previewAsset.thumbnailUrl}>
                Your browser does not support HTML video playback.
              </video>
            </div>
          ) : previewAsset && detectMediaType(previewAsset.format, previewAsset.name) === 'audio' ? (
            <div className="w-full min-w-0 bg-[#0F172A] border border-[#334155] rounded-xl p-3">
              <audio controls className="lesson-audio-player w-full min-w-0 max-w-full h-9 dark:[color-scheme:dark]" src={previewAsset.url || previewAsset.thumbnailUrl}>
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : (
            <div className="p-8 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-center space-y-2">
              {previewAsset && getFormatIcon(previewAsset.format, previewAsset.name)}
              <p className="font-semibold text-slate-900 dark:text-[#F8FAFC]">{previewAsset?.name}</p>
              <p className="text-slate-500 dark:text-[#94A3B8]">{previewAsset?.sizeMb} MB &bull; {previewAsset?.format}</p>
            </div>
          )}

          <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" onClick={() => setPreviewAsset(null)} className="h-9 text-xs font-medium border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]">
              Close Preview
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Media Asset?"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-slate-600 dark:text-[#CBD5E1] font-normal">
            Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{deleteTarget?.name}</strong> from your Media Library?
          </p>

          {deleteWarning ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-normal space-y-1">
              <div className="flex items-center gap-2 font-semibold text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Asset In Use Protection</span>
              </div>
              <p>{deleteWarning}</p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-[#94A3B8] font-normal">
              This action cannot be undone. Storage credits consumed for this upload will not be refunded.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-9 text-xs font-medium border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]">
              Cancel
            </Button>
            <Button
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium h-9 text-xs"
            >
              Confirm Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

