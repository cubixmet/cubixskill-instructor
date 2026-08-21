import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
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
  ArrowUpDown,
  CheckCircle2,
  MoreVertical,
  Eye,
  LayoutGrid,
  List as ListIcon,
  Download,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Clock,
  FileSpreadsheet,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import {
  storageService,
  MediaFileApiItem,
  StorageUsageSummary,
  StorageCurrentPeriodUsage,
  StorageMonthlyBillingStatement,
  MediaUsageReference,
  PreUploadEstimateResponse,
} from '../../../services/storage.service';
import { resolveMediaUrl, formatBytes } from '../../../utils/media.utils';
import { UploadEstimateModal } from '../../../components/media/UploadEstimateModal';

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETE' | 'FAILED';
  error?: string;
  adaptive_streaming_enabled?: boolean;
}

export const MediaPage: React.FC = () => {
  // Real State
  const [mediaAssets, setMediaAssets] = useState<MediaFileApiItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [storageUsage, setStorageUsage] = useState<StorageUsageSummary | null>(null);
  const [periodUsage, setPeriodUsage] = useState<StorageCurrentPeriodUsage | null>(null);
  const [billingStatements, setBillingStatements] = useState<StorageMonthlyBillingStatement[]>([]);
  const [isBillingModalOpen, setIsBillingModalOpen] = useState<boolean>(false);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters & Controls
  const [search, setSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [unusedOnly, setUnusedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('-created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Modals & Sliders
  const [activeMenuAssetId, setActiveMenuAssetId] = useState<string | null>(null);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [uploadQueue, setUploadQueue] = useState<UploadQueueItem[]>([]);

  // Detail & Delete Target
  const [detailAsset, setDetailAsset] = useState<MediaFileApiItem | null>(null);
  const [assetUsages, setAssetUsages] = useState<MediaUsageReference[]>([]);
  const [loadingUsages, setLoadingUsages] = useState<boolean>(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const [editingDisplayName, setEditingDisplayName] = useState<string>('');
  const [savingDisplayName, setSavingDisplayName] = useState<boolean>(false);

  const [deleteTarget, setDeleteTarget] = useState<MediaFileApiItem | null>(null);
  const [deleteUsages, setDeleteUsages] = useState<MediaUsageReference[]>([]);
  const [deleting, setDeleting] = useState<boolean>(false);

  // Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch Media List
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await storageService.getMediaFiles({
        search,
        media_type: selectedCategory,
        ordering: sortBy,
        unused_only: unusedOnly,
        page,
        page_size: pageSize,
      });
      setMediaAssets(res.results);
      setTotalCount(res.count);
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Unable to load Media Library assets. Please retry.');
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory, sortBy, unusedOnly, page]);

  // Fetch Storage Usage & Billing Period
  const fetchStorageUsage = useCallback(async () => {
    try {
      const summary = await storageService.getStorageUsage();
      setStorageUsage(summary);
    } catch (err) {
      console.warn('Failed to load storage usage summary:', err);
    }
    try {
      const pUsage = await storageService.getCurrentPeriodUsage();
      setPeriodUsage(pUsage);
    } catch (err) {
      console.warn('Failed to load period usage:', err);
    }
  }, []);

  const fetchBillingStatements = async () => {
    try {
      const stmts = await storageService.getMonthlyBillings();
      setBillingStatements(stmts);
    } catch (err) {
      console.warn('Failed to load billing statements:', err);
    }
  };

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    fetchStorageUsage();
  }, [fetchStorageUsage]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
  };

  // Open Detail Panel & Fetch References
  const handleOpenDetail = async (asset: MediaFileApiItem) => {
    setDetailAsset(asset);
    setEditingDisplayName(asset.display_name || asset.original_filename);
    setAssetUsages([]);
    setUsageError(null);
    setLoadingUsages(true);
    try {
      const usageRes = await storageService.getMediaUsage(asset.id);
      setAssetUsages(usageRes.references || []);
    } catch (err: any) {
      setUsageError(err?.response?.data?.message || 'Unable to load asset usage details.');
    } finally {
      setLoadingUsages(false);
    }
  };

  // Save Renamed Display Name
  const handleSaveDisplayName = async () => {
    if (!detailAsset || !editingDisplayName.trim()) return;
    try {
      setSavingDisplayName(true);
      const updated = await storageService.updateMediaFile(detailAsset.id, {
        display_name: editingDisplayName.trim(),
      });
      setDetailAsset(updated);
      setMediaAssets((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      showToast('Display name updated successfully.');
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to update display name.');
    } finally {
      setSavingDisplayName(false);
    }
  };

  // Delete Click Handlers
  const handleDeleteClick = async (asset: MediaFileApiItem) => {
    setDeleteTarget(asset);
    setActiveMenuAssetId(null);
    setDeleteUsages([]);
    try {
      const usageRes = await storageService.getMediaUsage(asset.id);
      setDeleteUsages(usageRes.references || []);
    } catch (err) {
      console.warn('Failed to fetch delete usages:', err);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await storageService.deleteMediaFile(deleteTarget.id, deleteUsages.length > 0);
      showToast(`Deleted "${deleteTarget.display_name || deleteTarget.original_filename}" successfully.`);
      setDeleteTarget(null);
      if (detailAsset?.id === deleteTarget.id) {
        setDetailAsset(null);
      }
      fetchMedia();
      fetchStorageUsage();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to delete media asset.');
    } finally {
      setDeleting(false);
    }
  };

  // Pre-Upload Cost Estimate Modal State
  const [estimateModalOpen, setEstimateModalOpen] = useState<boolean>(false);
  const [pendingUploadFiles, setPendingUploadFiles] = useState<File[]>([]);
  const [estimateData, setEstimateData] = useState<PreUploadEstimateResponse | null>(null);
  const [estimating, setEstimating] = useState<boolean>(false);
  const [adaptiveStreamingEnabled, setAdaptiveStreamingEnabled] = useState<boolean>(true);

  const fetchEstimate = async (files: File[], isAdaptiveOn: boolean) => {
    if (!files || files.length === 0) return;
    const firstFile = files[0];
    setEstimating(true);

    try {
      let durationSeconds: number | undefined;
      let width: number | undefined;
      let height: number | undefined;

      if (firstFile.type.startsWith('video/')) {
        try {
          const videoElement = document.createElement('video');
          videoElement.preload = 'metadata';
          videoElement.src = URL.createObjectURL(firstFile);
          await new Promise((res) => {
            videoElement.onloadedmetadata = () => {
              durationSeconds = videoElement.duration;
              width = videoElement.videoWidth;
              height = videoElement.videoHeight;
              URL.revokeObjectURL(videoElement.src);
              res(true);
            };
            videoElement.onerror = () => res(false);
          });
        } catch {
          // Fallback if client metadata fails
        }
      }

      const est = await storageService.estimateUpload({
        filename: firstFile.name,
        file_size_bytes: firstFile.size,
        mime_type: firstFile.type,
        duration_seconds: durationSeconds,
        width,
        height,
        adaptive_streaming_enabled: isAdaptiveOn
      });
      setEstimateData(est);
    } catch (err) {
      console.warn('Failed to calculate pre-upload estimate:', err);
      showToast('Unable to calculate storage estimate. Uploading directly...');
      handleConfirmUploadFiles(files, isAdaptiveOn);
      setEstimateModalOpen(false);
    } finally {
      setEstimating(false);
    }
  };

  // File Upload Handlers
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const files = Array.from(e.target.files);

    setPendingUploadFiles(files);
    setEstimateData(null);
    setAdaptiveStreamingEnabled(true);
    setEstimateModalOpen(true);

    await fetchEstimate(files, true);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleToggleAdaptiveStreaming = async (enabled: boolean) => {
    setAdaptiveStreamingEnabled(enabled);
    if (pendingUploadFiles.length > 0) {
      await fetchEstimate(pendingUploadFiles, enabled);
    }
  };

  const handleConfirmUploadFiles = (files: File[], isAdaptiveOn: boolean = adaptiveStreamingEnabled) => {
    const newItems: UploadQueueItem[] = files.map((file) => ({
      id: `${file.name}-${Date.now()}-${Math.random()}`,
      file,
      progress: 0,
      status: 'QUEUED',
      adaptive_streaming_enabled: isAdaptiveOn,
    }));
    setUploadQueue((prev) => [...prev, ...newItems]);
    setIsUploadModalOpen(true);
    setEstimateModalOpen(false);
    setPendingUploadFiles([]);
    setEstimateData(null);
  };

  // Process Upload Queue sequentially
  useEffect(() => {
    const processQueue = async () => {
      const pendingIndex = uploadQueue.findIndex((item) => item.status === 'QUEUED');
      if (pendingIndex === -1) return;

      const currentItem = uploadQueue[pendingIndex];

      setUploadQueue((prev) =>
        prev.map((item, idx) => (idx === pendingIndex ? { ...item, status: 'UPLOADING', progress: 5 } : item))
      );

      try {
        await storageService.uploadFile(currentItem.file, {
          adaptive_streaming_enabled: currentItem.adaptive_streaming_enabled,
          onProgress: (pct) => {
            setUploadQueue((prev) =>
              prev.map((item, idx) => (idx === pendingIndex ? { ...item, progress: Math.max(5, pct) } : item))
            );
          }
        });

        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === pendingIndex ? { ...item, status: 'COMPLETE', progress: 100 } : item))
        );

        showToast(`Uploaded "${currentItem.file.name}" successfully!`);
        fetchMedia();
        fetchStorageUsage();
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err?.message || 'Upload failed.';
        setUploadQueue((prev) =>
          prev.map((item, idx) => (idx === pendingIndex ? { ...item, status: 'FAILED', error: errorMsg } : item))
        );
      }
    };

    processQueue();
  }, [uploadQueue, fetchMedia, fetchStorageUsage]);

  const copyToClipboard = (text: string, label: string = 'URL') => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  const getFormatIcon = (mime: string, _name: string, typeStr: string) => {
    const t = (typeStr || '').toUpperCase();
    const m = (mime || '').toLowerCase();
    if (t === 'VIDEO' || m.includes('video')) return <FileVideo className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />;
    if (t === 'AUDIO' || m.includes('audio')) return <FileAudio className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
    if (t === 'IMAGE' || m.includes('image')) return <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
    if (t === 'DOCUMENT' || m.includes('pdf') || m.includes('doc')) return <FileText className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
    return <FileCode className="w-4 h-4 text-slate-600 dark:text-[#94A3B8]" />;
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const usedBytes = storageUsage?.used_bytes || 0;

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 dark:bg-[#1E293B] text-white dark:text-[#F8FAFC] text-xs font-medium rounded-2xl shadow-2xl border border-slate-800 dark:border-[#334155] flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileSelect}
        multiple
        className="hidden"
      />

      {/* Header */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-[#F8FAFC] tracking-tight">
                Academy Media Library
              </h1>
              <Badge variant="info" size="sm" className="font-medium shrink-0 text-[10px]">
                {totalCount} Assets
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed">
              Centralized local asset storage. Upload once and reference seamlessly across your courses and lessons.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                fetchBillingStatements();
                setIsBillingModalOpen(true);
              }}
              className="h-[38px] min-h-[38px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-blue-600" />
              <span>Billing History</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                fetchMedia();
                fetchStorageUsage();
              }}
              className="h-[38px] min-h-[38px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-medium text-xs px-3.5 sm:px-4 rounded-xl hover:bg-[#1D4ED8] shrink-0 flex items-center justify-center gap-1.5 shadow-2xs"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Media
            </Button>
          </div>
        </div>
      </Card>

      {/* Simplified Storage & Monthly Metering Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
        {/* Real Storage Used */}
        <div className="p-3.5 sm:p-4 bg-blue-50/70 dark:bg-[#0F172A] border border-blue-200/80 dark:border-[#334155] rounded-2xl flex items-center justify-between text-xs text-blue-900 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA]">
              <HardDrive className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">Current Media Storage</div>
              <span className="font-semibold text-sm text-blue-950 dark:text-[#F8FAFC]">
                Storage Used: {storageUsage?.used_display || formatBytes(usedBytes)}
              </span>
            </div>
          </div>
          <span className="text-[11px] font-normal text-blue-800 dark:text-[#94A3B8]">
            {storageUsage?.total_files_count || totalCount} Active Files
          </span>
        </div>

        {/* This Month Event-Driven Usage & Estimated Billing */}
        <div className="p-3.5 sm:p-4 bg-indigo-50/70 dark:bg-[#0F172A] border border-indigo-200/80 dark:border-[#334155] rounded-2xl flex items-center justify-between text-xs text-indigo-900 dark:text-[#CBD5E1]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8]">
                Storage Billing — {periodUsage?.billing_period || 'This Month'}
              </div>
              <span className="font-semibold text-sm text-indigo-950 dark:text-[#F8FAFC]">
                Usage: {periodUsage?.gb_days || '0.00'} GB-days &bull; Est. Credits: {periodUsage?.estimated_credits || '0.00'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              fetchBillingStatements();
              setIsBillingModalOpen(true);
            }}
            className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
          >
            Statements &rarr;
          </button>
        </div>
      </div>

      {/* Toolbar: Search, Filters, View Modes */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3.5 rounded-2xl shadow-2xs font-sans text-xs">
        {/* Search */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search files by name..."
            value={search}
            onChange={handleSearchChange}
            leftIcon={<Search className="w-4 h-4 text-slate-400 dark:text-[#64748B]" />}
            className="font-normal bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
          />
        </div>

        {/* Category Pills & Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'IMAGE', label: 'Images' },
              { id: 'VIDEO', label: 'Videos' },
              { id: 'AUDIO', label: 'Audio' },
              { id: 'DOCUMENT', label: 'Documents' },
            ].map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat.id);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-[#2563EB] text-white dark:bg-[rgba(37,99,235,0.14)] dark:text-[#60A5FA] dark:border dark:border-[#3B82F6] shadow-2xs'
                    : 'bg-slate-100 dark:bg-[#0F172A] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#172033]'
                }`}
              >
                {cat.label}
              </button>
            ))}

            <button
              type="button"
              onClick={() => {
                setUnusedOnly(!unusedOnly);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${
                unusedOnly
                  ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                  : 'bg-slate-50 dark:bg-[#0F172A] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]'
              }`}
            >
              Unused Only
            </button>
          </div>

          {/* Sort Order */}
          <div className="flex items-center gap-1">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-[#94A3B8]" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-8.5 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
            >
              <option value="-created_at">Newest First</option>
              <option value="created_at">Oldest First</option>
              <option value="original_filename">Name (A-Z)</option>
              <option value="-original_filename">Name (Z-A)</option>
              <option value="-size_bytes">Size (Largest)</option>
              <option value="size_bytes">Size (Smallest)</option>
            </select>
          </div>

          {/* Grid vs List View Toggle */}
          <div className="flex items-center gap-1 border-l border-slate-200 dark:border-[#334155] pl-2">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172033]'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'text-slate-400 hover:text-slate-700 dark:text-[#94A3B8] hover:bg-slate-100 dark:hover:bg-[#172033]'
              }`}
              title="List View"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="p-12 text-center text-slate-500 dark:text-[#94A3B8] font-medium text-xs space-y-2">
          <RefreshCw className="w-6 h-6 animate-spin mx-auto text-[#2563EB]" />
          <p>Loading Academy Media Library...</p>
        </div>
      ) : error ? (
        <Card padding="lg" className="bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-center space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-600 dark:text-rose-400 mx-auto" />
          <p className="text-xs text-rose-800 dark:text-rose-300 font-medium">{error}</p>
          <Button size="sm" onClick={fetchMedia} className="bg-rose-600 hover:bg-rose-700 text-white font-medium text-xs">
            Retry Loading
          </Button>
        </Card>
      ) : mediaAssets.length === 0 ? (
        <EmptyState
          icon={HardDrive}
          title="No media files yet."
          description="Upload images, videos, PDFs, and audio files to store in your central Media Library and reuse across your Academy."
          actionLabel="Upload Media"
          onAction={() => fileInputRef.current?.click()}
          actionIcon={<Upload className="w-4 h-4" />}
        />
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 w-full min-w-0">
          {mediaAssets.map((asset) => {
            const resolvedUrl = resolveMediaUrl(asset.url);
            const isMenuOpen = activeMenuAssetId === asset.id;
            const displayName = asset.display_name || asset.original_filename;

            return (
              <Card
                key={asset.id}
                padding="sm"
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] space-y-3 font-sans text-xs hover:border-blue-300 dark:hover:border-blue-500/40 dark:hover:bg-[#172033] transition-all shadow-2xs rounded-2xl p-3 flex flex-col justify-between min-w-0 w-full"
              >
                <div className="space-y-2.5 min-w-0">
                  {/* Viewport */}
                  {asset.media_type === 'IMAGE' ? (
                    <div
                      onClick={() => handleOpenDetail(asset)}
                      className="relative w-full aspect-video rounded-xl bg-slate-100 dark:bg-[#0F172A] overflow-hidden border border-slate-200 dark:border-[#263244] cursor-pointer group"
                    >
                      <img
                        src={resolvedUrl}
                        alt={displayName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                  ) : asset.media_type === 'VIDEO' ? (
                    <div
                      onClick={() => handleOpenDetail(asset)}
                      className="relative w-full aspect-video rounded-xl bg-slate-900 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] flex items-center justify-center text-white cursor-pointer group"
                    >
                      <FileVideo className="w-8 h-8 text-[#2563EB] dark:text-[#60A5FA] opacity-90 group-hover:scale-110 transition-transform" />
                      <span className="absolute bottom-2 right-2 text-[10px] font-medium bg-black/70 px-1.5 py-0.5 rounded text-white">
                        Video
                      </span>
                    </div>
                  ) : (
                    <div
                      onClick={() => handleOpenDetail(asset)}
                      className="w-full h-20 bg-slate-50 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] flex items-center justify-center gap-2 text-slate-600 dark:text-[#94A3B8] cursor-pointer hover:bg-slate-100 dark:hover:bg-[#172033]"
                    >
                      {getFormatIcon(asset.mime_type, asset.original_filename, asset.media_type)}
                      <span className="text-xs font-medium uppercase">{asset.media_type}</span>
                    </div>
                  )}

                  {/* Asset Header Info */}
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="min-w-0 flex-1 space-y-0.5" onClick={() => handleOpenDetail(asset)}>
                      <h3
                        className="font-medium text-slate-900 dark:text-[#F8FAFC] text-xs sm:text-sm leading-snug line-clamp-2 break-words hover:text-[#2563EB] cursor-pointer"
                        title={displayName}
                      >
                        {displayName}
                      </h3>

                      <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-[#94A3B8] font-normal flex-wrap">
                        <Badge variant="neutral" size="sm" className="capitalize text-[10px] py-0 font-medium">
                          {asset.media_type}
                        </Badge>
                        <span>•</span>
                        <span className="text-slate-700 dark:text-[#CBD5E1]">{formatBytes(asset.size_bytes)}</span>
                      </div>
                    </div>

                    {/* Menu Button */}
                    <div className="relative shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveMenuAssetId(isMenuOpen ? null : asset.id)}
                        className="p-1 rounded-lg text-slate-400 dark:text-[#94A3B8] hover:text-slate-700 dark:hover:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 mt-1 w-44 bg-white dark:bg-[#111827] rounded-xl border border-slate-200 dark:border-[#334155] shadow-xl p-1 z-20 text-left space-y-0.5 animate-in fade-in slide-in-from-top-1">
                          <button
                            type="button"
                            onClick={() => {
                              handleOpenDetail(asset);
                              setActiveMenuAssetId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg text-left"
                          >
                            <Eye className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" />
                            <span>Preview &amp; Details</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              copyToClipboard(resolvedUrl, 'Media URL');
                              setActiveMenuAssetId(null);
                            }}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg text-left"
                          >
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copy URL</span>
                          </button>

                          <a
                            href={resolvedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={asset.original_filename}
                            onClick={() => setActiveMenuAssetId(null)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-lg text-left"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Download</span>
                          </a>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(asset)}
                            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-rose-600 dark:text-[#F87171]" />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#263244] text-[10.5px] font-normal text-slate-500 dark:text-[#94A3B8]">
                  <span>{asset.file_extension ? `.${asset.file_extension}` : asset.mime_type}</span>
                  <span>{new Date(asset.created_at).toLocaleDateString()}</span>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <Card padding="none" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] overflow-hidden rounded-2xl shadow-2xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left font-sans text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Size</th>
                  <th className="py-3 px-4">Uploaded</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#263244]">
                {mediaAssets.map((asset) => {
                  const resolvedUrl = resolveMediaUrl(asset.url);
                  const displayName = asset.display_name || asset.original_filename;

                  return (
                    <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {getFormatIcon(asset.mime_type, asset.original_filename, asset.media_type)}
                          <div className="min-w-0">
                            <p
                              onClick={() => handleOpenDetail(asset)}
                              className="font-medium text-slate-900 dark:text-[#F8FAFC] hover:text-[#2563EB] cursor-pointer truncate max-w-xs sm:max-w-md"
                              title={displayName}
                            >
                              {displayName}
                            </p>
                            <p className="text-[10.5px] text-slate-400 dark:text-[#64748B] truncate">{asset.original_filename}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="neutral" size="sm" className="capitalize text-[10px]">
                          {asset.media_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-[#CBD5E1]">{formatBytes(asset.size_bytes)}</td>
                      <td className="py-3 px-4 text-slate-500 dark:text-[#94A3B8]">
                        {new Date(asset.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenDetail(asset)}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] hover:bg-slate-100 dark:hover:bg-[#172033]"
                            title="Preview & Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => copyToClipboard(resolvedUrl, 'URL')}
                            className="p-1.5 rounded-lg text-slate-500 dark:text-[#94A3B8] hover:text-[#2563EB] hover:bg-slate-100 dark:hover:bg-[#172033]"
                            title="Copy URL"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(asset)}
                            className="p-1.5 rounded-lg text-rose-600 dark:text-[#F87171] hover:bg-rose-50 dark:hover:bg-rose-950/40"
                            title="Delete File"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-[#263244] text-xs text-slate-600 dark:text-[#CBD5E1]">
          <span>
            Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} of {totalCount} assets
          </span>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="h-8.5 px-3 border-slate-200 dark:border-[#334155]"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Prev
            </Button>
            <span className="font-semibold text-slate-900 dark:text-[#F8FAFC]">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="h-8.5 px-3 border-slate-200 dark:border-[#334155]"
            >
              Next <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* STORAGE BILLING HISTORY MODAL */}
      <Modal
        isOpen={isBillingModalOpen}
        onClose={() => setIsBillingModalOpen(false)}
        title="Monthly Storage Billing Statements"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-slate-600 dark:text-[#CBD5E1] font-normal">
            Storage billing is calculated time-weighted based on actual stored bytes over time. Deducting credits monthly.
          </p>

          <div className="max-h-72 overflow-y-auto space-y-2 border border-slate-200 dark:border-[#334155] rounded-xl p-3 bg-slate-50 dark:bg-[#0F172A]">
            {billingStatements.length > 0 ? (
              billingStatements.map((stmt) => (
                <div key={stmt.id} className="p-3 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#263244] space-y-1">
                  <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-[#F8FAFC]">
                    <span>Statement Month: {stmt.billing_period}</span>
                    <Badge variant={stmt.status === 'CHARGED' ? 'success' : stmt.status === 'INSUFFICIENT_CREDITS' ? 'warning' : 'neutral'} size="sm">
                      {stmt.status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-[#CBD5E1] pt-1">
                    <div>Usage: <strong>{stmt.billable_units_gb_month} GB-month</strong></div>
                    <div>Charged: <strong>{stmt.credits_charged} Credits</strong></div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-slate-500 dark:text-[#94A3B8] text-[11px] text-center py-4">
                No past billing statements recorded yet.
              </p>
            )}
          </div>

          <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button size="sm" onClick={() => setIsBillingModalOpen(false)} className="bg-[#2563EB] text-white">
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* MULTI-FILE UPLOAD PROGRESS MODAL */}
      <Modal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        title="Upload Media Files"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-slate-600 dark:text-[#CBD5E1] font-normal">
            Real multipart upload to local storage. Files are saved atomically into your Academy Media Library.
          </p>

          <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 dark:border-[#334155] rounded-xl p-3 bg-slate-50 dark:bg-[#0F172A]">
            {uploadQueue.map((item) => (
              <div key={item.id} className="p-2.5 bg-white dark:bg-[#111827] rounded-lg border border-slate-200 dark:border-[#263244] space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-900 dark:text-[#F8FAFC] truncate max-w-xs" title={item.file.name}>
                    {item.file.name} ({formatBytes(item.file.size)})
                  </span>
                  <span className="text-[11px] font-semibold">
                    {item.status === 'COMPLETE' ? (
                      <span className="text-emerald-600 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Complete
                      </span>
                    ) : item.status === 'FAILED' ? (
                      <span className="text-rose-600 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Failed
                      </span>
                    ) : item.status === 'UPLOADING' ? (
                      <span className="text-blue-600">{item.progress}%</span>
                    ) : (
                      <span className="text-slate-400">Queued</span>
                    )}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-1.5 bg-slate-100 dark:bg-[#1E293B] rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      item.status === 'COMPLETE'
                        ? 'bg-emerald-500'
                        : item.status === 'FAILED'
                        ? 'bg-rose-500'
                        : 'bg-[#2563EB]'
                    }`}
                    style={{ width: `${item.progress}%` }}
                  />
                </div>

                {item.error && <p className="text-[11px] text-rose-600 font-normal">{item.error}</p>}
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
            >
              + Add More Files
            </Button>
            <Button
              size="sm"
              onClick={() => setIsUploadModalOpen(false)}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white"
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* ASSET DETAIL & PREVIEW MODAL */}
      <Modal
        isOpen={Boolean(detailAsset)}
        onClose={() => setDetailAsset(null)}
        title={detailAsset?.display_name || detailAsset?.original_filename || 'Media Detail'}
      >
        {detailAsset && (
          <div className="space-y-4 text-xs font-sans text-left">
            {/* Preview Box */}
            <div className="w-full bg-[#0F172A] border border-[#334155] rounded-xl overflow-hidden flex items-center justify-center p-2 min-h-48">
              {detailAsset.media_type === 'IMAGE' ? (
                <img
                  src={resolveMediaUrl(detailAsset.url)}
                  alt={detailAsset.display_name}
                  className="max-h-72 object-contain rounded-lg"
                />
              ) : detailAsset.media_type === 'VIDEO' ? (
                <video controls className="w-full max-h-72 rounded-lg" src={resolveMediaUrl(detailAsset.url)}>
                  Your browser does not support HTML video.
                </video>
              ) : detailAsset.media_type === 'AUDIO' ? (
                <div className="w-full p-4 space-y-2 text-center">
                  <FileAudio className="w-10 h-10 text-indigo-400 mx-auto" />
                  <audio controls className="w-full h-10" src={resolveMediaUrl(detailAsset.url)}>
                    Your browser does not support HTML audio.
                  </audio>
                </div>
              ) : (
                <div className="p-8 text-center space-y-2 text-slate-300">
                  {getFormatIcon(detailAsset.mime_type, detailAsset.original_filename, detailAsset.media_type)}
                  <p className="font-semibold text-white">{detailAsset.original_filename}</p>
                  <p className="text-slate-400">{formatBytes(detailAsset.size_bytes)} &bull; {detailAsset.mime_type}</p>
                </div>
              )}
            </div>

            {/* Editable Display Name */}
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl space-y-2">
              <label className="block font-medium text-slate-700 dark:text-[#CBD5E1]">Display Name</label>
              <div className="flex items-center gap-2">
                <Input
                  value={editingDisplayName}
                  onChange={(e) => setEditingDisplayName(e.target.value)}
                  className="h-9 text-xs font-normal bg-white dark:bg-[#111827]"
                />
                <Button
                  size="sm"
                  disabled={savingDisplayName || !editingDisplayName.trim()}
                  onClick={handleSaveDisplayName}
                  className="h-9 bg-[#2563EB] text-white shrink-0"
                >
                  {savingDisplayName ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Metadata Table */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-[#CBD5E1] p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl">
              <div><strong>Original File:</strong> {detailAsset.original_filename}</div>
              <div><strong>MIME Type:</strong> {detailAsset.mime_type}</div>
              <div><strong>Size:</strong> {formatBytes(detailAsset.size_bytes)}</div>
              <div><strong>Storage Key:</strong> {detailAsset.storage_key}</div>
              <div className="col-span-2"><strong>Uploaded Date:</strong> {new Date(detailAsset.created_at).toLocaleString()}</div>
              {detailAsset.media_type === 'VIDEO' && (
                <div className="col-span-2 pt-1.5 border-t border-slate-200 dark:border-[#334155] flex items-center justify-between">
                  <span><strong>Adaptive Streaming:</strong></span>
                  {detailAsset.adaptive_streaming_enabled ? (
                    <span className="text-indigo-600 font-bold">
                      {detailAsset.processing_status === 'PROCESSING' || detailAsset.processing_status === 'QUEUED'
                        ? 'Preparing adaptive streaming...'
                        : 'Adaptive Streaming Ready'}
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium">Disabled (Original Video Only)</span>
                  )}
                </div>
              )}
            </div>

            {/* Usage References (Used In Section) */}
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl space-y-2">
              <h4 className="font-semibold text-slate-900 dark:text-[#F8FAFC]">Used In</h4>
              {loadingUsages ? (
                <p className="text-slate-400 text-[11px] flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Checking usage references...
                </p>
              ) : usageError ? (
                <div className="text-rose-600 text-[11px] space-y-1">
                  <p>Unable to load usage information.</p>
                  <Button size="xs" variant="outline" onClick={() => handleOpenDetail(detailAsset)}>
                    Retry
                  </Button>
                </div>
              ) : assetUsages.length > 0 ? (
                <ul className="space-y-1 text-[11px]">
                  {assetUsages.map((u, i) => (
                    <li key={i} className="flex items-center justify-between text-slate-700 dark:text-[#CBD5E1] bg-white dark:bg-[#111827] p-2 rounded-lg border border-slate-200 dark:border-[#263244]">
                      <span>📌 <strong>{u.type}:</strong> {u.title}</span>
                      <span className="text-slate-500 font-medium">{u.context}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-[#94A3B8] text-[11px]">
                  Not currently used anywhere.
                </p>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-[#263244]">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(resolveMediaUrl(detailAsset.url), 'Media URL')}
                  className="h-9 border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
                >
                  <Copy className="w-3.5 h-3.5 mr-1" /> Copy URL
                </Button>
                <a
                  href={resolveMediaUrl(detailAsset.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  download={detailAsset.original_filename}
                  className="h-9 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </a>
              </div>

              <Button
                size="sm"
                onClick={() => handleDeleteClick(detailAsset)}
                className="h-9 bg-rose-600 hover:bg-rose-700 text-white"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Asset
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE SAFETY CONFIRMATION MODAL */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Media Asset?"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-slate-600 dark:text-[#CBD5E1] font-normal">
            Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{deleteTarget?.display_name || deleteTarget?.original_filename}</strong> from your Media Library?
          </p>

          {deleteUsages.length > 0 ? (
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-800 dark:text-rose-300 font-normal space-y-2">
              <div className="flex items-center gap-2 font-semibold text-rose-900 dark:text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Asset In Use Protection Warning</span>
              </div>
              <p>
                This asset is currently referenced in <strong>{deleteUsages.length} place(s)</strong>:
              </p>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                {deleteUsages.map((u, i) => (
                  <li key={i}>
                    {u.type}: {u.title} ({u.context})
                  </li>
                ))}
              </ul>
              <p className="text-[11px] font-semibold pt-1">
                Deleting this asset will remove the file from storage and clear its references.
              </p>
            </div>
          ) : (
            <p className="text-slate-500 dark:text-[#94A3B8] font-normal">
              This file is unused and will be safely removed from database and storage.
            </p>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-[#263244]">
            <Button variant="outline" onClick={() => setDeleteTarget(null)} className="h-9 text-xs font-medium border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]">
              Cancel
            </Button>
            <Button
              disabled={deleting}
              onClick={handleConfirmDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white font-medium h-9 text-xs"
            >
              {deleting ? 'Deleting...' : deleteUsages.length > 0 ? 'Force Delete' : 'Confirm Delete'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* PRE-UPLOAD COST ESTIMATION MODAL */}
      <UploadEstimateModal
        isOpen={estimateModalOpen}
        estimate={estimateData}
        isLoading={estimating}
        adaptiveStreamingEnabled={adaptiveStreamingEnabled}
        onToggleAdaptiveStreaming={handleToggleAdaptiveStreaming}
        onConfirm={() => handleConfirmUploadFiles(pendingUploadFiles)}
        onCancel={() => {
          setEstimateModalOpen(false);
          setPendingUploadFiles([]);
          setEstimateData(null);
        }}
      />
    </div>
  );
};
