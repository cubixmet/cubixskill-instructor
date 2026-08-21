import React, { useState, useEffect, useCallback } from 'react';
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
  Edit3,
  BookOpen,
  Send,
  Layers,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import {
  certificatesService,
  type CertificateData,
  type CertificateSummaryData,
  type CertificateTemplateData,
} from '../../../services/certificates.service';
import { coursesService } from '../../../services/courses.service';
import type { CourseListItem } from '../../../features/courses/types/course.types';
import { authStore } from '../../../store/auth.store';

export const CertificateListPage: React.FC = () => {
  const navigate = useNavigate();
  const authState = authStore.getState();
  const user = authState.user;
  const userRole = (user?.role || 'instructor') as string;
  const canManageCertificates = userRole === 'admin' || userRole === 'instructor';

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

  const [certificates, setCertificates] = useState<CertificateData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summary, setSummary] = useState<CertificateSummaryData | null>(null);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Templates State
  const [templates, setTemplates] = useState<CertificateTemplateData[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState<boolean>(false);

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

  // Load courses
  useEffect(() => {
    coursesService.listCourses({ page_size: 100 }).then((res) => {
      if (res && 'results' in res && Array.isArray(res.results)) {
        setCourses(res.results);
      } else if (Array.isArray(res)) {
        setCourses(res);
      }
    }).catch(() => {});
  }, []);

  // Fetch summary
  const fetchSummary = useCallback(async () => {
    try {
      const data = await certificatesService.getSummary();
      setSummary(data);
    } catch (_) {}
  }, []);

  // Fetch issued certificates
  const fetchCertificates = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
        ordering,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (courseFilter && courseFilter !== 'all') params.course_id = courseFilter;

      const response = await certificatesService.listCertificates(params);

      if (response && 'results' in response && Array.isArray(response.results)) {
        setCertificates(response.results);
        setTotalCount(response.count ?? response.results.length);
      } else if (Array.isArray(response)) {
        setCertificates(response);
        setTotalCount(response.length);
      } else {
        setCertificates([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Unable to load certificates.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, courseFilter, ordering]);

  // Fetch templates
  const fetchTemplates = useCallback(async () => {
    setIsLoadingTemplates(true);
    try {
      const tmplList = await certificatesService.listTemplates();
      setTemplates(tmplList);
    } catch (err: any) {
      showToast(err.message || 'Failed to load templates.');
    } finally {
      setIsLoadingTemplates(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'issued') {
      fetchCertificates();
      fetchSummary();
    } else {
      fetchTemplates();
    }
  }, [activeTab, fetchCertificates, fetchSummary, fetchTemplates]);

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
      fetchCertificates();
      fetchSummary();
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
      fetchTemplates();
    } catch (err: any) {
      showToast(err.message || 'Failed to duplicate template.');
    }
  };

  const handlePublishTemplate = async (tmplId: string) => {
    try {
      const res = await certificatesService.publishTemplate(tmplId);
      showToast(res.message);
      fetchTemplates();
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
      <div className="bg-white dark:bg-[#111827] p-4 sm:p-6 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] rounded-xl border border-blue-100 dark:border-[#263244]">
                <Award className="w-5 h-5" />
              </div>
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Course Completion Certificates
              </h1>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-1">
              Design visual templates, manage dynamic layout bindings, and process student credential downloads.
            </p>
          </div>

          {canManageCertificates && (
            <div className="flex items-center gap-2">
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4 text-white" />}
                onClick={() => navigate('/certificates/new')}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 sm:h-10 cursor-pointer shadow-xs shadow-[#2563EB]/25"
              >
                Create Template
              </Button>
            </div>
          )}
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex items-center gap-2 border-b border-[#E2E8F0] dark:border-[#263244] pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('issued')}
            className={`pb-2.5 px-3 text-xs font-bold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'issued'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Issued Certificates ({totalCount})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('templates')}
            className={`pb-2.5 px-3 text-xs font-bold cursor-pointer border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'templates'
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA]'
                : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
            }`}
          >
            <Layout className="w-4 h-4" />
            <span>Certificate Templates</span>
          </button>
        </div>

        {/* METRICS SUMMARY CARDS (ON ISSUED TAB) */}
        {activeTab === 'issued' && summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3.5 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-[#1e293b] text-[#2563EB] rounded-lg">
                <FileCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Total Issued</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.total_certificates}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3.5 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Issued This Month</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.issued_this_month}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3.5 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Active Credentials</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.active_certificates}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3.5 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-rose-100 dark:bg-[#3f1d24] text-rose-600 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Revoked</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.revoked_certificates}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH AND FILTERS (ON ISSUED TAB) */}
        {activeTab === 'issued' && (
          <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by student, course, certificate no..."
                  className="w-full h-10 pl-9 pr-8 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] placeholder:text-[#64748B] focus:outline-none focus:border-[#2563EB]"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] p-0.5 rounded-full cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
                {courses.length > 0 && (
                  <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-2.5 h-9 text-xs shadow-xs">
                    <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Course:</span>
                    <select
                      value={courseFilter}
                      onChange={(e) => {
                        setCourseFilter(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer max-w-[150px] truncate"
                    >
                      <option value="all" className="dark:bg-[#111827]">All Courses</option>
                      {courses.map((c) => (
                        <option key={c.id} value={c.id} className="dark:bg-[#111827] truncate">
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-2.5 h-9 text-xs shadow-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => {
                      setStatusFilter(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="dark:bg-[#111827]">All Statuses</option>
                    <option value="ISSUED" className="dark:bg-[#111827]">Issued</option>
                    <option value="REVOKED" className="dark:bg-[#111827]">Revoked</option>
                  </select>
                </div>

                <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-2.5 h-9 text-xs shadow-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Sort:</span>
                  <select
                    value={ordering}
                    onChange={(e) => {
                      setOrdering(e.target.value);
                      setCurrentPage(1);
                    }}
                    className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer"
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
                    className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 hover:bg-rose-50 dark:hover:bg-[#3f1d24] rounded-lg cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset</span>
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
              <Button variant="outline" size="sm" onClick={fetchCertificates} className="border-rose-300 text-rose-700">
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
            <Card padding="none" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] overflow-hidden rounded-[16px] shadow-2xs">
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
                          <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                            {cert.student_name_snapshot || 'Student'}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[#0F172A] dark:text-[#F8FAFC]">
                          <div className="font-semibold text-xs truncate max-w-[220px]">
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
                              className="h-7 px-2 text-[11px] font-semibold cursor-pointer text-[#2563EB] hover:bg-blue-50 dark:hover:bg-[#172033]"
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
                                className="h-7 px-2 text-[11px] font-semibold cursor-pointer text-rose-600 hover:bg-rose-50 dark:hover:bg-[#3f1d24]"
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
          )}

          {/* PAGINATION */}
          {totalCount > pageSize && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-xl border border-[#E2E8F0] dark:border-[#263244]">
              <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Showing <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{startRecord}</span>–<span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{endRecord}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{totalCount}</span> certificates
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Previous
                </Button>
                <span className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  className="h-8 px-2.5 text-xs cursor-pointer disabled:opacity-50"
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
          ) : templates.length === 0 ? (
            <EmptyState
              icon={Layout}
              title="No Certificate Templates Created"
              description="Create a visual certificate layout template with dynamic field placeholders."
              actionLabel="Create First Template"
              onAction={() => navigate('/certificates/new')}
              actionIcon={<Plus className="w-4 h-4" />}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((tmpl) => (
                <Card
                  key={tmpl.id}
                  className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-5 rounded-[16px] shadow-2xs flex flex-col justify-between space-y-4"
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
                      <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">{tmpl.name}</h3>
                      <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 line-clamp-2">
                        {tmpl.description || 'Custom certificate design layout template.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      <span>Page: <strong>{tmpl.page_size || 'A4'}</strong></span>
                      <span>Orientation: <strong>{tmpl.orientation || 'LANDSCAPE'}</strong></span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#263244] flex items-center justify-between gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/certificates/new`)}
                      leftIcon={<Edit3 className="w-3.5 h-3.5" />}
                      className="text-xs font-semibold h-8"
                    >
                      Edit Designer
                    </Button>

                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleDuplicateTemplate(tmpl.id)}
                        title="Duplicate Template"
                        className="p-1.5 text-slate-500 hover:text-slate-900 dark:text-[#94A3B8] dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-[#172033] cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handlePublishTemplate(tmpl.id)}
                        title="Publish New Version"
                        className="p-1.5 text-[#2563EB] hover:text-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-[#172033] cursor-pointer"
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
                        className="p-1.5 text-emerald-600 hover:text-emerald-700 rounded-lg hover:bg-emerald-50 dark:hover:bg-[#064e3b]/30 cursor-pointer"
                      >
                        <BookOpen className="w-4 h-4" />
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
    </div>
  );
};
