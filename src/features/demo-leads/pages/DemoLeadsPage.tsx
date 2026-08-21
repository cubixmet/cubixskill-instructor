import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Plus,
  Calendar,
  UserCheck,
  Clock,
  Mail,
  Phone,
  Building2,
  Users,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  FileText,
  Activity,
  UserPlus,
  ArrowRight,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { EmptyState } from '../../../components/ui/EmptyState';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';
import { leadsService, type LeadData, type LeadSummaryData, type LeadTimelineEvent } from '../../../services/leads.service';
import { authStore } from '../../../store/auth.store';

export const DemoLeadsPage: React.FC = () => {
  const navigate = useNavigate();

  // Auth role check
  const user = authStore.getState().user;
  const userRole = (user?.role || 'instructor') as string;
  const canManageLeads = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';

  // Filters & Pagination
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 15;

  // Data State
  const [leads, setLeads] = useState<LeadData[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [summary, setSummary] = useState<LeadSummaryData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isError, setIsError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // Modals & Drawers State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<LeadData | null>(null);
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [timelineDrawerOpen, setTimelineDrawerOpen] = useState(false);
  const [timelineEvents, setTimelineEvents] = useState<LeadTimelineEvent[]>([]);
  const [timelineLoading, setTimelineLoading] = useState(false);
  const [convertModalOpen, setConvertModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Form states
  const [addForm, setAddForm] = useState({ full_name: '', email: '', phone: '', source: 'WEBSITE', priority: 'NORMAL' });
  const [addFormErrors, setAddFormErrors] = useState<{ full_name?: string; email?: string; general?: string }>({});
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [newStatus, setNewStatus] = useState<string>('CONTACTED');
  const [lostReason, setLostReason] = useState<string>('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [followUpForm, setFollowUpForm] = useState({ scheduled_at: '', follow_up_type: 'CALL', notes: '' });
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

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

  // Fetch dashboard metrics summary
  const fetchSummary = useCallback(async () => {
    try {
      const data = await leadsService.getSummary();
      setSummary(data);
    } catch (_) {
      // Non-critical metric failure
    }
  }, []);

  // Fetch leads list
  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage('');
    try {
      const params: Record<string, any> = {
        page: currentPage,
        page_size: pageSize,
      };
      if (debouncedSearch) params.search = debouncedSearch;
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (priorityFilter && priorityFilter !== 'all') params.priority = priorityFilter;
      if (sourceFilter && sourceFilter !== 'all') params.source = sourceFilter;

      const response = await leadsService.listLeads(params);

      if (response && 'results' in response && Array.isArray(response.results)) {
        setLeads(response.results);
        setTotalCount(response.count ?? response.results.length);
      } else if (Array.isArray(response)) {
        setLeads(response);
        setTotalCount(response.length);
      } else {
        setLeads([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Unable to load demo leads.');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter, priorityFilter, sourceFilter]);

  useEffect(() => {
    fetchLeads();
    fetchSummary();
  }, [fetchLeads, fetchSummary]);

  const hasActiveFilters = search.trim() !== '' || statusFilter !== 'all' || priorityFilter !== 'all' || sourceFilter !== 'all';

  const clearAllFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSourceFilter('all');
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    if (leads.length === 0) {
      showToast('No leads available to export.');
      return;
    }

    const filename = `demo_leads_${new Date().toISOString().slice(0, 10)}.csv`;
    const columns: CsvColumn<LeadData>[] = [
      { header: 'Full Name', value: (row) => row.full_name },
      { header: 'Email Address', value: (row) => row.email || '' },
      { header: 'Phone Number', value: (row) => row.phone || '' },
      { header: 'Status', value: (row) => row.status },
      { header: 'Priority', value: (row) => row.priority || 'NORMAL' },
      { header: 'Source', value: (row) => row.source || '' },
      { header: 'Assigned Staff', value: (row) => row.assigned_to_name || '' },
      { header: 'Created Date', value: (row) => row.created_at },
    ];

    try {
      exportToCsv(filename, leads, columns);
      showToast(`Exported ${leads.length} demo leads to CSV.`);
    } catch (_) {
      showToast('CSV export failed. Please try again.');
    }
  };

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setAddFormErrors({});
    if (!addForm.full_name.trim()) {
      setAddFormErrors((prev) => ({ ...prev, full_name: 'Full name is required.' }));
      return;
    }

    setIsSubmittingAdd(true);
    try {
      await leadsService.createLead({
        full_name: addForm.full_name.trim(),
        email: addForm.email.trim(),
        phone: addForm.phone.trim(),
        source: addForm.source,
        priority: addForm.priority,
      });
      showToast('Demo lead registered successfully.');
      setAddModalOpen(false);
      setAddForm({ full_name: '', email: '', phone: '', source: 'WEBSITE', priority: 'NORMAL' });
      fetchLeads();
      fetchSummary();
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setAddFormErrors({
          email: Array.isArray(err.data.email) ? err.data.email[0] : err.data.email,
          full_name: Array.isArray(err.data.full_name) ? err.data.full_name[0] : err.data.full_name,
          general: err.message || 'Failed to create demo lead.',
        });
      } else {
        setAddFormErrors({ general: err.message || 'Error creating demo lead.' });
      }
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead) return;
    setIsSubmittingStatus(true);
    try {
      await leadsService.updateStatus(selectedLead.id, newStatus, lostReason);
      showToast(`Lead status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      setSelectedLead(null);
      fetchLeads();
      fetchSummary();
    } catch (err: any) {
      showToast(err.message || 'Status update failed.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleScheduleFollowUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !followUpForm.scheduled_at) return;
    setIsSubmittingFollowUp(true);
    try {
      await leadsService.scheduleFollowUp(selectedLead.id, followUpForm);
      showToast('Follow-up activity scheduled.');
      setFollowUpModalOpen(false);
      setSelectedLead(null);
      setFollowUpForm({ scheduled_at: '', follow_up_type: 'CALL', notes: '' });
      fetchLeads();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule follow-up.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleConvertLead = async (lead: LeadData) => {
    try {
      const result = await leadsService.convertLead(lead.id);
      showToast(`${lead.full_name} converted to Student successfully.`);
      fetchLeads();
      fetchSummary();
      if (result.student_id) {
        navigate(`/students/${result.student_id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Lead conversion failed.');
    }
  };

  const handleViewTimeline = async (lead: LeadData) => {
    setSelectedLead(lead);
    setTimelineDrawerOpen(true);
    setTimelineLoading(true);
    try {
      const events = await leadsService.getTimeline(lead.id);
      setTimelineEvents(events);
    } catch (_) {
      setTimelineEvents([]);
    } finally {
      setTimelineLoading(false);
    }
  };

  const totalPages = Math.ceil(totalCount / pageSize) || 1;
  const startRecord = (currentPage - 1) * pageSize + 1;
  const endRecord = Math.min(currentPage * pageSize, totalCount);

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'NEW':
        return 'info';
      case 'CONTACTED':
      case 'INTERESTED':
      case 'QUALIFIED':
        return 'warning';
      case 'CONVERTED':
        return 'success';
      case 'LOST':
      case 'DISQUALIFIED':
        return 'error';
      default:
        return 'neutral';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5 text-left font-sans pb-32 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
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
              <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight">
                Demo Leads CRM
              </h1>
              <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-[#172033] text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold rounded-full border border-blue-100 dark:border-[#263244]">
                {totalCount}
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium mt-0.5">
              Track prospective students, demo inquiries, follow-ups, and student conversions.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download className="w-4 h-4 text-[#0F172A] dark:text-[#F8FAFC]" />}
              onClick={handleExportCSV}
              className="border-[#E2E8F0] dark:border-[#334155] text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#172033] hover:bg-slate-50 dark:hover:bg-[#1E293B] h-9 sm:h-10 cursor-pointer"
            >
              Export CSV
            </Button>

            {canManageLeads && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Plus className="w-4 h-4 text-white" />}
                onClick={() => setAddModalOpen(true)}
                className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-bold h-9 sm:h-10 cursor-pointer shadow-xs shadow-[#2563EB]/25"
              >
                Add Lead
              </Button>
            )}
          </div>
        </div>

        {/* METRICS SUMMARY CARDS */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-[#1e293b] text-[#2563EB] rounded-lg">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Total Leads</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.total_leads}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-[#451a03] text-amber-600 rounded-lg">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">New Leads</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.new_leads}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-[#F59E0B]/10 text-[#F59E0B] rounded-lg">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Follow-Ups Today</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.follow_ups_today}</div>
              </div>
            </div>

            <div className="bg-[#F8FAFC] dark:bg-[#172033] border border-[#E2E8F0] dark:border-[#263244] p-3 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-[#064e3b] text-emerald-600 rounded-lg">
                <UserCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">Converted</div>
                <div className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{summary.converted}</div>
              </div>
            </div>
          </div>
        )}

        {/* SEARCH AND FILTERS */}
        <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] dark:text-[#94A3B8]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search leads by name, email, phone..."
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
              {/* Status Filter */}
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
                  <option value="NEW" className="dark:bg-[#111827]">New</option>
                  <option value="CONTACTED" className="dark:bg-[#111827]">Contacted</option>
                  <option value="INTERESTED" className="dark:bg-[#111827]">Interested</option>
                  <option value="QUALIFIED" className="dark:bg-[#111827]">Qualified</option>
                  <option value="FOLLOW_UP" className="dark:bg-[#111827]">Follow Up</option>
                  <option value="CONVERTED" className="dark:bg-[#111827]">Converted</option>
                  <option value="LOST" className="dark:bg-[#111827]">Lost</option>
                </select>
              </div>

              {/* Priority Filter */}
              <div className="shrink-0 flex items-center gap-1 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl px-2.5 h-9 text-xs shadow-xs">
                <span className="text-[#64748B] dark:text-[#94A3B8] font-normal hidden sm:inline">Priority:</span>
                <select
                  value={priorityFilter}
                  onChange={(e) => {
                    setPriorityFilter(e.target.value);
                    setCurrentPage(1);
                  }}
                  className="bg-transparent font-medium text-[#0F172A] dark:text-[#F8FAFC] text-xs focus:outline-none cursor-pointer"
                >
                  <option value="all" className="dark:bg-[#111827]">All Priorities</option>
                  <option value="URGENT" className="dark:bg-[#111827]">Urgent</option>
                  <option value="HIGH" className="dark:bg-[#111827]">High</option>
                  <option value="NORMAL" className="dark:bg-[#111827]">Normal</option>
                  <option value="LOW" className="dark:bg-[#111827]">Low</option>
                </select>
              </div>

              {/* Reset */}
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="shrink-0 text-xs font-semibold text-rose-600 hover:text-rose-700 flex items-center gap-1 px-2 py-1 hover:bg-rose-50 rounded-lg cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* TABLE / CONTENT AREA */}
      {isLoading ? (
        <div className="bg-white dark:bg-[#111827] p-12 rounded-[16px] border border-[#E2E8F0] dark:border-[#263244] text-center flex flex-col items-center justify-center space-y-3">
          <Loader2 className="w-8 h-8 text-[#2563EB] animate-spin" />
          <p className="text-xs font-semibold text-[#64748B] dark:text-[#94A3B8]">Loading demo leads from backend...</p>
        </div>
      ) : isError ? (
        <div className="bg-rose-50 dark:bg-[#3f1d24] p-8 rounded-[16px] border border-rose-200 text-center flex flex-col items-center justify-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-600" />
          <div>
            <h3 className="text-sm font-semibold text-rose-900 dark:text-rose-200">Unable to Load Demo Leads</h3>
            <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage}</p>
          </div>
          <Button variant="outline" size="sm" onClick={fetchLeads} className="border-rose-300 text-rose-700">
            Retry
          </Button>
        </div>
      ) : leads.length === 0 ? (
        hasActiveFilters ? (
          <EmptyState
            icon={Users}
            title="No Demo Leads Match Criteria"
            description="Try adjusting your search terms or active filters to view leads."
            actionLabel="Clear Filters"
            onAction={clearAllFilters}
            actionIcon={<RotateCcw className="w-4 h-4" />}
          />
        ) : (
          <EmptyState
            icon={Users}
            title="No Demo Leads Found"
            description="Add your first prospective student lead to manage sales pipeline and demo follow-ups."
            actionLabel={canManageLeads ? "Add First Lead" : undefined}
            onAction={canManageLeads ? () => setAddModalOpen(true) : undefined}
            actionIcon={<Plus className="w-4 h-4" />}
          />
        )
      ) : (
        <Card padding="none" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] overflow-hidden rounded-[16px] shadow-2xs">
          <div className="overflow-x-auto no-scrollbar font-sans">
            <table className="w-full text-left text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[#64748B] dark:text-[#94A3B8] text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-3.5 px-4 min-w-[200px]">Lead</th>
                  <th className="py-3.5 px-4 min-w-[140px]">Contact</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Status</th>
                  <th className="py-3.5 px-4 min-w-[100px]">Priority</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Assigned Staff</th>
                  <th className="py-3.5 px-4 min-w-[130px]">Next Follow-up</th>
                  <th className="py-3.5 px-4 min-w-[110px]">Created</th>
                  <th className="py-3.5 px-4 text-right min-w-[140px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                {leads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 dark:hover:bg-[#172033] transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC]">{lead.full_name}</div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-normal">{lead.source || 'WEBSITE'}</div>
                    </td>
                    <td className="py-3.5 px-4 text-[#64748B] dark:text-[#94A3B8]">
                      <div className="flex items-center gap-1.5 text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                        <Mail className="w-3 h-3 text-[#64748B] shrink-0" />
                        <span className="truncate max-w-[140px]">{lead.email || '—'}</span>
                      </div>
                      {lead.phone && (
                        <div className="flex items-center gap-1.5 text-[11px] text-[#64748B] mt-0.5">
                          <Phone className="w-3 h-3 text-[#64748B] shrink-0" />
                          <span>{lead.phone}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <Badge variant={getStatusBadgeVariant(lead.status)}>
                        {lead.status}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[11px]">
                      <span className={lead.priority === 'URGENT' ? 'text-rose-600' : lead.priority === 'HIGH' ? 'text-amber-600' : 'text-[#64748B]'}>
                        {lead.priority || 'NORMAL'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                      {lead.assigned_to_name || 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-[#64748B] dark:text-[#94A3B8]">
                      {new Date(lead.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewTimeline(lead)}
                          title="View Timeline"
                          className="h-7 w-7 p-0 cursor-pointer text-slate-500 hover:text-slate-900"
                        >
                          <Activity className="w-3.5 h-3.5" />
                        </Button>

                        {canManageLeads && lead.status !== 'CONVERTED' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedLead(lead);
                                setStatusModalOpen(true);
                              }}
                              title="Update Status"
                              className="h-7 px-2 text-[11px] font-semibold cursor-pointer text-[#2563EB]"
                            >
                              Status
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleConvertLead(lead)}
                              title="Convert to Student"
                              className="h-7 px-2 text-[11px] font-semibold cursor-pointer text-emerald-600 hover:bg-emerald-50"
                            >
                              Convert
                            </Button>
                          </>
                        )}
                        {lead.status === 'CONVERTED' && lead.converted_student_id && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/students/${lead.converted_student_id}`)}
                            className="h-7 px-2 text-[11px] font-semibold cursor-pointer text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                          >
                            Student Profile
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
            Showing <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{startRecord}</span>–<span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{endRecord}</span> of <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{totalCount}</span> leads
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

      {/* ADD LEAD MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Register New Lead</h3>
              <button
                type="button"
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {addFormErrors.general && (
              <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
                {addFormErrors.general}
              </div>
            )}

            <form onSubmit={handleCreateLead} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Full Name *</label>
                <input
                  type="text"
                  value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  placeholder="e.g. Rahul Sharma"
                  required
                  className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                    addFormErrors.full_name ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                  } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Email Address</label>
                <input
                  type="email"
                  value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  placeholder="rahul@example.com"
                  className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                    addFormErrors.email ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                  } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Phone Number</label>
                <input
                  type="text"
                  value={addForm.phone}
                  onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Source</label>
                  <select
                    value={addForm.source}
                    onChange={(e) => setAddForm({ ...addForm, source: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="WEBSITE">Website</option>
                    <option value="COURSE_ENQUIRY">Course Enquiry</option>
                    <option value="MANUAL">Manual Entry</option>
                    <option value="WHATSAPP">WhatsApp</option>
                    <option value="PHONE">Phone</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Priority</label>
                  <select
                    value={addForm.priority}
                    onChange={(e) => setAddForm({ ...addForm, priority: e.target.value })}
                    className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setAddModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingAdd} className="bg-[#2563EB] text-white">
                  {isSubmittingAdd ? 'Saving...' : 'Register Lead'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* UPDATE STATUS MODAL */}
      {statusModalOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Update Lead Status</h3>
              <button
                type="button"
                onClick={() => setStatusModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="NEW">New</option>
                  <option value="CONTACTED">Contacted</option>
                  <option value="INTERESTED">Interested</option>
                  <option value="QUALIFIED">Qualified</option>
                  <option value="FOLLOW_UP">Follow Up</option>
                  <option value="LOST">Lost</option>
                  <option value="DISQUALIFIED">Disqualified</option>
                </select>
              </div>

              {(newStatus === 'LOST' || newStatus === 'DISQUALIFIED') && (
                <div className="space-y-1">
                  <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Reason</label>
                  <textarea
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    rows={3}
                    placeholder="Provide reason for closing/losing this lead..."
                    className="w-full p-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-normal focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmittingStatus} className="bg-[#2563EB] text-white">
                  {isSubmittingStatus ? 'Updating...' : 'Save Status'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TIMELINE DRAWER */}
      {timelineDrawerOpen && selectedLead && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs animate-fade-in">
          <div className="bg-white dark:bg-[#111827] border-l border-[#E2E8F0] dark:border-[#263244] w-full max-w-md h-full p-6 flex flex-col justify-between shadow-2xl text-left">
            <div className="space-y-4 overflow-y-auto pr-1">
              <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
                <div>
                  <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">{selectedLead.full_name}</h3>
                  <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Activity & Communication History</p>
                </div>
                <button
                  type="button"
                  onClick={() => setTimelineDrawerOpen(false)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {timelineLoading ? (
                <div className="py-12 text-center flex flex-col items-center justify-center space-y-2">
                  <Loader2 className="w-6 h-6 text-[#2563EB] animate-spin" />
                  <span className="text-xs text-[#64748B]">Loading activity timeline...</span>
                </div>
              ) : timelineEvents.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  No recorded timeline events for this lead yet.
                </div>
              ) : (
                <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-4 py-2">
                  {timelineEvents.map((evt, idx) => (
                    <div key={idx} className="relative pl-5 space-y-1">
                      <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
                      <div className="flex items-center justify-between text-[11px] text-[#64748B]">
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{evt.event}</span>
                        <span>{new Date(evt.timestamp).toLocaleString()}</span>
                      </div>
                      {evt.performed_by && (
                        <div className="text-[10px] text-slate-500 font-medium">By: {evt.performed_by}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#263244] flex items-center justify-end">
              <Button variant="outline" size="sm" onClick={() => setTimelineDrawerOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
