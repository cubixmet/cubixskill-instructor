import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload,
  Search,
  FileVideo,
  FileAudio,
  FileText,
  Image as ImageIcon,
  AlertTriangle,
  HardDrive,
  ArrowUpDown,
  CheckCircle2,
  Eye,
  LayoutGrid,
  List as ListIcon,
  Download,
  Copy,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  Layers,
  CreditCard,
  ChevronDown,
  ChevronUp,
  Pin,
  Trash2,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { Modal } from '../../../components/ui/Modal';
import { useAuthStore } from '../../../store/auth.store';
import {
  storageService,
  MediaFileApiItem,
  MediaUsageReference,
  PreUploadEstimateResponse,
  StorageSummaryDashboard,
  StorageMeterLogItem,
  StorageSettlementItem,
} from '../../../services/storage.service';
import { resolveMediaUrl, formatBytes } from '../../../utils/media.utils';
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
  const { academy } = useAuthStore();
  const currentNow = new Date();

  // Section Collapse States
  const [showFileList, setShowFileList] = useState<boolean>(false);
  const [showMeterLogs, setShowMeterLogs] = useState<boolean>(false);
  const [showSettlements, setShowSettlements] = useState<boolean>(false);

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
  const [showAnalyticsPanel, setShowAnalyticsPanel] = useState<boolean>(false);

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
  const [settlementsStorageBilled, setSettlementsStorageBilled] = useState<string>('0.0000');
  const [settlementsCreditsPaid, setSettlementsCreditsPaid] = useState<string>('0.0000');
  const [settlementsOutstanding, setSettlementsOutstanding] = useState<string>('0.0000');
  const [settlementsPage, setSettlementsPage] = useState<number>(1);
  const [settlementsMonth, setSettlementsMonth] = useState<number>(currentNow.getMonth() + 1);
  const [settlementsYear, setSettlementsYear] = useState<number>(currentNow.getFullYear());
  const [settlementsLoading, setSettlementsLoading] = useState<boolean>(true);
  const [settlementsError, setSettlementsError] = useState<string | null>(null);

  const [selectedSettlementDetail, setSelectedSettlementDetail] = useState<StorageSettlementItem | null>(null);

  // Excel Export Progress States
  const [exportingFiles, setExportingFiles] = useState<boolean>(false);
  const [exportingUsage, setExportingUsage] = useState<boolean>(false);
  const [exportingSettlements, setExportingSettlements] = useState<boolean>(false);
  const [selectedMeterRecordId, setSelectedMeterRecordId] = useState<string>('');
  const [exportingMeterFiles, setExportingMeterFiles] = useState<boolean>(false);

  // Delete Confirmation Modal State
  const [deleteModalAsset, setDeleteModalAsset] = useState<MediaFileApiItem | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handlePromptDelete = (asset: MediaFileApiItem) => {
    setDeleteModalAsset(asset);
    setDeleteError(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteModalAsset) return;
    try {
      setIsDeleting(true);
      setDeleteError(null);
      await storageService.deleteMediaFile(deleteModalAsset.id);
      showToast(`Deleted "${deleteModalAsset.original_filename}" successfully.`);
      setDeleteModalAsset(null);
      fetchMedia();
      fetchSummary();
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Failed to delete media asset.';
      setDeleteError(errorMsg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Multi-Selection & Bulk Delete State
  const [selectedAssetIds, setSelectedAssetIds] = useState<Set<string>>(new Set());
  const [bulkDeleteModalOpen, setBulkDeleteModalOpen] = useState<boolean>(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState<boolean>(false);
  const [bulkBlockedItems, setBulkBlockedItems] = useState<Array<{ id: string; filename: string; reason: string }>>([]);

  // Automatically clear selection on search, category filter, sorting, or page changes
  useEffect(() => {
    setSelectedAssetIds(new Set());
  }, [debouncedSearch, selectedCategory, sortBy, unusedOnly, page]);

  const toggleSelectAsset = (id: string, e?: React.MouseEvent | React.ChangeEvent<HTMLInputElement>) => {
    if (e && 'stopPropagation' in e) e.stopPropagation();
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isPageSelected = mediaAssets.length > 0 && mediaAssets.every((a) => selectedAssetIds.has(a.id));

  const toggleSelectPage = () => {
    setSelectedAssetIds((prev) => {
      const next = new Set(prev);
      if (isPageSelected) {
        mediaAssets.forEach((a) => next.delete(a.id));
      } else {
        mediaAssets.forEach((a) => next.add(a.id));
      }
      return next;
    });
  };

  const clearSelection = () => {
    setSelectedAssetIds(new Set());
  };

  const handleConfirmBulkDelete = async () => {
    const idsToDelete = Array.from(selectedAssetIds);
    if (idsToDelete.length === 0) return;

    try {
      setIsBulkDeleting(true);
      setBulkBlockedItems([]);
      const res = await storageService.bulkDeleteMediaFiles(idsToDelete);

      if (res.deleted_ids && res.deleted_ids.length > 0) {
        setSelectedAssetIds((prev) => {
          const next = new Set(prev);
          res.deleted_ids.forEach((id) => next.delete(id));
          return next;
        });
        showToast(`Bulk delete complete. Successfully deleted ${res.deleted_count} asset(s).`);
      }

      if (res.blocked_items && res.blocked_items.length > 0) {
        setBulkBlockedItems(res.blocked_items);
      } else {
        setBulkDeleteModalOpen(false);
      }

      await fetchMedia();
      await fetchSummary();

      if (mediaAssets.length === res.deleted_count && page > 1) {
        setPage(page - 1);
      }
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err?.message || 'Failed to execute bulk deletion.';
      alert(errorMsg);
    } finally {
      setIsBulkDeleting(false);
    }
  };

  useEffect(() => {
    if (meterLogs.length > 0) {
      if (!selectedMeterRecordId || !meterLogs.some((l) => l.id === selectedMeterRecordId)) {
        setSelectedMeterRecordId(meterLogs[0].id);
      }
    } else {
      setSelectedMeterRecordId('');
    }
  }, [meterLogs, selectedMeterRecordId]);

  // Drag & Drop
  const [isDragging, setIsDragging] = useState<boolean>(false);



  // Detail Target
  const [detailAsset, setDetailAsset] = useState<MediaFileApiItem | null>(null);
  const [assetUsages, setAssetUsages] = useState<MediaUsageReference[]>([]);
  const [loadingUsages, setLoadingUsages] = useState<boolean>(false);
  const [usageError, setUsageError] = useState<string | null>(null);

  const [editingDisplayName, setEditingDisplayName] = useState<string>('');
  const [savingDisplayName, setSavingDisplayName] = useState<boolean>(false);

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

  const fetchSequenceRef = useRef(0);

  // Fetch Media List
  const fetchMedia = useCallback(async () => {
    const currentSeq = ++fetchSequenceRef.current;
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

      // Ignore response if a newer fetch was initiated
      if (currentSeq !== fetchSequenceRef.current) return;

      setMediaAssets(res.results);
      setTotalCount(res.count);
    } catch (err: any) {
      if (currentSeq !== fetchSequenceRef.current) return;
      const apiErr = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Unable to load Media Library assets. Please retry.';
      setError(apiErr);
    } finally {
      if (currentSeq === fetchSequenceRef.current) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, selectedCategory, sortBy, unusedOnly, page]);

  // Fetch Storage Summary
  const fetchSummary = useCallback(async () => {
    try {
      const res = await storageService.getSummaryDashboard();
      setSummaryData(res);
    } catch (err: any) {
      console.warn('Unable to load storage summary:', err);
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

  // Refetch summary & meter logs after upload sync
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

  // --- EXCEL EXPORT HANDLERS ---

  // 1. Export File List Excel (.xlsx)
  const handleExportFileList = async () => {
    if (exportingFiles) return;
    try {
      setExportingFiles(true);
      let allFiles: MediaFileApiItem[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await storageService.getMediaFiles({
          search: debouncedSearch,
          media_type: selectedCategory,
          ordering: sortBy,
          unused_only: unusedOnly,
          page: currentPage,
          page_size: 100,
        });
        allFiles = [...allFiles, ...res.results];
        totalPages = Math.ceil(res.count / 100) || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      const rows = allFiles.map((file) => ({
        'File ID': file.id,
        'File Name': file.original_filename,
        'Display Name': file.display_name || file.original_filename,
        'Media Type': file.media_type,
        'File Extension': file.file_extension || '',
        'MIME Type': file.mime_type || '',
        'Size (Bytes)': file.total_storage_bytes || file.size_bytes || 0,
        'Size (Formatted)': formatBytes(file.total_storage_bytes || file.size_bytes || 0),
        'Status': file.status || 'READY',
        'Adaptive Streaming': file.adaptive_streaming_enabled ? 'Yes' : 'No',
        'Usage Count': file.usage_count || 0,
        'Uploaded Date': formatDateTimeStr(file.created_at),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      const metaRows = [
        { Property: 'Academy', Value: academy?.name || 'CubixSkill Academy' },
        { Property: 'Export Date', Value: new Date().toLocaleString() },
        { Property: 'Total Files Exported', Value: rows.length },
        { Property: 'Search Query', Value: debouncedSearch || 'None' },
        { Property: 'Category Filter', Value: selectedCategory },
        { Property: 'Unused Filter', Value: unusedOnly ? 'Unused Only' : 'All Files' },
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaRows);

      XLSX.utils.book_append_sheet(wb, ws, 'Media Files');
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Report Metadata');

      const fileName = `Media_Files_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast(`Exported ${rows.length} files to ${fileName}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to export file list.');
    } finally {
      setExportingFiles(false);
    }
  };

  // 2. Export Usage Logs Excel (.xlsx)
  const handleExportUsageLogs = async () => {
    if (exportingUsage) return;
    try {
      setExportingUsage(true);
      let allLogs: StorageMeterLogItem[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await storageService.getMeterLogs({
          page: currentPage,
          page_size: 100,
          month: meterLogsMonth,
          year: meterLogsYear,
        });
        allLogs = [...allLogs, ...res.results];
        totalPages = res.total_pages || Math.ceil(res.count / 100) || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      const rows = allLogs.map((log) => ({
        'Record ID': log.id,
        'Metered Date & Time': formatDateTimeStr(log.metered_at),
        'Storage Used (Bytes)': log.used_bytes || 0,
        'Storage Used (GB)': parseFloat(log.used_gb) || 0,
        'Rate Per GB (Credits)': parseFloat(log.credit_rate_per_gb) || 0,
        'Calculated Credits': parseFloat(log.calculated_credits) || 0,
        'Metering Interval': log.metering_interval_label || log.metering_interval || '',
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      const periodStr = `${MONTH_NAMES[meterLogsMonth - 1]} ${meterLogsYear}`;
      const metaRows = [
        { Property: 'Academy', Value: academy?.name || 'CubixSkill Academy' },
        { Property: 'Report Period', Value: periodStr },
        { Property: 'Export Date', Value: new Date().toLocaleString() },
        { Property: 'Total Meter Records', Value: rows.length },
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaRows);

      XLSX.utils.book_append_sheet(wb, ws, 'Usage Logs');
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Report Metadata');

      const fileName = `Storage_Usage_${meterLogsYear}-${String(meterLogsMonth).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast(`Exported ${rows.length} meter logs to ${fileName}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to export usage logs.');
    } finally {
      setExportingUsage(false);
    }
  };

  // 3. Export Settlement Excel (.xlsx)
  const handleExportSettlements = async () => {
    if (exportingSettlements) return;
    try {
      setExportingSettlements(true);
      let allSettlements: StorageSettlementItem[] = [];
      let currentPage = 1;
      let totalPages = 1;

      do {
        const res = await storageService.getSettlements({
          page: currentPage,
          page_size: 100,
          month: settlementsMonth,
          year: settlementsYear,
        });
        allSettlements = [...allSettlements, ...res.results];
        totalPages = res.total_pages || Math.ceil(res.count / 100) || 1;
        currentPage++;
      } while (currentPage <= totalPages);

      const rows = allSettlements.map((s) => ({
        'Settlement ID': s.id,
        'Cycle Start Date': formatDateOnlyStr(s.cycle_start_at),
        'Cycle End Date': formatDateOnlyStr(s.cycle_end_at || s.debited_at),
        'Settled / Debited Date & Time': formatDateTimeStr(s.settled_at || s.debited_at || s.created_at),
        'Meter Records Count': s.meter_record_count || 0,
        'Storage Billed (Credits)': parseFloat(s.storage_billed || s.original_amount || s.accumulated_credits || '0'),
        'Credits Paid': parseFloat(s.credits_paid || s.paid_amount || s.credits_debited || '0'),
        'Outstanding Balance': parseFloat(s.outstanding || s.outstanding_amount || '0'),
        'Settlement Status': s.settlement_status || (s.status === 'DEBITED' ? 'PAID' : s.status),
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      const periodStr = `${MONTH_NAMES[settlementsMonth - 1]} ${settlementsYear}`;
      const metaRows = [
        { Property: 'Academy', Value: academy?.name || 'CubixSkill Academy' },
        { Property: 'Report Period', Value: periodStr },
        { Property: 'Export Date', Value: new Date().toLocaleString() },
        { Property: 'Total Settlement Records', Value: rows.length },
        { Property: 'Total Storage Billed', Value: settlementsStorageBilled },
        { Property: 'Total Credits Paid', Value: settlementsCreditsPaid },
        { Property: 'Total Outstanding Balance', Value: settlementsOutstanding },
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaRows);

      XLSX.utils.book_append_sheet(wb, ws, 'Settlement Ledger');
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Report Metadata');

      const fileName = `Storage_Settlement_${settlementsYear}-${String(settlementsMonth).padStart(2, '0')}.xlsx`;
      XLSX.writeFile(wb, fileName);
      showToast(`Exported ${rows.length} settlement records to ${fileName}`);
    } catch (err: any) {
      showToast(err?.message || 'Failed to export settlement history.');
    } finally {
      setExportingSettlements(false);
    }
  };

  // 4. Export Metered-Time File Inventory Excel (.xlsx)
  const handleDownloadMeterFilesExcel = async () => {
    if (!selectedMeterRecordId || exportingMeterFiles) return;

    try {
      setExportingMeterFiles(true);
      const res = await storageService.getMeterRecordFiles(selectedMeterRecordId);

      if (!res.has_file_history || (res.files.length === 0 && res.total_files === 0)) {
        showToast(res.message || 'File-level history is unavailable for this metered record.');
        return;
      }

      const appTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
      const formattedMeterTime = formatDateTimeStr(res.meter_record.metered_at);

      const rows = res.files.map((f) => ({
        'File Name': f.original_filename || f.display_name,
        'File Size (Bytes)': f.size_bytes,
        'Readable File Size': f.formatted_size || formatBytes(f.size_bytes),
        'File Type': f.file_type || f.media_type,
        'Uploaded Date & Time': formatDateTimeStr(f.uploaded_at || f.created_at),
        'Stable File ID': f.id,
      }));

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(rows);

      const varianceText = res.accounting_difference_bytes === 0
        ? '0 Bytes (Exact Match)'
        : `${res.accounting_difference_bytes > 0 ? '+' : ''}${formatBytes(res.accounting_difference_bytes)} (${res.accounting_difference_bytes} bytes variance)`;

      const metaRows = [
        { Property: 'Academy', Value: academy?.name || 'CubixSkill Academy' },
        { Property: 'Metered Record ID', Value: res.meter_record.id },
        { Property: 'Metered Date & Time', Value: formattedMeterTime },
        { Property: 'Application Timezone', Value: appTimezone },
        { Property: 'Total Files Counted', Value: res.total_files },
        { Property: 'Total Inventory Storage Size', Value: res.formatted_total_storage },
        { Property: 'Metered Logged Usage', Value: formatBytes(res.meter_record.used_bytes) },
        { Property: 'Accounting Variance', Value: varianceText },
        { Property: 'Export Date & Time', Value: new Date().toLocaleString() },
      ];
      const wsMeta = XLSX.utils.json_to_sheet(metaRows);

      XLSX.utils.book_append_sheet(wb, ws, 'File Inventory');
      XLSX.utils.book_append_sheet(wb, wsMeta, 'Report Metadata');

      const cleanDateStr = res.meter_record.metered_at
        ? res.meter_record.metered_at.replace(/[:T]/g, '-').slice(0, 16)
        : 'metered';
      const fileName = `storage-files-${cleanDateStr}.xlsx`;

      XLSX.writeFile(wb, fileName);
      if (res.accounting_difference_bytes !== 0) {
        showToast(`Exported ${res.total_files} files to ${fileName}. Accounting variance: ${formatBytes(res.accounting_difference_bytes)}`);
      } else {
        showToast(`Exported ${res.total_files} files to ${fileName}`);
      }
    } catch (err: any) {
      showToast(err?.response?.data?.message || err?.message || 'Failed to export metered file inventory.');
    } finally {
      setExportingMeterFiles(false);
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

    newQueue.forEach((qItem) => processUploadQueueItem(qItem));
  };

  const processUploadQueueItem = async (item: UploadQueueItem) => {

    try {
      await storageService.uploadFile(
        item.file,
        {
          adaptive_streaming_enabled: item.adaptive_streaming_enabled ?? true,
        }
      );

      showToast(`Uploaded "${item.file.name}" successfully.`);
      refreshAllStorageData();
    } catch (err: any) {
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

  const availableYearsList = [
    currentNow.getFullYear(),
    currentNow.getFullYear() - 1,
    currentNow.getFullYear() - 2,
    currentNow.getFullYear() - 3,
  ];

  return (
    <div
      className="space-y-4 sm:space-y-6 p-3 sm:p-6 pb-24 md:pb-8 max-w-7xl mx-auto font-sans text-slate-900 dark:text-[#F8FAFC] overflow-x-hidden"
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
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 min-w-0">
          <div className="space-y-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-[#F8FAFC]">
                Media Library & Files
              </h1>
              <Badge variant="secondary" className="bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/50">
                {totalCount} {totalCount === 1 ? 'File' : 'Files'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8] leading-relaxed">
              Upload, preview, copy links, and manage your academy's media files and course resources.
            </p>
          </div>

          {/* Action Buttons: Stacked on mobile */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto shrink-0">
            <Button
              size="sm"
              variant="outline"
              disabled={exportingFiles}
              onClick={handleExportFileList}
              className="h-[44px] min-h-[44px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] w-full sm:w-auto flex items-center justify-center gap-1.5 font-medium text-xs"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{exportingFiles ? 'Exporting...' : 'Export File List'}</span>
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={refreshAllStorageData}
              className="h-[44px] min-h-[44px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] w-full sm:w-auto flex items-center justify-center gap-1.5 font-medium text-xs"
            >
              <RefreshCw className="w-4 h-4 shrink-0" />
              <span>Refresh</span>
            </Button>
            <Button
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              className="h-[44px] min-h-[44px] bg-[#2563EB] text-white font-medium text-xs px-4 rounded-xl hover:bg-[#1D4ED8] shrink-0 flex items-center justify-center gap-1.5 shadow-2xs w-full sm:w-auto"
              leftIcon={<Upload className="w-4 h-4" />}
            >
              Upload Files
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

      {/* 2. COMPACT SEPARATE STORAGE SUMMARY (COLLAPSIBLE) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 dark:text-[#F8FAFC]">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
            <span>Storage Usage: <strong>{summaryData?.current_storage_gb || '0.00'} GB</strong> ({formatBytes(summaryData?.current_storage_bytes || 0)})</span>
          </div>

          <button
            type="button"
            onClick={() => setShowAnalyticsPanel(!showAnalyticsPanel)}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline px-2 py-1 cursor-pointer flex items-center gap-1"
          >
            <span>{showAnalyticsPanel ? 'Hide Storage Metrics' : 'Storage Details'}</span>
            {showAnalyticsPanel ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>

        {showAnalyticsPanel && summaryData && (
          <Card className="p-4 bg-slate-50/70 dark:bg-[#0F172A] border-slate-200 dark:border-[#263244] space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Current Cycle Credits</span>
                <strong className="text-blue-600 dark:text-blue-400 font-semibold">{summaryData.current_cycle_accumulated_credits || '0.0000'} Credits</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Meter Records</span>
                <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{summaryData.current_cycle_meter_count || 0}</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Outstanding Credits</span>
                <strong className="text-amber-600 dark:text-amber-400 font-semibold">{summaryData.outstanding_storage_credits || '0.0000'} Credits</strong>
              </div>
              <div>
                <span className="text-[11px] font-medium text-slate-500 dark:text-[#94A3B8] block mb-0.5">Next Settlement</span>
                <strong className="text-slate-900 dark:text-[#F8FAFC] font-semibold">{formatDateTimeStr(summaryData.next_settlement_at || summaryData.next_credit_debit_at)}</strong>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 3. COLLAPSIBLE UPLOADED FILES SECTION */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-3">
          <div className="flex items-center gap-2">
            <HardDrive className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC]">
              Uploaded Files {!error && <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8]">({totalCount})</span>}
            </h2>
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setShowFileList(!showFileList)}
            className="h-9 px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs flex items-center gap-1.5"
          >
            <span>{showFileList ? 'Hide Files' : 'Show Files'}</span>
            {showFileList ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>

        {showFileList && (
          <div className="space-y-4">
            {/* Multi-Select Toolbar / Bar */}
            {mediaAssets.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-blue-50/70 dark:bg-[#1E293B]/70 border border-blue-200 dark:border-[#334155] p-3 rounded-2xl text-xs">
                <div className="flex items-center gap-3 flex-wrap">
                  <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-800 dark:text-[#F8FAFC]">
                    <input
                      type="checkbox"
                      checked={
                        mediaAssets.length > 0 &&
                        mediaAssets.every((a) => selectedAssetIds.has(a.id))
                      }
                      onChange={toggleSelectPage}
                      className="w-4 h-4 rounded border-slate-300 dark:border-[#475569] text-blue-600 focus:ring-blue-500 cursor-pointer"
                    />
                    <span>Select this page</span>
                  </label>

                  {selectedAssetIds.size > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white font-semibold text-[11px]">
                        {selectedAssetIds.size} selected
                      </span>
                      <button
                        type="button"
                        onClick={clearSelection}
                        className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-xs cursor-pointer"
                      >
                        Clear selection
                      </button>
                    </div>
                  )}
                </div>

                {selectedAssetIds.size > 0 && (
                  <Button
                    size="sm"
                    onClick={() => setBulkDeleteModalOpen(true)}
                    className="bg-rose-600 hover:bg-rose-700 text-white font-medium min-h-[38px] px-3 rounded-xl flex items-center justify-center gap-1.5 shrink-0 shadow-2xs"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Selected ({selectedAssetIds.size})</span>
                  </Button>
                )}
              </div>
            )}

            {/* Toolbar & Filters: Stacked on mobile */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] p-3 rounded-2xl text-xs">
              {/* Search Input */}
              <div className="w-full md:w-72">
                <Input
                  placeholder="Search media files..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  leftIcon={<Search className="w-4 h-4 text-slate-400 dark:text-[#64748B]" />}
                  className="font-normal bg-white dark:bg-[#111827] border-slate-200 dark:border-[#334155] text-slate-900 dark:text-[#F8FAFC] placeholder:text-slate-400 dark:placeholder:text-[#64748B]"
                />
              </div>

              {/* Category Pills & Filters */}
              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 max-w-full">
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
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer whitespace-nowrap ${selectedCategory === cat.id
                        ? 'bg-[#2563EB] text-white dark:bg-[rgba(37,99,235,0.14)] dark:text-[#60A5FA] dark:border dark:border-[#3B82F6] shadow-2xs'
                        : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] hover:bg-slate-200 dark:hover:bg-[#172033] border border-slate-200 dark:border-[#334155]'
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
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all cursor-pointer whitespace-nowrap ${unusedOnly
                      ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-white dark:bg-[#111827] text-slate-600 dark:text-[#CBD5E1] border-slate-200 dark:border-[#334155]'
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
                    className="h-8 px-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                  >
                    <option value="-created_at">Newest First</option>
                    <option value="created_at">Oldest First</option>
                    <option value="-size_bytes">Largest Size</option>
                    <option value="size_bytes">Smallest Size</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center bg-white dark:bg-[#111827] p-0.5 rounded-lg border border-slate-200 dark:border-[#334155]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'grid'
                      ? 'bg-blue-50 dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                      : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                      }`}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-all ${viewMode === 'list'
                      ? 'bg-blue-50 dark:bg-[#1E293B] text-[#2563EB] dark:text-[#60A5FA] shadow-2xs'
                      : 'text-slate-500 dark:text-[#94A3B8] hover:text-slate-900 dark:hover:text-[#F8FAFC]'
                      }`}
                  >
                    <ListIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Media Assets Items */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-44 bg-slate-100 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-2xl animate-pulse"></div>
                ))}
              </div>
            ) : error ? (
              <div className="p-8 text-center bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-2xl space-y-3">
                <AlertTriangle className="w-8 h-8 text-rose-500 mx-auto" />
                <p className="text-xs text-rose-900 dark:text-rose-300 font-medium">{error}</p>
                <Button size="sm" variant="outline" onClick={fetchMedia}>Retry</Button>
              </div>
            ) : mediaAssets.length === 0 ? (
              <EmptyState
                icon={HardDrive}
                title="No uploaded files found"
                description={debouncedSearch ? 'No media items match your search query.' : 'Upload your first image, video, audio, or PDF document.'}
                actionLabel="Upload Files"
                onAction={() => fileInputRef.current?.click()}
              />
            ) : (
              <>
                {/* MOBILE STACKED FILE CARDS (Below md breakpoint - 1 card per row) */}
                <div className="block md:hidden space-y-3">
                  {mediaAssets.map((asset) => {
                    const isSelected = selectedAssetIds.has(asset.id);
                    return (
                      <Card
                        key={asset.id}
                        className={`p-4 transition-all rounded-2xl space-y-3 text-xs text-left shadow-2xs w-full max-w-full min-w-0 ${isSelected
                          ? 'bg-blue-50/60 dark:bg-[#1E293B]/80 border-blue-400 dark:border-blue-600 ring-1 ring-blue-400 dark:ring-blue-600'
                          : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#263244]'
                          }`}
                      >
                        <div className="flex items-start gap-3 min-w-0">
                          {/* Checkbox */}
                          <div
                            className="pt-1.5 shrink-0"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectAsset(asset.id)}
                              className="w-4 h-4 rounded border-slate-300 dark:border-[#475569] text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                          </div>

                          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-[#111827] flex items-center justify-center shrink-0 overflow-hidden border border-slate-200 dark:border-[#263244]">
                            {asset.media_type === 'IMAGE' ? (
                              <img
                                src={resolveMediaUrl(asset.url)}
                                alt={asset.display_name || asset.original_filename}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = 'none';
                                }}
                              />
                            ) : asset.media_type === 'VIDEO' ? (
                              <FileVideo className="w-6 h-6 text-blue-500" />
                            ) : asset.media_type === 'AUDIO' ? (
                              <FileAudio className="w-6 h-6 text-indigo-500" />
                            ) : (
                              <FileText className="w-6 h-6 text-slate-400" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1 space-y-1">
                            <h3 className="font-semibold text-slate-900 dark:text-[#F8FAFC] text-xs break-all leading-snug">
                              {asset.display_name || asset.original_filename}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-[#94A3B8] flex-wrap">
                              <span className="font-medium">{asset.media_type}</span>
                              <span>•</span>
                              <span>{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</span>
                            </div>
                            <span className="text-[10px] text-slate-400 dark:text-[#64748B] block">
                              Uploaded {formatDateOnlyStr(asset.created_at)}
                            </span>
                          </div>
                        </div>

                        {/* File Actions: Preview, Download, Copy Link, Delete */}
                        <div className="pt-2 border-t border-slate-100 dark:border-[#263244] grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handleOpenDetail(asset)}
                            className="h-[44px] min-h-[44px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center gap-1 font-medium text-[11px]"
                          >
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </Button>

                          <a
                            href={resolveMediaUrl(asset.url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            download={asset.original_filename}
                            className="h-[44px] min-h-[44px] px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-[11px] rounded-xl flex items-center justify-center gap-1 shadow-2xs"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>

                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => {
                              navigator.clipboard.writeText(resolveMediaUrl(asset.url));
                              showToast('Media URL copied to clipboard.');
                            }}
                            className="h-[44px] min-h-[44px] border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] flex items-center justify-center gap-1 font-medium text-[11px]"
                          >
                            <Copy className="w-3.5 h-3.5" /> Copy Link
                          </Button>

                          <Button
                            size="xs"
                            variant="outline"
                            onClick={() => handlePromptDelete(asset)}
                            className="h-[44px] min-h-[44px] border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 flex items-center justify-center gap-1 font-medium text-[11px]"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Delete
                          </Button>
                        </div>
                      </Card>
                    );
                  })}
                </div>

                {/* DESKTOP TABLE & GRID VIEWS (md and above) */}
                <div className="hidden md:block">
                  {viewMode === 'grid' ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {mediaAssets.map((asset) => {
                        const isSelected = selectedAssetIds.has(asset.id);
                        return (
                          <Card
                            key={asset.id}
                            className={`group overflow-hidden transition-all rounded-2xl flex flex-col justify-between relative ${isSelected
                              ? 'bg-blue-50/60 dark:bg-[#1E293B]/80 border-blue-500 dark:border-blue-500 ring-2 ring-blue-500'
                              : 'bg-white dark:bg-[#0F172A] border-slate-200 dark:border-[#263244] hover:border-blue-400 dark:hover:border-blue-600'
                              }`}
                          >
                            {/* Card Checkbox Top Left Badge */}
                            <div
                              className="absolute top-2.5 left-2.5 z-20"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleSelectAsset(asset.id)}
                                className="w-4 h-4 rounded border-slate-300 dark:border-[#475569] text-blue-600 focus:ring-blue-500 cursor-pointer shadow-md"
                              />
                            </div>

                            {/* Preview Thumbnail */}
                            <div className="relative h-36 bg-slate-100 dark:bg-[#111827] overflow-hidden flex items-center justify-center">
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
                                <Button size="xs" variant="secondary" onClick={() => handleOpenDetail(asset)} className="h-[44px] min-h-[44px] bg-white text-slate-900 hover:bg-slate-100 px-3 font-semibold text-xs">
                                  <Eye className="w-4 h-4 mr-1" /> Preview
                                </Button>
                                <a
                                  href={resolveMediaUrl(asset.url)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  download={asset.original_filename}
                                  className="h-[44px] min-h-[44px] px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs"
                                >
                                  <Download className="w-4 h-4" /> Download
                                </a>
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={() => handlePromptDelete(asset)}
                                  className="h-[44px] min-h-[44px] bg-rose-600 hover:bg-rose-700 text-white px-3 font-semibold text-xs rounded-xl flex items-center justify-center gap-1"
                                  title="Delete File"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Asset Info Footer */}
                            <div className="p-3 space-y-1.5 text-left">
                              <h3
                                onClick={() => handleOpenDetail(asset)}
                                className="font-medium text-xs text-slate-900 dark:text-[#F8FAFC] truncate cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
                                title={asset.display_name || asset.original_filename}
                              >
                                {asset.display_name || asset.original_filename}
                              </h3>

                              <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-[#94A3B8]">
                                <span>{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</span>
                                <span>{formatDateOnlyStr(asset.created_at)}</span>
                              </div>
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  ) : (
                    /* Desktop List View */
                    <div className="bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-2xl overflow-hidden shadow-2xs">
                      <table className="w-full text-left text-xs font-sans">
                        <thead className="bg-slate-50 dark:bg-[#111827] border-b border-slate-200 dark:border-[#263244] text-slate-500 dark:text-[#94A3B8] font-medium text-[11px] uppercase tracking-wider">
                          <tr>
                            <th className="p-3.5 pl-4 w-10">
                              <input
                                type="checkbox"
                                checked={
                                  mediaAssets.length > 0 &&
                                  mediaAssets.every((a) => selectedAssetIds.has(a.id))
                                }
                                onChange={toggleSelectPage}
                                className="w-4 h-4 rounded border-slate-300 dark:border-[#475569] text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                            </th>
                            <th className="p-3.5">File Name</th>
                            <th className="p-3.5">Type</th>
                            <th className="p-3.5">Size</th>
                            <th className="p-3.5">Uploaded Date</th>
                            <th className="p-3.5 text-right pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-[#263244]">
                          {mediaAssets.map((asset) => {
                            const isSelected = selectedAssetIds.has(asset.id);
                            return (
                              <tr
                                key={asset.id}
                                className={`transition-colors ${isSelected
                                  ? 'bg-blue-50/70 dark:bg-[#1E293B]/70'
                                  : 'hover:bg-slate-50/80 dark:hover:bg-[#172033]'
                                  }`}
                              >
                                <td
                                  className="p-3.5 pl-4"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleSelectAsset(asset.id)}
                                    className="w-4 h-4 rounded border-slate-300 dark:border-[#475569] text-blue-600 focus:ring-blue-500 cursor-pointer"
                                  />
                                </td>
                                <td className="p-3.5 font-medium text-slate-900 dark:text-[#F8FAFC]">
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
                                    <span className="break-all max-w-xs">{asset.display_name || asset.original_filename}</span>
                                  </div>
                                </td>
                                <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">{asset.media_type}</td>
                                <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</td>
                                <td className="p-3.5 text-slate-500 dark:text-[#94A3B8]">{formatDateOnlyStr(asset.created_at)}</td>
                                <td className="p-3.5 text-right pr-4 space-x-1">
                                  <Button size="xs" variant="ghost" onClick={() => handleOpenDetail(asset)}>
                                    <Eye className="w-4 h-4 text-slate-700 dark:text-[#CBD5E1]" />
                                  </Button>
                                  <a
                                    href={resolveMediaUrl(asset.url)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    download={asset.original_filename}
                                    className="inline-flex items-center justify-center p-1.5 text-slate-700 dark:text-[#CBD5E1] hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                                  >
                                    <Download className="w-4 h-4" />
                                  </a>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => {
                                      navigator.clipboard.writeText(resolveMediaUrl(asset.url));
                                      showToast('Media URL copied to clipboard.');
                                    }}
                                  >
                                    <Copy className="w-4 h-4 text-slate-700 dark:text-[#CBD5E1]" />
                                  </Button>
                                  <Button
                                    size="xs"
                                    variant="ghost"
                                    onClick={() => handlePromptDelete(asset)}
                                    className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 p-1.5"
                                    title="Delete File"
                                  >
                                    <Trash2 className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                                  </Button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Pagination Bar: Result summary on its own row, Previous/Page/Next below */}
            {totalCount > pageSize && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#263244] text-xs text-slate-500 dark:text-[#94A3B8] text-center sm:text-left">
                <div className="font-medium text-slate-600 dark:text-[#CBD5E1]">
                  Showing {(page - 1) * pageSize + 1} to {Math.min(page * pageSize, totalCount)} of {totalCount} assets
                </div>
                <div className="flex items-center justify-center sm:justify-start gap-2 pt-1">
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={page === 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="h-[44px] min-h-[44px] px-3 font-semibold"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                  </Button>
                  <span className="px-3 font-semibold text-slate-800 dark:text-[#F8FAFC]">
                    Page {page} of {Math.ceil(totalCount / pageSize)}
                  </span>
                  <Button
                    size="xs"
                    variant="outline"
                    disabled={page * pageSize >= totalCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="h-[44px] min-h-[44px] px-3 font-semibold"
                  >
                    Next <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Card>

      {/* 4. STORAGE USAGE LOGS SECTION (COLLAPSIBLE) */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span>Storage Usage Logs</span>
              <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8]">({meterLogsCount})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Immutable record of storage occupied and interval credits calculated.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={exportingUsage}
              onClick={handleExportUsageLogs}
              className="h-9 px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{exportingUsage ? 'Exporting...' : 'Download Usage Excel'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowMeterLogs(!showMeterLogs)}
              className="h-9 px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs flex items-center gap-1.5"
            >
              <span>{showMeterLogs ? 'Hide Logs' : 'Show Logs'}</span>
              {showMeterLogs ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {showMeterLogs && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-[#263244]">
            {/* Month / Year Filter */}
            <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">Month:</span>
                <select
                  value={meterLogsMonth}
                  onChange={(e) => {
                    setMeterLogsMonth(Number(e.target.value));
                    setMeterLogsPage(1);
                  }}
                  className="h-8 px-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">Year:</span>
                <select
                  value={meterLogsYear}
                  onChange={(e) => {
                    setMeterLogsYear(Number(e.target.value));
                    setMeterLogsPage(1);
                  }}
                  className="h-8 px-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                >
                  {availableYearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Metered Record Instance Selection & Files Excel Export */}
            <div className="p-3 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full md:w-auto min-w-0">
                <span className="font-semibold text-slate-700 dark:text-[#CBD5E1] shrink-0">
                  Select Metered Instant:
                </span>
                <select
                  value={selectedMeterRecordId}
                  onChange={(e) => setSelectedMeterRecordId(e.target.value)}
                  disabled={meterLogs.length === 0}
                  className="h-[44px] sm:h-9 px-3 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-xl text-xs font-medium text-slate-800 dark:text-[#F8FAFC] w-full sm:w-auto max-w-full truncate"
                >
                  {meterLogs.length === 0 ? (
                    <option value="">No metered instances available</option>
                  ) : (
                    meterLogs.map((log) => (
                      <option key={log.id} value={log.id}>
                        {formatDateTimeStr(log.metered_at)} — {log.used_gb} GB ({log.calculated_credits} Credits)
                      </option>
                    ))
                  )}
                </select>
              </div>

              <Button
                size="sm"
                variant="outline"
                disabled={!selectedMeterRecordId || exportingMeterFiles}
                onClick={handleDownloadMeterFilesExcel}
                className="h-[44px] px-4 border-emerald-300 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 font-semibold text-xs flex items-center justify-center gap-1.5 shrink-0 w-full sm:w-auto hover:bg-emerald-100 dark:hover:bg-emerald-950/40"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{exportingMeterFiles ? 'Exporting Inventory...' : 'Download Files Excel'}</span>
              </Button>
            </div>

            {meterLogsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : meterLogsError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
                <span>{meterLogsError}</span>
                <Button size="xs" variant="outline" onClick={fetchMeterLogs}>Retry</Button>
              </div>
            ) : meterLogs.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                No storage usage metered for {MONTH_NAMES[meterLogsMonth - 1]} {meterLogsYear}.
              </div>
            ) : (
              <>
                {/* Mobile Stacked Cards for Meter Logs */}
                <div className="block md:hidden space-y-3">
                  {meterLogs.map((log) => (
                    <div key={log.id} className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-2 text-xs">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Metered Date:</span>
                        <strong className="text-slate-900 dark:text-[#F8FAFC]">{formatDateTimeStr(log.metered_at)}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Storage Used:</span>
                        <span className="font-semibold text-slate-800 dark:text-[#CBD5E1]">{log.used_gb} GB ({formatBytes(log.used_bytes)})</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Rate per GB:</span>
                        <span className="text-slate-700 dark:text-[#CBD5E1]">{log.credit_rate_per_gb}</span>
                      </div>
                      <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#263244]">
                        <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Calculated Credits:</span>
                        <strong className="text-blue-600 dark:text-blue-400 font-bold">{log.calculated_credits} Credits</strong>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop Table View for Meter Logs */}
                <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-[#263244] rounded-xl">
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

                {/* Pagination bar */}
                {meterLogsCount > 25 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
                    <span>Total {meterLogsCount} meter records</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={meterLogsPage === 1}
                        onClick={() => setMeterLogsPage((p) => p - 1)}
                        className="h-[44px] min-h-[44px] px-3 font-semibold"
                      >
                        Previous
                      </Button>
                      <span className="px-2 font-medium">Page {meterLogsPage}</span>
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={meterLogsPage * 25 >= meterLogsCount}
                        onClick={() => setMeterLogsPage((p) => p + 1)}
                        className="h-[44px] min-h-[44px] px-3 font-semibold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </Card>

      {/* 5. STORAGE CREDIT SETTLEMENT HISTORY SECTION (COLLAPSIBLE) */}
      <Card className="p-4 sm:p-5 bg-white dark:bg-[#111827] border-slate-200 dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-bold text-slate-900 dark:text-[#F8FAFC] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Storage Credit Settlement History</span>
              <span className="text-xs font-normal text-slate-500 dark:text-[#94A3B8]">({settlementsCount})</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-[#94A3B8]">
              Authoritative ledger record of monthly storage credit debits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={exportingSettlements}
              onClick={handleExportSettlements}
              className="h-9 px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{exportingSettlements ? 'Exporting...' : 'Download Settlement Excel'}</span>
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setShowSettlements(!showSettlements)}
              className="h-9 px-3 border-slate-200 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1] font-semibold text-xs flex items-center gap-1.5"
            >
              <span>{showSettlements ? 'Hide Settlements' : 'Show Settlements'}</span>
              {showSettlements ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {showSettlements && (
          <div className="space-y-4 pt-2 border-t border-slate-100 dark:border-[#263244]">
            {/* Month / Year Filter */}
            <div className="flex items-center gap-2 flex-wrap bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">Month:</span>
                <select
                  value={settlementsMonth}
                  onChange={(e) => {
                    setSettlementsMonth(Number(e.target.value));
                    setSettlementsPage(1);
                  }}
                  className="h-8 px-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                >
                  {MONTH_NAMES.map((name, idx) => (
                    <option key={idx + 1} value={idx + 1}>{name}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-slate-600 dark:text-[#CBD5E1]">Year:</span>
                <select
                  value={settlementsYear}
                  onChange={(e) => {
                    setSettlementsYear(Number(e.target.value));
                    setSettlementsPage(1);
                  }}
                  className="h-8 px-2 bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#334155] rounded-lg text-xs font-medium text-slate-700 dark:text-[#F8FAFC]"
                >
                  {availableYearsList.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Selected Period Summary Header */}
            <div className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
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
                  <div key={i} className="h-12 bg-slate-100 dark:bg-[#0F172A] rounded-xl animate-pulse"></div>
                ))}
              </div>
            ) : settlementsError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 rounded-xl flex items-center justify-between text-xs text-rose-800 dark:text-rose-300">
                <span>{settlementsError}</span>
                <Button size="xs" variant="outline" onClick={fetchSettlements}>Retry</Button>
              </div>
            ) : settlements.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-[#94A3B8]">
                No storage credit settlements for {MONTH_NAMES[settlementsMonth - 1]} {settlementsYear}.
              </div>
            ) : (
              <>
                {/* Mobile Stacked Cards for Settlements */}
                <div className="block md:hidden space-y-3">
                  {settlements.map((s) => {
                    const statusLabel = s.settlement_status || (s.status === 'DEBITED' ? 'PAID' : s.status);
                    const isPaid = statusLabel === 'PAID';
                    const isPartial = statusLabel === 'PARTIALLY_PAID';

                    return (
                      <div
                        key={s.id}
                        onClick={() => setSelectedSettlementDetail(s)}
                        className="p-3.5 bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-2 text-xs cursor-pointer hover:border-blue-400 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Settlement Date:</span>
                          <strong className="text-slate-900 dark:text-[#F8FAFC]">{formatDateTimeStr(s.settled_at || s.debited_at || s.created_at)}</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Storage Billed:</span>
                          <span className="font-semibold text-slate-800 dark:text-[#CBD5E1]">{s.storage_billed || s.original_amount || s.accumulated_credits} Credits</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Credits Paid:</span>
                          <strong className="text-emerald-600 dark:text-emerald-400 font-semibold">{s.credits_paid || s.paid_amount || s.credits_debited} Credits</strong>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Outstanding:</span>
                          <strong className="text-amber-600 dark:text-amber-400 font-semibold">{s.outstanding || s.outstanding_amount || '0.0000'} Credits</strong>
                        </div>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-200 dark:border-[#263244]">
                          <span className="text-[11px] text-slate-500 dark:text-[#94A3B8]">Status:</span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${isPaid
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : isPartial
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                            }`}>
                            {isPaid ? 'Paid' : isPartial ? 'Partially Paid' : 'Unpaid'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Desktop Table View for Settlements */}
                <div className="hidden md:block overflow-x-auto border border-slate-200 dark:border-[#263244] rounded-xl">
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
                              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ${isPaid
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

                {/* Pagination Bar */}
                {settlementsCount > 25 && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-[#94A3B8] pt-1">
                    <span>Total {settlementsCount} settlement records</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={settlementsPage === 1}
                        onClick={() => setSettlementsPage((p) => p - 1)}
                        className="h-[44px] min-h-[44px] px-3 font-semibold"
                      >
                        Previous
                      </Button>
                      <span className="px-2 font-medium">Page {settlementsPage}</span>
                      <Button
                        size="xs"
                        variant="outline"
                        disabled={settlementsPage * 25 >= settlementsCount}
                        onClick={() => setSettlementsPage((p) => p + 1)}
                        className="h-[44px] min-h-[44px] px-3 font-semibold"
                      >
                        Next
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
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
                  className="bg-[#2563EB] text-white shrink-0 h-9 px-3"
                >
                  {savingDisplayName ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </div>

            {/* Media Player / Preview */}
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-[#334155] bg-slate-900">
              {detailAsset.media_type === 'VIDEO' ? (
                <LessonVideoPlayer
                  media={detailAsset}
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
                <p className="font-medium text-slate-900 dark:text-[#F8FAFC] break-all" title={detailAsset.original_filename}>
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
                      <span className="flex items-center gap-1.5 min-w-0">
                        <Pin className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-hidden="true" />
                        <strong className="truncate">{u.type}:</strong> <span className="truncate">{u.title}</span>
                      </span>
                      <span className="text-slate-500 font-medium shrink-0 ml-2">{u.context}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-slate-500 dark:text-[#94A3B8] text-[11px]">
                  Not currently used anywhere.
                </p>
              )}
            </div>

            {/* Actions: Copy Link & Download (Delete hidden) */}
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

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setDetailAsset(null)}
                  className="h-9 border-slate-300 dark:border-[#334155] text-slate-700 dark:text-[#CBD5E1]"
                >
                  Close
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const targetAsset = detailAsset;
                    setDetailAsset(null);
                    handlePromptDelete(targetAsset);
                  }}
                  className="h-9 border-rose-200 dark:border-rose-900/40 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 font-medium"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Asset
                </Button>
              </div>
            </div>
          </div>
        )}
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

      {/* MOBILE FLOATING BULK DELETE ACTION BAR */}
      {selectedAssetIds.size > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden bg-slate-900/95 dark:bg-[#0F172A]/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-xl border border-slate-700 dark:border-[#334155] flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
              {selectedAssetIds.size}
            </span>
            <span className="text-xs font-medium text-slate-200">Selected</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={clearSelection}
              className="px-2.5 py-1.5 text-xs text-slate-300 hover:text-white font-medium cursor-pointer"
            >
              Clear
            </button>
            <Button
              size="sm"
              onClick={() => setBulkDeleteModalOpen(true)}
              className="bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold px-3 h-9 rounded-xl flex items-center gap-1.5 shadow-2xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      )}

      {/* BULK DELETE CONFIRMATION MODAL */}
      <Modal
        isOpen={bulkDeleteModalOpen}
        onClose={() => {
          if (!isBulkDeleting) {
            setBulkDeleteModalOpen(false);
          }
        }}
        title={`Confirm Bulk Deletion (${selectedAssetIds.size} files)`}
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <p className="text-slate-600 dark:text-[#CBD5E1]">
            Are you sure you want to permanently delete the following <strong className="text-slate-900 dark:text-white">{selectedAssetIds.size} selected file(s)</strong>?
          </p>

          <div className="max-h-48 overflow-y-auto bg-slate-50 dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] p-3 rounded-xl space-y-1.5 text-[11px]">
            {mediaAssets
              .filter((a) => selectedAssetIds.has(a.id))
              .map((asset) => (
                <div key={asset.id} className="flex items-center justify-between text-slate-800 dark:text-[#CBD5E1]">
                  <span className="truncate max-w-[240px] font-medium">{asset.display_name || asset.original_filename}</span>
                  <span className="text-slate-400 shrink-0">{formatBytes(asset.total_storage_bytes || asset.size_bytes)}</span>
                </div>
              ))}
            {selectedAssetIds.size > mediaAssets.filter((a) => selectedAssetIds.has(a.id)).length && (
              <p className="text-slate-400 italic text-[10px] pt-1">
                + {selectedAssetIds.size - mediaAssets.filter((a) => selectedAssetIds.has(a.id)).length} selected file(s) from other pages
              </p>
            )}
          </div>

          <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
            Rechecking usage references... Referenced files will be automatically protected from deletion.
          </p>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkDeleting}
              onClick={() => setBulkDeleteModalOpen(false)}
              className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-slate-300 dark:border-[#334155]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              disabled={isBulkDeleting}
              onClick={handleConfirmBulkDelete}
              className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-medium min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
            >
              {isBulkDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Deleting Files...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Delete Selected ({selectedAssetIds.size})
                </>
              )}
            </Button>
          </div>
        </div>
      </Modal>

      {/* BULK BLOCKED / FAILED FEEDBACK MODAL */}
      <Modal
        isOpen={bulkBlockedItems.length > 0}
        onClose={() => setBulkBlockedItems([])}
        title="Bulk Deletion Summary"
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 space-y-1">
            <div className="flex items-center gap-1.5 font-semibold text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <span>Some files could not be deleted</span>
            </div>
            <p className="text-[11px]">
              {bulkBlockedItems.length} file(s) are actively referenced or shared in your academy. Unused files were deleted successfully.
            </p>
          </div>

          <div className="max-h-60 overflow-y-auto space-y-2">
            {bulkBlockedItems.map((item, idx) => (
              <div
                key={item.id || idx}
                className="p-3 bg-white dark:bg-[#0F172A] border border-slate-200 dark:border-[#263244] rounded-xl space-y-1 text-xs"
              >
                <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-[#F8FAFC]">
                  <span className="truncate max-w-[220px]">{item.filename || item.id}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 font-medium">
                    Blocked
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-[#94A3B8] leading-relaxed">
                  {item.reason}
                </p>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-slate-200 dark:border-[#263244]">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setBulkBlockedItems([])}
              className="font-medium h-9 px-4 rounded-xl border-slate-300 dark:border-[#334155]"
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModalAsset && (
        <Modal
          isOpen={!!deleteModalAsset}
          onClose={() => {
            if (!isDeleting) {
              setDeleteModalAsset(null);
              setDeleteError(null);
            }
          }}
          title="Confirm Asset Deletion"
        >
          <div className="space-y-4 text-xs font-sans text-left">
            <p className="text-slate-600 dark:text-[#CBD5E1]">
              Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-white break-all">{deleteModalAsset.original_filename}</strong>?
            </p>
            <p className="text-[11px] text-slate-500 dark:text-[#94A3B8]">
              This action will remove the physical media file from storage and clear its database record.
            </p>

            {deleteError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-rose-700 dark:text-rose-300 text-xs font-medium space-y-1">
                <div className="flex items-center gap-1.5 font-semibold">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600 dark:text-rose-400" />
                  <span>Deletion Blocked</span>
                </div>
                <p className="text-[11px] leading-relaxed">{deleteError}</p>
              </div>
            )}

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-[#263244]">
              <Button
                size="sm"
                variant="outline"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalAsset(null);
                  setDeleteError(null);
                }}
                className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-slate-300 dark:border-[#334155]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="w-full sm:w-auto bg-rose-600 hover:bg-rose-700 text-white font-medium min-h-[42px] rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    Delete Asset
                  </>
                )}
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

