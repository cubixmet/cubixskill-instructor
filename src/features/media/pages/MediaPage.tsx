import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Calendar,
  Layers,
  Activity,
  CreditCard,
  X,
  Info,
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
  StorageSummaryDashboard,
  StorageMeterLogItem,
  StorageSettlementItem,
} from '../../../services/storage.service';
import { resolveMediaUrl, formatBytes, formatMediaDate, formatMediaDateTime } from '../../../utils/media.utils';
import { UploadEstimateModal } from '../../../components/media/UploadEstimateModal';
import { LessonVideoPlayer } from '../../../components/media/LessonVideoPlayer';

interface UploadQueueItem {
  id: string;
  file: File;
  progress: number;
  status: 'QUEUED' | 'UPLOADING' | 'COMPLETE' | 'FAILED';
  error?: string;
  adaptive_streaming_enabled?: boolean;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export const MediaPage: React.FC = () => {
  const navigate = useNavigate();
  const currentNow = new Date();

  // Media Library State
  const [mediaAssets, setMediaAssets] = useState<MediaFileApiItem[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Search Debounce & Filters
  const [searchInput, setSearchInput] = useState<string>('');
  const [debouncedSearch, setDebouncedSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [unusedOnly, setUnusedOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('-created_at');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [page, setPage] = useState<number>(1);
  const pageSize = 12;

  // Storage Summary State
  const [summaryData, setSummaryData] = useState<StorageSummaryDashboard | null>(null);
  const [summaryLoading, setSummaryLoading] = useState<boolean>(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  // Storage Meter Logs State
  const [meterLogs, setMeterLogs] = useState<StorageMeterLogItem[]>([]);
  const [meterLogsCount, setMeterLogsCount] = useState<number>(0);
  const [meterLogsPage, setMeterLogsPage] = useState<number>(1);
  const [meterLogsMonth, setMeterLogsMonth] = useState<number>(currentNow.getMonth() + 1);
  const [meterLogsYear, setMeterLogsYear] = useState<number>(currentNow.getFullYear());
  const [meterLogsLoading, setMeterLogsLoading] = useState<boolean>(true);
  const [meterLogsError, setMeterLogsError] = useState<string | null>(null);

  // Storage Settlement History State
  const [settlements, setSettlements] = useState<StorageSettlementItem[]>([]);
  const [settlementsCount, setSettlementsCount] = useState<number>(0);
  const [settlementsPeriodLabel, setSettlementsPeriodLabel] = useState<string>('');
  const [settlementsCreditsDebited, setSettlementsCreditsDebited] = useState<string>('0.0000');
  const [settlementsPage, setSettlementsPage] = useState<number>(1);
  const [settlementsMonth, setSettlementsMonth] = useState<number>(currentNow.getMonth() + 1);
  const [settlementsYear, setSettlementsYear] = useState<number>(currentNow.getFullYear());
  const [settlementsLoading, setSettlementsLoading] = useState<boolean>(true);
  const [settlementsError, setSettlementsError] = useState<string | null>(null);

  const [selectedSettlementDetail, setSelectedSettlementDetail] = useState<StorageSettlementItem | null>(null);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState<boolean>(false);

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

  // Search Debounce Effect (350ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchInput);
      setPage(1);
    }, 350);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch Media List
  const fetchMedia = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await storageService.getMediaFiles({
        search: debouncedSearch,
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
  }, [debouncedSearch, selectedCategory, sortBy, unusedOnly, page]);

  // Fetch Storage Summary
  const fetchSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setSummaryError(null);
      const res = await storageService.getSummaryDashboard();
      setSummaryData(res);
    } catch (err: any) {
      setSummaryError(err?.response?.data?.message || 'Unable to load storage usage summary.');
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  // Fetch Storage Meter Logs
  const fetchMeterLogs = useCallback(async () => {
    try {
      setMeterLogsLoading(true);
      setMeterLogsError(null);
      const res = await storageService.getMeterLogs({
        page: meterLogsPage,
        page_size: 25,
        month: meterLogsMonth,
        year: meterLogsYear,
      });
      setMeterLogs(res.results);
      setMeterLogsCount(res.count);
    } catch (err: any) {
      setMeterLogsError(err?.response?.data?.message || 'Unable to load storage usage logs.');
    } finally {
      setMeterLogsLoading(false);
    }
  }, [meterLogsPage, meterLogsMonth, meterLogsYear]);

  const [settlementsStorageBilled, setSettlementsStorageBilled] = useState<string>('0.0000');
  const [settlementsCreditsPaid, setSettlementsCreditsPaid] = useState<string>('0.0000');
  const [settlementsOutstanding, setSettlementsOutstanding] = useState<string>('0.0000');

  // Fetch Storage Settlement History
  const fetchSettlements = useCallback(async () => {
    try {
      setSettlementsLoading(true);
      setSettlementsError(null);
      const res = await storageService.getSettlements({
        page: settlementsPage,
        page_size: 25,
        month: settlementsMonth,
        year: settlementsYear,
      });
      setSettlements(res.results);
      setSettlementsCount(res.count);
      setSettlementsPeriodLabel(res.period_label);
      setSettlementsCreditsDebited(res.credits_debited);
      setSettlementsStorageBilled(res.storage_billed || '0.0000');
      setSettlementsCreditsPaid(res.credits_paid || res.credits_debited || '0.0000');
      setSettlementsOutstanding(res.outstanding || '0.0000');
    } catch (err: any) {
      setSettlementsError(err?.response?.data?.message || 'Unable to load storage credit settlements.');
    } finally {
      setSettlementsLoading(false);
    }
  }, [settlementsPage, settlementsMonth, settlementsYear]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  useEffect(() => {
    fetchSummary();
    const interval = setInterval(() => {
      fetchSummary();
      fetchMeterLogs();
    }, 10000);
    return () => clearInterval(interval);
  }, [fetchSummary, fetchMeterLogs]);

  useEffect(() => {
    fetchMeterLogs();
  }, [fetchMeterLogs]);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  // Refetch summary & meter logs after upload / delete sync
  const refreshAllStorageData = () => {
    fetchMedia();
    fetchSummary();
    fetchMeterLogs();
    fetchSettlements();
  };

  // Polling for in-progress video transcoding tasks
  useEffect(() => {
    const hasProcessingVideos = mediaAssets.some(
      (asset) =>
        asset.media_type === 'VIDEO' &&
        (asset.processing_status === 'PROCESSING' || asset.processing_status === 'QUEUED')
    );

    if (!hasProcessingVideos) return;

    const interval = setInterval(() => {
      fetchMedia();
    }, 5000);

    return () => clearInterval(interval);
  }, [mediaAssets, fetchMedia]);

  // Polling for 10_SECONDS DEBUG mode
  useEffect(() => {
    const intervalStr = summaryData?.metering_interval || summaryData?.billing_interval;
    if (intervalStr !== '10_SECONDS') return;

    const interval = setInterval(() => {
      fetchSummary();
      fetchMeterLogs();
    }, 10000);

    return () => clearInterval(interval);
  }, [summaryData, fetchSummary, fetchMeterLogs]);

  // Handle Search Input Change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
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

  // Convert Direct Video to HLS
  const handleConvertHls = async (asset: MediaFileApiItem) => {
    try {
      const updated = await storageService.convertHls(asset.id);
      showToast(`HLS conversion queued for "${asset.display_name || asset.original_filename}".`);
      if (detailAsset?.id === asset.id) {
        setDetailAsset(updated);
      }
      refreshAllStorageData();
    } catch (err: any) {
      showToast(err?.response?.data?.message || 'Failed to queue HLS conversion.');
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
      refreshAllStorageData();
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
        } catch (e) {
          console.warn('Failed to extract client metadata:', e);
        }
      }

      const res = await storageService.estimateUpload({
        filename: firstFile.name,
        file_size_bytes: firstFile.size,
        mime_type: firstFile.type,
        duration_seconds: durationSeconds,
        width,
        height,
        adaptive_streaming_enabled: isAdaptiveOn,
      });

      setEstimateData(res);
    } catch (err) {
      console.warn('Failed to fetch pre-upload cost estimate:', err);
    } finally {
      setEstimating(false);
    }
  };

  const handleSelectFilesForUpload = (files: File[]) => {
    if (!files || files.length === 0) return;
    setPendingUploadFiles(files);
    setEstimateModalOpen(true);
    fetchEstimate(files, adaptiveStreamingEnabled);
  };

  const handleToggleAdaptiveStreaming = (enabled: boolean) => {
    setAdaptiveStreamingEnabled(enabled);
    if (pendingUploadFiles.length > 0) {
      fetchEstimate(pendingUploadFiles, enabled);
    }
  };

  const handleConfirmUploadFiles = (files: File[]) => {
    setEstimateModalOpen(false);
    setPendingUploadFiles([]);
    setEstimateData(null);

    const newQueue: UploadQueueItem[] = files.map((file) => ({
      id: Math.random().toString(36).substring(2, 9),
      file,
      progress: 0,
      status: 'QUEUED',
      adaptive_streaming_enabled: adaptiveStreamingEnabled,
    }));

    setUploadQueue((prev) => [...prev, ...newQueue]);
    setIsUploadModalOpen(true);

    newQueue.forEach((qItem) => processUploadQueueItem(qItem));
  };

  const processUploadQueueItem = async (item: UploadQueueItem) => {
    setUploadQueue((prev) =>
      prev.map((q) => (q.id === item.id ? { ...q, status: 'UPLOADING', progress: 10 } : q))
    );

    try {
      await storageService.uploadFile(
        item.file,
        {
          adaptive_streaming_enabled: item.adaptive_streaming_enabled ?? true,
        },
        (progress) => {
          setUploadQueue((prev) =>
            prev.map((q) => (q.id === item.id ? { ...q, progress } : q))
          );
        }
      );

      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'COMPLETE', progress: 100 } : q))
      );
      showToast(`Uploaded "${item.file.name}" successfully.`);
      refreshAllStorageData();
    } catch (err: any) {
      const errMsg = err?.response?.data?.message || 'Upload failed.';
      setUploadQueue((prev) =>
        prev.map((q) => (q.id === item.id ? { ...q, status: 'FAILED', error: errMsg } : q))
      );
      showToast(`Upload failed for "${item.file.name}".`);
    }
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      handleSelectFilesForUpload(files);
    }
  };

  // Helper Date Formatters
  const formatDateTimeStr = (isoStr?: string | null): string => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  const formatDateOnlyStr = (isoStr?: string | null): string => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-US', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoStr;
    }
  };

  const formatTimeOnlyStr = (isoStr?: string | null): string => {
    if (!isoStr) return 'N/A';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return isoStr;
    }
  };

  // Available Years for filter dropdown
  const availableYearsList = [
    currentNow.getFullYear(),
    currentNow.getFullYear() - 1,
    currentNow.getFullYear() - 2,
    currentNow.getFullYear() - 3,
  ];

  return (
    <div
      className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-7xl mx-auto font-sans text-slate-900 dark:text-[#F8FAFC]"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 dark:bg-slate-800 text-white text-xs px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 border border-slate-700 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Drag and drop overlay indicator */}
      {isDragging && (
        <div className="fixed inset-0 z-40 bg-blue-600/20 backdrop-blur-xs border-4 border-dashed border-blue-600 flex items-center justify-center pointer-events-none">
          <div className="bg-white dark:bg-[#0F172A] p-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3">
            <Upload className="w-12 h-12 text-blue-600 animate-bounce" />
            <h3 className="text-base font-semibold text-slate-900 dark:text-[#F8FAFC]">Drop files to upload to Media Library</h3>
          </div>
        </div>
      )}

      {/* 1. MEDIA LIBRARY HEADER + ACTION BUTTONS */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Media Library & Storage
              </h1>
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/50">
                Backend Authoritative
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Manage physical media assets, view real-time storage metering, and inspect monthly credit settlement logs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={refreshAllStorageData}
              className="h-[38px] min-h-[38px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-medium text-xs px-4 rounded-xl hover:bg-[#1D4ED8] shrink-0 flex items-center justify-center gap-1.5 shadow-2xs"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Media
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  handleSelectFilesForUpload(Array.from(e.target.files));
                }
              }}
            />
          </div>
        </div>
      </Card>

      {/* 2. STORAGE USAGE SUMMARY (4-COLUMN RESPONSIVE CARDS) */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span>Storage Usage</span>
          </h2>
          {summaryData?.billing_enabled === false && (
            <span className="text-xs font-medium text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-lg border border-amber-200 dark:border-amber-900/50">
              Storage billing is currently disabled
            </span>
          )}
        </div>

        {/* Prominent Outstanding Storage Warning Banner */}
        {(summaryData?.has_outstanding_storage_balance || Number(summaryData?.outstanding_storage_credits || 0) > 0) && (
          <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700/60 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs mb-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-xl text-amber-800 dark:text-amber-300 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-200">
                  ⚠ Storage Credits Outstanding
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                  <strong className="font-semibold">{summaryData?.outstanding_storage_credits || '0.0000'} Credits</strong> are pending from previous storage settlements.
                </p>
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => navigate('/credits/buy')}
              className="bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs px-4 py-2 rounded-xl shrink-0 border-none shadow-2xs"
            >
              Add Credits
            </Button>
          </div>
        )}

        {summaryLoading ? (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl animate-pulse space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-[#1E293B] rounded w-24"></div>
                <div className="h-6 bg-slate-200 dark:bg-[#1E293B] rounded w-16"></div>
              </div>
            ))}
          </div>
        ) : summaryError ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-2xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <span>Unable to load storage usage. {summaryError}</span>
            <Button size="xs" variant="outline" onClick={fetchSummary}>Retry</Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {/* Card 1: Current Storage */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                Current Storage
              </span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
                {summaryData?.current_storage_gb || '0.00'} GB
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                {formatBytes(summaryData?.current_storage_bytes || 0)}
              </span>
            </div>

            {/* Card 2: Current Cycle Credits */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                Current Cycle Credits
              </span>
              <div className="text-lg sm:text-xl font-bold text-[#2563EB] dark:text-[#60A5FA]">
                {summaryData?.current_cycle_accumulated_credits || '0.0000'} Credits
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                Open cycle accumulation
              </span>
            </div>

            {/* Card 3: Meter Records */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                Meter Records
              </span>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-[#F8FAFC]">
                {summaryData?.current_cycle_meter_count || 0}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                Current cycle logs
              </span>
            </div>

            {/* Card 4: Outstanding Storage Credits */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                Outstanding Storage Credits
              </span>
              <div className={`text-lg sm:text-xl font-bold ${Number(summaryData?.outstanding_storage_credits || 0) > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-900 dark:text-[#F8FAFC]'}`}>
                {summaryData?.outstanding_storage_credits || '0.0000'} Credits
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                Unpaid storage debt
              </span>
            </div>

            {/* Card 5: Next Settlement */}
            <div className="p-3.5 sm:p-4 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
              <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase tracking-wider block mb-1">
                Next Settlement
              </span>
              <div className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-[#F8FAFC]">
                {formatDateTimeStr(summaryData?.next_settlement_at || summaryData?.next_credit_debit_at)}
              </div>
              <span className="text-[11px] text-slate-400 dark:text-[#64748B] block mt-0.5">
                Scheduled monthly debit
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. CURRENT BILLING CYCLE CARD */}
      <Card className="p-4 sm:p-5 bg-slate-50/70 dark:bg-[#0F172A] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Current Storage Billing Cycle</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Usage is metered at intervals and accumulated into the active cycle before single monthly settlement debit.
            </p>
          </div>
          {summaryData?.metering_interval_label && (
            <Badge variant="outline" className="w-fit border-indigo-200 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-300">
              {summaryData.metering_interval_label}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 text-xs pt-1">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Metering Interval</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC] font-medium">
              {summaryData?.metering_interval_label || summaryData?.billing_interval_label || '6 Hours'}
            </strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Credit Rate</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC] font-medium">
              {summaryData?.credit_rate_per_gb || '2.0000'} Credits / GB / Interval
            </strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Meter Records</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC] font-medium">
              {summaryData?.current_cycle_meter_count || 0}
            </strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Accumulated Credits</span>
            <strong className="text-[#2563EB] dark:text-[#60A5FA] font-semibold">
              {summaryData?.current_cycle_accumulated_credits || '0.0000'} Credits
            </strong>
          </div>

          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Last Metered</span>
            <span className="text-slate-700 dark:text-[#CBD5E1]">
              {formatDateTimeStr(summaryData?.last_metered_at || summaryData?.last_billed_at)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Next Meter</span>
            <span className="text-slate-700 dark:text-[#CBD5E1]">
              {formatDateTimeStr(summaryData?.next_meter_at || summaryData?.next_billing_at)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Previous Settlement</span>
            <span className="text-slate-700 dark:text-[#CBD5E1]">
              {formatDateTimeStr(summaryData?.previous_settlement_at || summaryData?.last_successful_debit_at)}
            </span>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Next Settlement</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
              {formatDateTimeStr(summaryData?.next_settlement_at || summaryData?.next_credit_debit_at)}
            </span>
          </div>
        </div>

        <div className="p-3 bg-blue-50/80 dark:bg-[#111827] border border-blue-200/80 dark:border-blue-900/40 rounded-xl flex items-start gap-2.5 text-xs text-blue-900 dark:text-blue-200">
          <Info className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Important:</strong> Accumulated Credits are NOT yet deducted from your Academy credit balance. They are accumulated safely and debited only once on your configured monthly settlement day/time.
          </p>
        </div>
      </Card>

      {/* 4. MEDIA TOOLBAR & CATEGORY FILTERS */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] p-3.5 rounded-2xl shadow-2xs font-sans text-xs">
        {/* Search Input with Debounce */}
        <div className="w-full md:w-72">
          <Input
            placeholder="Search media files..."
            value={searchInput}
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
              { id: 'PDF', label: 'PDFs' },
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
              <option value="-size_bytes">Largest Size</option>
              <option value="size_bytes">Smallest Size</option>
            </select>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-[#0F172A] p-0.5 rounded-lg border border-slate-200 dark:border-[#334155]">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                  : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                  : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
              }`}
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 5. MEDIA ASSETS GRID / LIST */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-64 bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl animate-pulse"></div>
          ))}
        </div>
      ) : error ? (
        <Card className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 space-y-3">
          <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
          <p className="text-xs text-rose-900 dark:text-rose-300 font-medium">{error}</p>
          <Button size="sm" variant="outline" onClick={fetchMedia}>Retry</Button>
        </Card>
      ) : mediaAssets.length === 0 ? (
        <EmptyState
          icon={HardDrive}
          title="No media assets found"
          description={debouncedSearch ? 'No media items match your search query.' : 'Upload your first image, video, audio, or PDF document.'}
          actionLabel="Upload Media"
          onAction={() => fileInputRef.current?.click()}
        />
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mediaAssets.map((asset) => (
            <Card
              key={asset.id}
              className="group overflow-hidden bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] hover:border-blue-400 dark:hover:border-blue-600 transition-all rounded-2xl flex flex-col justify-between"
            >
              {/* Preview Thumbnail */}
              <div className="relative h-36 bg-slate-100 dark:bg-[#0F172A] overflow-hidden flex items-center justify-center">
                {asset.media_type === 'IMAGE' ? (
                  <img
                    src={resolveMediaUrl(asset.url)}
                    alt={asset.display_name || asset.original_filename}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : asset.media_type === 'VIDEO' ? (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                    <FileVideo className="w-8 h-8 text-blue-400 mb-1" />
                    <span className="text-[10px] text-slate-300">{asset.duration_seconds ? `${Math.round(asset.duration_seconds)}s` : 'Video'}</span>
                    {asset.adaptive_streaming_enabled && (
                      <Badge variant="secondary" className="absolute top-2 left-2 bg-blue-600/90 text-white text-[9px] px-1.5 py-0.5">
                        HLS
                      </Badge>
                    )}
                  </div>
                ) : asset.media_type === 'AUDIO' ? (
                  <div className="flex flex-col items-center justify-center text-indigo-500">
                    <FileAudio className="w-10 h-10" />
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] mt-1">Audio Track</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center text-slate-400 dark:text-[#64748B]">
                    <FileText className="w-10 h-10" />
                    <span className="text-[10px] text-slate-500 dark:text-[#94A3B8] mt-1">{asset.file_extension?.toUpperCase() || 'Doc'}</span>
                  </div>
                )}

                {/* Hover overlay action buttons */}
                <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button size="xs" variant="secondary" onClick={() => handleOpenDetail(asset)} className="bg-white text-slate-900 hover:bg-slate-100">
                    <Eye className="w-3.5 h-3.5 mr-1" /> Preview
                  </Button>
                  <Button size="xs" variant="destructive" onClick={() => handleDeleteClick(asset)}>
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Asset Info Footer */}
              <div className="p-3 space-y-1.5 text-left">
                <div className="flex items-start justify-between gap-1.5">
                  <h3
                    onClick={() => handleOpenDetail(asset)}
                    className="font-medium text-xs text-slate-900 dark:text-[#F8FAFC] truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                    title={asset.display_name || asset.original_filename}
                  >
                    {asset.display_name || asset.original_filename}
                  </h3>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8]">
                  <span>{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</span>
                  <span>{formatDateOnlyStr(asset.created_at)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        /* List View */
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
              <tr>
                <th className="p-3 pl-4">Asset</th>
                <th className="p-3">Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">Uploaded</th>
                <th className="p-3 text-right pr-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
              {mediaAssets.map((asset) => (
                <tr key={asset.id} className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                  <td className="p-3 pl-4 font-medium text-slate-900 dark:text-[#F8FAFC]">
                    <div className="flex items-center gap-2 cursor-pointer" onClick={() => handleOpenDetail(asset)}>
                      {asset.media_type === 'IMAGE' ? (
                        <ImageIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : asset.media_type === 'VIDEO' ? (
                        <FileVideo className="w-4 h-4 text-blue-500 shrink-0" />
                      ) : asset.media_type === 'AUDIO' ? (
                        <FileAudio className="w-4 h-4 text-indigo-500 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                      )}
                      <span className="truncate max-w-xs">{asset.display_name || asset.original_filename}</span>
                    </div>
                  </td>
                  <td className="p-3 text-slate-500 dark:text-[#94A3B8]">{asset.media_type}</td>
                  <td className="p-3 text-slate-500 dark:text-[#94A3B8]">{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</td>
                  <td className="p-3 text-slate-500 dark:text-[#94A3B8]">{formatDateOnlyStr(asset.created_at)}</td>
                  <td className="p-3 text-right pr-4 space-x-1">
                    <Button size="xs" variant="ghost" onClick={() => handleOpenDetail(asset)}>
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                    <Button size="xs" variant="ghost" onClick={() => handleDeleteClick(asset)} className="text-rose-600 hover:text-rose-700 hover:bg-rose-50">
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalCount > pageSize && (
        <div className="flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-[#94A3B8]">
          <span>
            Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} assets
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="xs"
              variant="outline"
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
            >
              <ChevronLeft className="w-3.5 h-3.5 mr-1" /> Previous
            </Button>
            <span className="px-2 font-medium text-slate-700 dark:text-[#CBD5E1]">
              Page {page} of {Math.ceil(totalCount / pageSize)}
            </span>
            <Button
              size="xs"
              variant="outline"
              disabled={page * pageSize >= totalCount}
              onClick={() => setPage((p) => p + 1)}
            >
              Next <ChevronRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 6. STORAGE USAGE LOGS SECTION */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Storage Usage Logs</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Immutable record of storage occupied and interval credits calculated.
            </p>
          </div>

          {/* Month / Year Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Month:</span>
              <select
                value={meterLogsMonth}
                onChange={(e) => {
                  setMeterLogsMonth(Number(e.target.value));
                  setMeterLogsPage(1);
                }}
                className="h-8 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Year:</span>
              <select
                value={meterLogsYear}
                onChange={(e) => {
                  setMeterLogsYear(Number(e.target.value));
                  setMeterLogsPage(1);
                }}
                className="h-8 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
              >
                {availableYearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {meterLogsLoading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : meterLogsError ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <span>{meterLogsError}</span>
            <Button size="xs" variant="outline" onClick={fetchMeterLogs}>Retry</Button>
          </div>
        ) : meterLogs.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No storage usage has been metered yet.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-[#263244] rounded-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Metered At</th>
                  <th className="p-3">Storage Used</th>
                  <th className="p-3">Rate / GB</th>
                  <th className="p-3 text-right pr-4">Calculated Credits</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                {meterLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                    <td className="p-3 pl-4 text-slate-900 dark:text-[#F8FAFC] font-medium">
                      {formatDateTimeStr(log.metered_at)}
                    </td>
                    <td className="p-3 text-slate-700 dark:text-[#CBD5E1]">
                      {log.used_gb} GB ({formatBytes(log.used_bytes)})
                    </td>
                    <td className="p-3 text-slate-700 dark:text-[#CBD5E1]">
                      {log.credit_rate_per_gb}
                    </td>
                    <td className="p-3 text-right pr-4 font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                      {log.calculated_credits} Credits
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination bar */}
        {meterLogsCount > 25 && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
            <span>Total {meterLogsCount} meter records</span>
            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant="outline"
                disabled={meterLogsPage === 1}
                onClick={() => setMeterLogsPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-medium">Page {meterLogsPage}</span>
              <Button
                size="xs"
                variant="outline"
                disabled={meterLogsPage * 25 >= meterLogsCount}
                onClick={() => setMeterLogsPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* 7. STORAGE CREDIT SETTLEMENT HISTORY SECTION */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Storage Credit Settlement History</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Authoritative ledger record of successful monthly storage credit debits.
            </p>
          </div>

          {/* Month / Year Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Month:</span>
              <select
                value={settlementsMonth}
                onChange={(e) => {
                  setSettlementsMonth(Number(e.target.value));
                  setSettlementsPage(1);
                }}
                className="h-8 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
              >
                {MONTH_NAMES.map((name, idx) => (
                  <option key={idx + 1} value={idx + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-500 dark:text-[#94A3B8]">Year:</span>
              <select
                value={settlementsYear}
                onChange={(e) => {
                  setSettlementsYear(Number(e.target.value));
                  setSettlementsPage(1);
                }}
                className="h-8 px-2 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
              >
                {availableYearsList.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Selected Period Summary Header */}
        <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase block">Selected Period</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">
              {settlementsPeriodLabel || `${MONTH_NAMES[settlementsMonth - 1]} ${settlementsYear}`}
            </strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase block">Storage Billed</span>
            <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{settlementsStorageBilled} Credits</strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase block">Credits Paid</span>
            <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">
              {settlementsCreditsPaid} Credits
            </strong>
          </div>
          <div>
            <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] uppercase block">Outstanding</span>
            <strong className="text-amber-600 dark:text-amber-400 font-semibold">
              {settlementsOutstanding} Credits
            </strong>
          </div>
        </div>

        {settlementsLoading ? (
          <div className="space-y-2">
            {[1, 2].map((i) => (
              <div key={i} className="h-10 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse"></div>
            ))}
          </div>
        ) : settlementsError ? (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
            <span>{settlementsError}</span>
            <Button size="xs" variant="outline" onClick={fetchSettlements}>Retry</Button>
          </div>
        ) : settlements.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
            No storage credit settlements for this period.
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 dark:border-[#263244] rounded-xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-slate-50 dark:bg-[#0F172A] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-3 pl-4">Settlement Date</th>
                  <th className="p-3">Bill</th>
                  <th className="p-3">Paid</th>
                  <th className="p-3">Outstanding</th>
                  <th className="p-3 text-right pr-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                {settlements.map((s) => {
                  const statusLabel = s.settlement_status || (s.status === 'DEBITED' ? 'PAID' : s.status);
                  const isPaid = statusLabel === 'PAID';
                  const isPartial = statusLabel === 'PARTIALLY_PAID';

                  return (
                    <tr
                      key={s.id}
                      onClick={() => setSelectedSettlementDetail(s)}
                      className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors cursor-pointer"
                    >
                      <td className="p-3 pl-4 font-medium text-slate-900 dark:text-[#F8FAFC]">
                        {formatDateTimeStr(s.settled_at || s.debited_at || s.created_at)}
                      </td>
                      <td className="p-3 text-slate-700 dark:text-[#CBD5E1] font-medium">
                        {s.storage_billed || s.original_amount || s.accumulated_credits} Credits
                      </td>
                      <td className="p-3 text-emerald-600 dark:text-emerald-400 font-semibold">
                        {s.credits_paid || s.paid_amount || s.credits_debited} Credits
                      </td>
                      <td className="p-3 text-amber-600 dark:text-amber-400 font-semibold">
                        {s.outstanding || s.outstanding_amount || '0.0000'} Credits
                      </td>
                      <td className="p-3 text-right pr-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isPartial
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                        }`}>
                          {isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {settlementsCount > 25 && (
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
            <span>Total {settlementsCount} settlement records</span>
            <div className="flex items-center gap-1">
              <Button
                size="xs"
                variant="outline"
                disabled={settlementsPage === 1}
                onClick={() => setSettlementsPage((p) => p - 1)}
              >
                Previous
              </Button>
              <span className="px-2 font-medium">Page {settlementsPage}</span>
              <Button
                size="xs"
                variant="outline"
                disabled={settlementsPage * 25 >= settlementsCount}
                onClick={() => setSettlementsPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* SETTLEMENT DETAIL MODAL */}
      <Modal
        isOpen={Boolean(selectedSettlementDetail)}
        onClose={() => setSelectedSettlementDetail(null)}
        title="Storage Settlement Details"
      >
        {selectedSettlementDetail && (
          <div className="space-y-4 text-xs font-sans text-left">
            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Usage Period:</span>
                <strong className="text-slate-900 dark:text-[#F8FAFC]">
                  {formatDateOnlyStr(selectedSettlementDetail.cycle_start_at)} &rarr; {formatDateOnlyStr(selectedSettlementDetail.cycle_end_at || selectedSettlementDetail.debited_at)}
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Meter Records Included:</span>
                <strong className="text-slate-900 dark:text-[#F8FAFC]">{selectedSettlementDetail.meter_record_count}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Credits Debited:</span>
                <strong className="text-rose-600 dark:text-rose-400 font-semibold">
                  -{selectedSettlementDetail.accumulated_credits} Credits
                </strong>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Actual Debit Date:</span>
                <span className="text-slate-900 dark:text-[#F8FAFC]">{formatDateOnlyStr(selectedSettlementDetail.debited_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Actual Debit Time:</span>
                <span className="text-slate-900 dark:text-[#F8FAFC]">{formatTimeOnlyStr(selectedSettlementDetail.debited_at)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#94A3B8]">Settlement Status:</span>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300">
                  {selectedSettlementDetail.status}
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-end pt-2">
              <Button size="sm" variant="outline" onClick={() => setSelectedSettlementDetail(null)}>
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* MEDIA ASSET PREVIEW & EDIT DRAWER / MODAL */}
      <Modal
        isOpen={Boolean(detailAsset)}
        onClose={() => setDetailAsset(null)}
        title="Media Asset Details"
      >
        {detailAsset && (
          <div className="space-y-4 text-xs font-sans text-left">
            {/* Display Name Edit Input */}
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-slate-500 dark:text-[#94A3B8] uppercase">
                Display Name
              </label>
              <div className="flex items-center gap-2">
                <Input
                  value={editingDisplayName}
                  onChange={(e) => setEditingDisplayName(e.target.value)}
                  placeholder="Enter display name"
                  className="bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#334155]"
                />
                <Button
                  size="xs"
                  disabled={savingDisplayName || !editingDisplayName.trim()}
                  onClick={handleSaveDisplayName}
                  className="bg-[#2563EB] text-white shrink-0"
                >
                  {savingDisplayName ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Media Player / Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] bg-slate-900">
              {detailAsset.media_type === 'VIDEO' ? (
                <LessonVideoPlayer
                  hlsManifestUrl={resolveMediaUrl(detailAsset.stream_url)}
                  fallbackMp4Url={resolveMediaUrl(detailAsset.url)}
                  title={detailAsset.display_name || detailAsset.original_filename}
                />
              ) : detailAsset.media_type === 'IMAGE' ? (
                <img
                  src={resolveMediaUrl(detailAsset.url)}
                  alt={detailAsset.display_name || detailAsset.original_filename}
                  className="w-full max-h-80 object-contain mx-auto"
                />
              ) : detailAsset.media_type === 'AUDIO' ? (
                <div className="p-6 text-center text-white space-y-3">
                  <FileAudio className="w-12 h-12 text-indigo-400 mx-auto" />
                  <audio controls src={resolveMediaUrl(detailAsset.url)} className="w-full mt-2" />
                </div>
              ) : (
                <div className="p-6 text-center text-white space-y-3">
                  <FileText className="w-12 h-12 text-blue-400 mx-auto" />
                  <iframe
                    src={resolveMediaUrl(detailAsset.url)}
                    className="w-full h-64 border-0 rounded-lg bg-white"
                    title="PDF Preview"
                  />
                </div>
              )}
            </div>

            {/* Technical Metadata */}
            <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#334155] rounded-xl text-[11px]">
              <div>
                <span className="text-slate-500 dark:text-[#94A3B8]">Original Filename:</span>
                <p className="font-medium text-slate-900 dark:text-[#F8FAFC] truncate" title={detailAsset.original_filename}>
                  {detailAsset.original_filename}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#94A3B8]">Total Storage:</span>
                <p className="font-medium text-slate-900 dark:text-[#F8FAFC]">
                  {formatBytes(detailAsset.total_storage_bytes || detailAsset.size_bytes)}
                </p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#94A3B8]">MIME Type:</span>
                <p className="font-medium text-slate-900 dark:text-[#F8FAFC]">{detailAsset.mime_type}</p>
              </div>
              <div>
                <span className="text-slate-500 dark:text-[#94A3B8]">Uploaded Date:</span>
                <p className="font-medium text-slate-900 dark:text-[#F8FAFC]">{formatDateTimeStr(detailAsset.created_at)}</p>
              </div>

              {/* HLS Video Status & Action */}
              {detailAsset.media_type === 'VIDEO' && (
                <div className="col-span-2 pt-2 border-t border-slate-200 dark:border-[#263244]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-slate-500 dark:text-[#94A3B8]">HLS Adaptive Streaming:</span>
                      <p className="font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                        {detailAsset.adaptive_streaming_enabled ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                    {!detailAsset.stream_manifest_key && (
                      <Button
                        size="xs"
                        variant="outline"
                        onClick={() => handleConvertHls(detailAsset)}
                        className="text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-800"
                      >
                        Convert to HLS
                      </Button>
                    )}
                  </div>

                  {detailAsset.renditions && detailAsset.renditions.length > 0 && (
                    <div className="mt-2 space-y-1">
                      <span className="text-[10px] font-semibold text-slate-500 dark:text-[#94A3B8] uppercase">Quality Renditions</span>
                      <div className="flex flex-wrap gap-1">
                        {detailAsset.renditions.map((ren, idx) => (
                          <Badge key={idx} variant="secondary" className="text-[10px] bg-slate-200 dark:bg-[#1E293B] text-slate-800 dark:text-[#CBD5E1]">
                            {ren.quality_label} ({ren.width}x{ren.height}) - {formatBytes(ren.size_bytes)}
                          </Badge>
                        ))}
                      </div>
                    </div>
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
                  onClick={() => {
                    navigator.clipboard.writeText(resolveMediaUrl(detailAsset.url));
                    showToast('Media URL copied to clipboard.');
                  }}
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

      {/* DELETE CONFIRMATION MODAL */}
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
