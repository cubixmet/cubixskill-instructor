import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Award,
  Plus,
  Download,
  Search,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  FileCheck,
  Layout,
  Copy,
  Pencil,
  BookOpen,
  Layers,
  Trash2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  certificatesService,
  type CertificateData,
  type CertificateTemplateData,
} from '../../../services/certificates.service';
import { useAuthStore } from '../../../store/auth.store';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCertificateCourses,
  useCertificateSummary,
  useCertificateTemplates,
  useCertificateList,
  certificateKeys,
} from '../hooks/useCertificateQueries';

export const CertificateListPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const auth = useAuthStore();
  const user = auth.user;
  const userRole = String(user?.role || 'instructor').toLowerCase();
  const canManageCertificates = !userRole || userRole.includes('admin') || userRole.includes('instructor') || userRole.includes('staff');

  // Tabs: 'issued' | 'templates'
  const [activeTab, setActiveTab] = useState<'issued' | 'templates'>('issued');

  // Issued Certificates State
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courseFilter, setCourseFilter] = useState<string>('all');
  const [ordering, setOrdering] = useState<string>('recent');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // React Query server state owners
  const { data: courses = [] } = useCertificateCourses();
  const { data: summary = null } = useCertificateSummary();
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    isError: isTemplatesError,
    error: templatesQueryError,
    refetch: refetchTemplates,
  } = useCertificateTemplates();

  const listParams = React.useMemo(() => {
    const params: Record<string, any> = {
      page: currentPage,
      page_size: pageSize,
      ordering,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
    if (courseFilter && courseFilter !== 'all') params.course_id = courseFilter;
    return params;
  }, [currentPage, pageSize, ordering, debouncedSearch, statusFilter, courseFilter]);

  const {
    data: listResponse,
    isLoading,
    isError,
    error: listQueryError,
    refetch: refetchCertificates,
  } = useCertificateList(listParams);

  const certificates: CertificateData[] = React.useMemo(() => {
    if (listResponse && 'results' in listResponse && Array.isArray(listResponse.results)) {
      return listResponse.results;
    }
    if (Array.isArray(listResponse)) {
      return listResponse;
    }
    return [];
  }, [listResponse]);

  const totalCount: number = React.useMemo(() => {
    if (listResponse && 'results' in listResponse && typeof listResponse.count === 'number') {
      return listResponse.count;
    }
    if (Array.isArray(listResponse)) {
      return listResponse.length;
    }
    return 0;
  }, [listResponse]);

  const errorMessage = listQueryError ? (listQueryError as any).message || 'Unable to load certificates.' : '';

  // Modals
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState<CertificateData | null>(null);
  const [revokeReason, setRevokeReason] = useState('');
  const [isRevoking, setIsRevoking] = useState(false);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  // Assign Course Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [targetTemplate, setTargetTemplate] = useState<CertificateTemplateData | null>(null);
  const [selectedAssignCourseId, setSelectedAssignCourseId] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Delete Template Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<CertificateTemplateData | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all' || courseFilter !== 'all' || ordering !== 'recent';

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setCourseFilter('all');
    setOrdering('recent');
    setCurrentPage(1);
  };

  const handleDownloadPDF = async (cert: CertificateData) => {
    setDownloadingId(cert.id);
    try {
      const blob = await certificatesService.downloadCertificate(cert.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `certificate_${cert.certificate_number || cert.id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast('Certificate PDF downloaded.');
    } catch (err: any) {
      showToast(err.message || 'Failed to download certificate PDF.');
    } finally {
      setDownloadingId(null);
    }
  };

  const handleRevokeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCert) return;
    setIsRevoking(true);
    try {
      await certificatesService.revokeCertificate(selectedCert.id, revokeReason);
      showToast(`Certificate ${selectedCert.certificate_number} revoked.`);
      setRevokeModalOpen(false);
      setSelectedCert(null);
      setRevokeReason('');
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    } catch (err: any) {
      showToast(err.message || 'Failed to revoke certificate.');
    } finally {
      setIsRevoking(false);
    }
  };

  const handleDuplicateTemplate = async (tmplId: string) => {
    try {
      const dup = await certificatesService.duplicateTemplate(tmplId);
      showToast(`Duplicated template as "${dup.name}"`);
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || err?.response?.data?.message || (Array.isArray(err?.response?.data) ? err.response.data[0] : null) || err.message || 'Failed to duplicate template.';
      showToast(msg);
    }
  };

  const handlePublishTemplate = async (tmplId: string) => {
    try {
      const res = await certificatesService.publishTemplate(tmplId);
      showToast(res.message);
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
    } catch (err: any) {
      showToast(err.message || 'Failed to publish version.');
    }
  };

  const handleAssignCourseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetTemplate || !selectedAssignCourseId) return;
    setIsAssigning(true);
    try {
      const res = await certificatesService.assignCourseToTemplate(targetTemplate.id, selectedAssignCourseId);
      showToast(res.message);
      setAssignModalOpen(false);
      setTargetTemplate(null);
      setSelectedAssignCourseId('');
    } catch (err: any) {
      showToast(err.message || 'Failed to assign template to course.');
    } finally {
      setIsAssigning(false);
    }
  };

  const handleDeleteTemplateConfirm = async () => {
    if (!templateToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      const res = await certificatesService.deleteTemplate(templateToDelete.id);
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
      queryClient.invalidateQueries({ queryKey: certificateKeys.summary() });
      showToast(res?.message || 'Certificate template deleted.');
      setDeleteModalOpen(false);
      setTemplateToDelete(null);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.response?.data?.detail || err?.message || 'Failed to delete template.';
      showToast(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className="space-y-4 sm:space-y-6 text-left font-sans pb-32 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl animate-fade-in flex items-center gap-2">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-0.5 hover:bg-slate-700 rounded cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* HEADER BAR */}
      <div className="bg-white dark:bg-[#111827] p-3.5 sm:p-6 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-xl border border-blue-100 dark:border-[#263244] shrink-0">
                <Award className="w-5 h-5" />
              </div>
              <h1 className="text-lg sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight leading-snug">
                Course Completion Certificates
              </h1>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-1 leading-relaxed">
              Design visual templates, manage dynamic layout bindings, and process student credential downloads.
            </p>
          </div>

          {canManageCertificates && (
            <div className="w-full sm:w-auto shrink-0 pt-2 sm:pt-0">
              {isLoadingTemplates ? (
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin text-[#2563EB]" />
                  <span>Checking template status...</span>
                </div>
              ) : isTemplatesError ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-rose-600 dark:text-rose-400">Failed to load templates</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => refetchTemplates()}
                    className="min-h-[44px] px-3 text-xs"
                  >
                    Retry
                  </Button>
                </div>
              ) : (
                (() => {
                  const configuredCourseIds = new Set(
                    templates
                      .map((t) => t.course_id || t.template_data?.selected_course_id)
                      .filter(Boolean)
                  );
                  const allCoursesHaveTemplates = courses.length > 0 && courses.every((c) => configuredCourseIds.has(c.id));

                  if (allCoursesHaveTemplates) {
                    return (
                      <div className="flex items-center gap-2 px-3.5 py-2.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-xl text-amber-800 dark:text-amber-300 text-xs font-medium">
                        <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>All courses have certificate templates. Edit or delete an existing template to create a new one.</span>
                      </div>
                    );
                  }

                  return (
                    <Button
                      variant="primary"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4 text-white" />}
                      onClick={() => navigate('/certificates/new')}
                      className="w-full sm:w-auto min-h-[44px] bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold px-4 cursor-pointer shadow-xs shadow-[#2563EB]/25"
                    >
                      Create Certificate
                    </Button>
                  );
                })()
              )}
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-2 border-b border-[#E2E8F0] dark:border-[#263244] pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('issued')}
            className={`w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl sm:rounded-none sm:border-b-2 sm:pb-2.5 text-xs font-bold cursor-pointer transition-all flex items-center justify-start sm:justify-center gap-2 border select-none ${
              activeTab === 'issued'
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 sm:bg-transparent sm:dark:bg-transparent sm:border-t-0 sm:border-x-0 sm:border-b-[#2563EB] sm:dark:border-b-[#60A5FA]'
                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white sm:bg-transparent sm:dark:bg-transparent sm:border-transparent'
            }`}
          >
            <FileCheck className="w-4 h-4 shrink-0" />
            <span className="truncate">Issued Certificates ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`w-full sm:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl sm:rounded-none sm:border-b-2 sm:pb-2.5 text-xs font-bold cursor-pointer transition-all flex items-center justify-start sm:justify-center gap-2 border select-none ${
              activeTab === 'templates'
                ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 sm:bg-transparent sm:dark:bg-transparent sm:border-t-0 sm:border-x-0 sm:border-b-[#2563EB] sm:dark:border-b-[#60A5FA]'
                : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white sm:bg-transparent sm:dark:bg-transparent sm:border-transparent'
            }`}
          >
            <Layout className="w-4 h-4 shrink-0" />
            <span className="truncate">Certificate Templates</span>
          </button>
        </div>

        {/* METRICS SUMMARY CARDS (ON ISSUED TAB) */}
        {activeTab === 'issued' && summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 pt-2">
            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-blue-100 dark:bg-[#1e293b] text-[#2563EB] rounded-lg shrink-0">
                <FileCheck className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate">Total Issued</div>
                <div className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.total_certificates}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate">This Month</div>
                <div className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.issued_this_month}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate">Active</div>
                <div className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.active_certificates}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-rose-100 dark:bg-[#3f1d24] text-rose-600 rounded-lg shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium truncate">Revoked</div>
                <div className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.revoked_certificates}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH AND FILTERS (ON ISSUED TAB) */}
        {activeTab === 'issued' && (
          <div className="space-y-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3">
              {/* Search Bar */}
              <div className="relative w-full sm:w-72 md:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student, course, cert no..."
                  className="w-full h-11 sm:h-10 pl-9 pr-8 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] p-1.5 rounded-full cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filters Container: Stacked 100% on <640px */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-2 w-full sm:w-auto">
                {courses.length > 0 && (
                  <div className="w-full sm:w-auto flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3 h-11 sm:h-10 text-xs shadow-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold shrink-0">Course:</span>
                    <select
                      value={courseFilter}
                      onChange={(e) => {
                        setCourseFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full sm:w-auto bg-transparent font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer py-1"
                    >
                      <option value="all" className="dark:bg-[#111827]">All Courses</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-[#111827]">
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="w-full sm:w-auto flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3 h-11 sm:h-10 text-xs shadow-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold shrink-0">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto bg-transparent font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer py-1"
                  >
                    <option value="all" className="dark:bg-[#111827]">All Statuses</option>
                    <option value="ISSUED" className="dark:bg-[#111827]">Issued</option>
                    <option value="REVOKED" className="dark:bg-[#111827]">Revoked</option>
                  </select>
                </div>

                <div className="w-full sm:w-auto flex items-center gap-1.5 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-3 h-11 sm:h-10 text-xs shadow-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-semibold shrink-0">Sort:</span>
                  <select
                    value={ordering}
                    onChange={(e) => {
                      setOrdering(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="w-full sm:w-auto bg-transparent font-semibold text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer py-1"
                  >
                    <option value="recent" className="dark:bg-[#111827]">Recent First</option>
                    <option value="oldest" className="dark:bg-[#111827]">Oldest First</option>
                    <option value="student_asc" className="dark:bg-[#111827]">Student A–Z</option>
                    <option value="course_asc" className="dark:bg-[#111827]">Course A–Z</option>
                  </select>
                </div>

                {hasActiveFilters && (
                  <button
                    type="button"
                    onClick={clearAllFilters}
                    className="w-full sm:w-auto text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center justify-center gap-1 px-3.5 py-2.5 hover:bg-rose-50 dark:hover:bg-[#3f1d24] rounded-xl cursor-pointer min-h-[44px] border border-rose-200 dark:border-rose-900/40"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset Filters</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* TAB CONTENT 1 — ISSUED CERTIFICATES */}
      {activeTab === 'issued' && (
        <>
          {isLoading ? (
            <div className="bg-white dark:bg-[#111827] p-12 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Loading certificates from database...</p>
            </div>
          ) : isError ? (
            <div className="bg-rose-50 dark:bg-[#3f1d24] p-8 rounded-[16px] border border-rose-200 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600" />
              <div>
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Unable to Load Certificates</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchCertificates()} className="border-rose-300 text-rose-700 min-h-[44px] px-4">
                Retry
              </Button>
            </div>
          ) : certificates.length === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                icon={Award}
                title="No Certificates Match Criteria"
                description="Try adjusting your search terms or active filters to view certificates."
                actionLabel="Clear Filters"
                onAction={clearAllFilters}
                actionIcon={<RotateCcw className="w-4 h-4" />}
              />
            ) : (
              <EmptyState
                icon={Award}
                title="No Certificates Issued Yet"
                description="Issue course completion credentials to students after they complete learning modules."
                actionLabel={canManageCertificates ? "Create Template" : undefined}
                onAction={canManageCertificates ? () => navigate('/certificates/new') : undefined}
                actionIcon={<Plus className="w-4 h-4" />}
              />
            )
          ) : (
            <>
              {/* Mobile View: Stacked Cards */}
              <div className="block md:hidden space-y-3">
                {certificates.map((cert) => (
                  <Card
                    key={cert.id}
                    className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3.5 sm:p-4 rounded-[16px] space-y-3 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-[#263244] pb-2.5">
                      <div>
                        <div className="font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA] break-all">
                          {cert.certificate_number}
                        </div>
                        {cert.verification_code && (
                          <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                            Verification Code: {cert.verification_code}
                          </div>
                        )}
                      </div>
                      <Badge variant={cert.status === 'ISSUED' ? 'success' : 'error'}>
                        {cert.status}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs">
                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Student</span>
                        <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] break-words">
                          {cert.student_name_snapshot || 'Student'}
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Course</span>
                        <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words">
                          {cert.course_name_snapshot || 'Course'}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-1">
                        <span>Issued: {new Date(cert.issued_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2.5 border-t border-slate-100 dark:border-[#263244]">
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={downloadingId === cert.id}
                        onClick={() => handleDownloadPDF(cert)}
                        className="min-h-[44px] px-3.5 text-xs font-semibold cursor-pointer text-[#2563EB] dark:text-[#60A5FA] border-blue-200 dark:border-blue-900/50"
                      >
                        {downloadingId === cert.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Download className="w-4 h-4 mr-1.5" />
                            Download PDF
                          </>
                        )}
                      </Button>

                      {canManageCertificates && cert.status === 'ISSUED' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedCert(cert);
                            setRevokeModalOpen(true);
                          }}
                          className="min-h-[44px] px-3 text-xs font-semibold cursor-pointer text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-[#3f1d24]"
                        >
                          Revoke
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>

              {/* Desktop View: Table */}
              <Card padding="none" className="hidden md:block bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] overflow-hidden rounded-[16px] shadow-2xs">
                <div className="overflow-x-auto no-scrollbar font-sans">
                  <table className="w-full text-left text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] border-collapse">
                    <thead>
                      <tr className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">
                        <th className="py-3.5 px-4 min-w-[180px]">Certificate No.</th>
                        <th className="py-3.5 px-4 min-w-[180px]">Student</th>
                        <th className="py-3.5 px-4 min-w-[200px]">Course</th>
                        <th className="py-3.5 px-4 min-w-[110px]">Issued Date</th>
                        <th className="py-3.5 px-4 min-w-[90px]">Status</th>
                        <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                      {certificates.map((cert) => (
                        <tr key={cert.id} className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-xs font-bold text-[#2563EB] dark:text-[#60A5FA]">
                            <div>{cert.certificate_number}</div>
                            {cert.verification_code && (
                              <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-sans font-normal">
                                Code: {cert.verification_code}
                              </div>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] break-words max-w-[200px]">
                              {cert.student_name_snapshot || 'Student'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-[#0F172A] dark:text-[#F8FAFC]">
                            <div className="font-semibold text-xs break-words max-w-[240px]">
                              {cert.course_name_snapshot || 'Course'}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {new Date(cert.issued_at).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4">
                            <Badge variant={cert.status === 'ISSUED' ? 'success' : 'error'}>
                              {cert.status}
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <Button
                                variant="ghost"
                                size="sm"
                                disabled={downloadingId === cert.id}
                                onClick={() => handleDownloadPDF(cert)}
                                title="Download Certificate PDF"
                                className="h-8 px-2.5 text-[11px] font-semibold cursor-pointer text-[#2563EB] hover:bg-blue-50 dark:hover:bg-[#172033]"
                              >
                                {downloadingId === cert.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <>
                                    <Download className="w-3.5 h-3.5 mr-1" />
                                    PDF
                                  </>
                                )}
                              </Button>

                              {canManageCertificates && cert.status === 'ISSUED' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setSelectedCert(cert);
                                    setRevokeModalOpen(true);
                                  }}
                                  title="Revoke Certificate"
                                  className="h-8 px-2.5 text-[11px] font-semibold cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-[#3f1d24]"
                                >
                                  Revoke
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          )}

          {/* PAGINATION */}
          {totalCount > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 sm:p-4 rounded-xl border border-[#E2E8F0] dark:border-[#263244]">
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Showing <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{startRecord}</span>–<span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{endRecord}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{totalCount}</span> certificates
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="min-h-[44px] px-3 text-xs cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] px-2">
                  {currentPage} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="min-h-[44px] px-3 text-xs cursor-pointer disabled:opacity-50"
                >
                  Next <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}

      {/* TAB CONTENT 2 — TEMPLATES */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          {isLoadingTemplates ? (
            <div className="bg-white dark:bg-[#111827] p-12 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] text-center flex flex-col items-center justify-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
              <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Loading certificate templates...</p>
            </div>
          ) : isTemplatesError ? (
            <div className="bg-rose-50 dark:bg-[#3f1d24] p-8 rounded-[16px] border border-rose-200 dark:border-rose-900/60 text-center flex flex-col items-center justify-center space-y-3">
              <AlertCircle className="w-8 h-8 text-rose-600 dark:text-rose-400" />
              <div>
                <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Unable to Load Certificate Templates</h3>
                <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">
                  {(templatesQueryError as any)?.message || 'An error occurred while connecting to the template service.'}
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchTemplates()} className="border-rose-300 text-rose-700 dark:text-rose-300 min-h-[44px] px-4">
                Retry
              </Button>
            </div>
          ) : templates.length === 0 ? (
            <EmptyState
              icon={Layout}
              title="No Certificate Template Created"
              description="Create a visual certificate layout template with dynamic field placeholders."
              actionLabel={canManageCertificates ? "Create Certificate" : undefined}
              onAction={canManageCertificates ? () => navigate('/certificates/new') : undefined}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tmpl) => (
                <Card
                  key={tmpl.id}
                  className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-4 sm:p-5 rounded-[16px] shadow-2xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="p-2 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-xl border border-blue-100 dark:border-[#263244]">
                        <Layout className="w-5 h-5" />
                      </div>
                      <Badge variant={tmpl.is_default ? 'success' : 'neutral'}>
                        {tmpl.is_default ? 'Default' : 'Active'}
                      </Badge>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight break-words">{tmpl.name}</h3>
                      {tmpl.course_name ? (
                        <div className="flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA]">
                          <BookOpen className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{tmpl.course_name}</span>
                        </div>
                      ) : (
                        <div className="text-[11px] font-medium text-slate-400 dark:text-slate-500 mt-1 italic">
                          Unassigned Course
                        </div>
                      )}
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1.5 line-clamp-2 leading-relaxed">
                        {tmpl.description || 'Custom certificate design layout template.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <span>Page: <strong>{tmpl.page_size || 'A4'}</strong></span>
                      <span>Orientation: <strong>{tmpl.orientation || 'LANDSCAPE'}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#263244] flex flex-wrap items-center justify-between gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/certificates/${tmpl.id}/edit`)}
                      leftIcon={<Pencil className="w-4 h-4" />}
                      className="min-h-[44px] text-xs font-semibold px-3 shrink-0 border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC] hover:bg-slate-100 dark:hover:bg-[#172033]"
                    >
                      Edit
                    </Button>

                    <div className="flex items-center gap-1 flex-wrap shrink-0">
                      <button
                        type="button"
                        onClick={() => handlePublishTemplate(tmpl.id)}
                        title="Publish New Version"
                        aria-label="Publish new template version"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-[#2563EB] hover:text-blue-700 rounded-xl hover:bg-blue-50 dark:hover:bg-[#172033] cursor-pointer transition-colors shrink-0"
                      >
                        <Layers className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTargetTemplate(tmpl);
                          setAssignModalOpen(true);
                        }}
                        title="Assign to Course"
                        aria-label="Assign template to course"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-emerald-600 hover:text-emerald-700 rounded-xl hover:bg-emerald-50 dark:hover:bg-[#064e3b]/30 cursor-pointer transition-colors shrink-0"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setTemplateToDelete(tmpl);
                          setDeleteModalOpen(true);
                        }}
                        title="Delete template"
                        aria-label="Delete certificate template"
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer transition-colors shrink-0 border border-rose-200/80 dark:border-rose-900/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* REVOKE CERTIFICATE MODAL */}
      {revokeModalOpen && selectedCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Revoke Certificate</h3>
              </div>
              <button
                type="button"
                onClick={() => setRevokeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Are you sure you want to revoke certificate <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{selectedCert.certificate_number}</strong> issued to <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{selectedCert.student_name_snapshot}</strong>?
            </p>

            <form onSubmit={handleRevokeSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Revocation Reason *</label>
                <textarea
                  value={revokeReason}
                  onChange={(e) => setRevokeReason(e.target.value)}
                  required
                  rows={3}
                  placeholder="Provide explicit reason..."
                  className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setRevokeModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isRevoking} className="bg-rose-600 hover:bg-rose-700 text-white">
                  {isRevoking ? 'Revoking...' : 'Confirm Revocation'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ASSIGN COURSE MODAL */}
      {assignModalOpen && targetTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-[#2563EB]" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Assign Template to Course</h3>
              </div>
              <button
                type="button"
                onClick={() => setAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Assign template <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{targetTemplate.name}</strong> to a course for automatic issuance upon completion.
            </p>

            <form onSubmit={handleAssignCourseSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Select Course *</label>
                <select
                  value={selectedAssignCourseId}
                  onChange={(e) => setSelectedAssignCourseId(e.target.value)}
                  required
                  className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                >
                  <option value="">-- Select Course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id} className="dark:bg-[#111827]">
                      {c.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isAssigning || !selectedAssignCourseId} className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white">
                  {isAssigning ? 'Assigning...' : 'Assign Template'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CERTIFICATE TEMPLATE CONFIRMATION MODAL */}
      {deleteModalOpen && templateToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-[calc(100%-32px)] max-w-[400px] p-4 sm:p-6 space-y-4 text-left box-border mx-auto">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3 gap-2">
              <div className="flex items-start gap-2.5 min-w-0">
                <Trash2 className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
                  Delete Certificate Template?
                </h3>
              </div>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  if (!isDeleting) {
                    setDeleteModalOpen(false);
                    setTemplateToDelete(null);
                  }
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg cursor-pointer disabled:opacity-50 min-h-[44px] min-w-[44px] flex items-center justify-center shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
              Are you sure you want to delete <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{templateToDelete.name}</strong>? This action cannot be undone.
            </p>

            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => {
                  setDeleteModalOpen(false);
                  setTemplateToDelete(null);
                }}
                className="w-full sm:w-auto min-h-[44px] px-4 text-xs font-semibold border-slate-300 dark:border-slate-700 text-[#0F172A] dark:text-[#F8FAFC]"
              >
                Cancel
              </Button>
              <Button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteTemplateConfirm}
                className="w-full sm:w-auto min-h-[44px] px-4 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-xs shadow-rose-600/25"
              >
                {isDeleting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Deleting...
                  </span>
                ) : (
                  'Delete'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
