import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  Plus,
  Search,
  MessageSquare,
  ChevronDown,
  Paperclip,
  UploadCloud,
  Send,
  HelpCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LifeBuoy,
  BookOpen,
  Loader2,
  RefreshCw,
  XCircle,
  ExternalLink,
  ArrowLeft,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';
import supportService, {
  BackendSupportTicket,
} from '../../../services/support.service';
import { storageService } from '../../../services/storage.service';

const SUPPORT_OPTIONS = [
  { title: 'Chatbot & Automated FAQ Assistance', cost: 'Free', available: '24/7 Instant', enabled: true, icon: MessageSquare },
  { title: 'Priority Live Chat Support', cost: '10 Credits / ticket', available: 'Mon-Sat (9 AM - 8 PM)', enabled: true, icon: LifeBuoy },
  { title: 'Dedicated Account Manager & Strategy Call', cost: '100 Credits / month', available: 'Dedicated SLA', enabled: false, icon: ShieldCheck },
  { title: 'Remote Screen Share Troubleshooting', cost: '25 Credits / session', available: 'On-Demand', enabled: true, icon: BookOpen },
];

const FAQS = [
  {
    question: 'How are per-student credits calculated?',
    answer: 'Credits are deducted only when a student actually enrolls into your course. Each course feature (like video hosting, quizzes, and certificates) adds a transparent credit cost.'
  },
  {
    question: 'Can I connect a custom domain to my storefront?',
    answer: 'Yes! Navigate to Website Builder -> Domain & SEO to enter your custom domain and map the CNAME record to your academy.'
  },
  {
    question: 'What happens when my credit balance hits zero?',
    answer: 'Existing enrolled students maintain full access to their courses. New enrollments will be paused until you top up your credit wallet.'
  },
  {
    question: 'How do I issue accredited completion certificates?',
    answer: 'Go to Certificates Management to customize your template signature, logo, and automated issuance criteria.'
  }
];

export const SupportPage: React.FC = () => {
  const { ticketId: routeTicketId } = useParams<{ ticketId?: string }>();
  const navigate = useNavigate();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState<'tickets' | 'options' | 'knowledge'>('tickets');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Tickets List State
  const [tickets, setTickets] = useState<BackendSupportTicket[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoadingTickets, setIsLoadingTickets] = useState(true);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected Ticket Detail & Thread State
  const [selectedTicket, setSelectedTicket] = useState<BackendSupportTicket | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  // Ticket Creation Form State
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Media & CDN');
  const [newPriority, setNewPriority] = useState<'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'>('MEDIUM');
  const [newDescription, setNewDescription] = useState('');
  const [attachedFiles, setAttachedFiles] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [isUploadingAttachment, setIsUploadingAttachment] = useState(false);
  const [attachmentUploadError, setAttachmentUploadError] = useState<string | null>(null);
  const [isSubmittingTicket, setIsSubmittingTicket] = useState(false);
  const [createTicketError, setCreateTicketError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{ subject?: string; description?: string }>({});

  // Reply Form State
  const [replyText, setReplyText] = useState('');
  const [replyAttachments, setReplyAttachments] = useState<Array<{ id: string; name: string; url: string }>>([]);
  const [isUploadingReplyAttachment, setIsUploadingReplyAttachment] = useState(false);
  const [replyAttachmentError, setReplyAttachmentError] = useState<string | null>(null);
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Status Action State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Fetch Tickets List
  const fetchTickets = useCallback(async () => {
    setIsLoadingTickets(true);
    setTicketsError(null);
    try {
      const res = await supportService.getTickets({
        search: search.trim() || undefined,
        status: filterStatus !== 'all' ? filterStatus : undefined,
        category: filterCategory !== 'all' ? filterCategory : undefined,
        priority: filterPriority !== 'all' ? filterPriority : undefined,
        page: currentPage,
        page_size: itemsPerPage,
      });
      setTickets(res.results);
      setTotalCount(res.count);
    } catch (err: any) {
      console.error('Failed to load support tickets:', err);
      setTicketsError(
        err?.response?.data?.detail || err?.message || 'Failed to load support tickets. Please try again.'
      );
    } finally {
      setIsLoadingTickets(false);
    }
  }, [search, filterStatus, filterCategory, filterPriority, currentPage, itemsPerPage]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Fetch Ticket Detail
  const loadTicketDetail = useCallback(async (idOrNum: string) => {
    setIsLoadingDetail(true);
    setDetailError(null);
    try {
      const data = await supportService.getTicket(idOrNum);
      setSelectedTicket(data);
    } catch (err: any) {
      console.error('Failed to fetch ticket detail:', err);
      setDetailError(
        err?.response?.data?.detail || 'Ticket not found or you do not have permission to view it.'
      );
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  // Sync route param for ticket detail
  useEffect(() => {
    if (routeTicketId) {
      loadTicketDetail(routeTicketId);
    } else {
      const pathParts = location.pathname.split('/').filter(Boolean);
      if (pathParts.length >= 2 && pathParts[0] === 'support' && pathParts[1] !== 'new') {
        loadTicketDetail(pathParts[1]);
      }
    }
  }, [routeTicketId, location.pathname, loadTicketDetail]);

  // Polling for detail view updates
  useEffect(() => {
    if (!selectedTicket?.id || detailError) return;
    const interval = setInterval(() => {
      supportService.getTicket(selectedTicket.id).then((updated) => {
        setSelectedTicket(updated);
      }).catch(() => { });
    }, 12000);
    return () => clearInterval(interval);
  }, [selectedTicket?.id, detailError]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = totalCount || tickets.length;
    const open = tickets.filter((t) => t.status === 'OPEN').length;
    const inProgress = tickets.filter((t) => t.status === 'IN_PROGRESS').length;
    const resolved = tickets.filter((t) => t.status === 'RESOLVED' || t.status === 'CLOSED').length;
    const urgent = tickets.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH').length;
    return { total, open, inProgress, resolved, urgent };
  }, [tickets, totalCount]);

  const totalPages = Math.ceil(totalCount / itemsPerPage) || 1;

  // Handle File Upload for Create Form
  const handleFileUpload = async (file: File) => {
    setIsUploadingAttachment(true);
    setAttachmentUploadError(null);
    try {
      const mediaItem = await storageService.uploadFile(file);
      setAttachedFiles((prev) => [
        ...prev,
        {
          id: mediaItem.id,
          name: mediaItem.original_filename || file.name,
          url: mediaItem.file_url || '',
        },
      ]);
    } catch (err: any) {
      console.error('Attachment upload failed:', err);
      setAttachmentUploadError(err.message || 'File upload failed. Max size: 20MB.');
    } finally {
      setIsUploadingAttachment(false);
    }
  };

  // Handle File Upload for Reply Form
  const handleReplyFileUpload = async (file: File) => {
    setIsUploadingReplyAttachment(true);
    setReplyAttachmentError(null);
    try {
      const mediaItem = await storageService.uploadFile(file);
      setReplyAttachments((prev) => [
        ...prev,
        {
          id: mediaItem.id,
          name: mediaItem.original_filename || file.name,
          url: mediaItem.file_url || '',
        },
      ]);
    } catch (err: any) {
      console.error('Reply attachment upload failed:', err);
      setReplyAttachmentError(err.message || 'File upload failed.');
    } finally {
      setIsUploadingReplyAttachment(false);
    }
  };

  // Submit New Ticket
  const handleCreateTicket = async () => {
    const errs: { subject?: string; description?: string } = {};
    if (!newSubject.trim()) errs.subject = 'Subject line is required.';
    if (!newDescription.trim()) errs.description = 'Please describe your request in detail.';

    if (Object.keys(errs).length > 0) {
      setValidationErrors(errs);
      return;
    }

    setValidationErrors({});
    setIsSubmittingTicket(true);
    setCreateTicketError(null);

    try {
      const created = await supportService.createTicket({
        subject: newSubject.trim(),
        category: newCategory,
        priority: newPriority,
        description: newDescription.trim(),
        attachment_ids: attachedFiles.map((f) => f.id),
      });

      setIsTicketModalOpen(false);
      resetTicketForm();
      fetchTickets();
      navigate(`/support/${created.ticket_number || created.id}`);
      setSelectedTicket(created);
    } catch (err: any) {
      console.error('Ticket creation error:', err);
      setCreateTicketError(
        err?.response?.data?.detail ||
        err?.response?.data?.subject?.[0] ||
        err?.response?.data?.description?.[0] ||
        'Failed to create ticket. Entered values preserved for retry.'
      );
    } finally {
      setIsSubmittingTicket(false);
    }
  };

  // Submit Reply
  const handleSendReply = async () => {
    if (!selectedTicket || !replyText.trim()) return;

    setIsSubmittingReply(true);
    setReplyError(null);

    try {
      await supportService.addReply(selectedTicket.id, {
        message: replyText.trim(),
        attachment_ids: replyAttachments.map((f) => f.id),
      });

      setReplyText('');
      setReplyAttachments([]);
      loadTicketDetail(selectedTicket.id);
      fetchTickets();
    } catch (err: any) {
      console.error('Reply error:', err);
      setReplyError(err?.response?.data?.detail || 'Failed to submit reply. Please retry.');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  // Status Action (Close / Reopen)
  const handleStatusChange = async (targetStatus: string) => {
    if (!selectedTicket) return;
    setIsUpdatingStatus(true);
    try {
      const updated = await supportService.updateTicketStatus(selectedTicket.id, targetStatus);
      setSelectedTicket(updated);
      fetchTickets();
    } catch (err: any) {
      console.error('Status change error:', err);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const resetTicketForm = () => {
    setNewSubject('');
    setNewCategory('Media & CDN');
    setNewPriority('MEDIUM');
    setNewDescription('');
    setAttachedFiles([]);
    setValidationErrors({});
    setCreateTicketError(null);
    setAttachmentUploadError(null);
  };

  const closeDetailModal = () => {
    setSelectedTicket(null);
    setDetailError(null);
    navigate('/support');
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip px-3 sm:px-6 py-4 space-y-4 pb-28 md:pb-8 text-left font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-normal">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0 w-full">
        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-tight truncate">
            Support Desk &amp; Help Center
          </h1>
          <p className="text-[#64748B] dark:text-[#94A3B8] text-xs font-normal mt-0.5 truncate">
            Raise technical tickets, track resolution status, and access knowledge base guides.
          </p>
        </div>
        <Button
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => {
            resetTicketForm();
            setIsTicketModalOpen(true);
          }}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium h-11 sm:h-[38px] px-4 rounded-xl shadow-xs w-full sm:w-auto shrink-0 cursor-pointer min-h-[44px] sm:min-h-[38px] text-sm sm:text-xs"
        >
          Open New Ticket
        </Button>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 min-w-0 w-full">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Total Tickets</span>
            <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <p className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.total}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Open</span>
            <AlertCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <p className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.open}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.inProgress}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-base sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.resolved}</p>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#263244] gap-4 sm:gap-6 overflow-x-auto scrollbar-hide pt-1 min-w-0 w-full">
        {[
          { id: 'tickets', label: 'My Support Tickets' },
          { id: 'options', label: 'Support Channels & Credit Costs' },
          { id: 'knowledge', label: 'Instructor Knowledge Base' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'tickets' | 'options' | 'knowledge')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer min-h-[44px] flex items-center ${activeTab === tab.id
                ? 'border-[#2563EB] text-[#2563EB] dark:text-[#60A5FA] font-bold'
                : 'border-transparent text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-[#F8FAFC]'
              }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB CONTENT PANELS */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.15 }}
          className="space-y-4 min-w-0 w-full"
        >
          {activeTab === 'tickets' && (
            <>
              {/* 4. SEARCH & FILTERS BAR */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-3 sm:p-4 space-y-3 min-w-0 w-full">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                  <div className="relative flex-1 min-w-0 w-full">
                    <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ticket ref, subject, category…"
                      value={search}
                      onChange={(e) => {
                        setSearch(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="w-full h-11 sm:h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                    />
                  </div>

                  <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto shrink-0">
                    <select
                      value={filterStatus}
                      onChange={(e) => {
                        setFilterStatus(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-[38px] w-full"
                    >
                      <option value="all">All Status</option>
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => {
                        setFilterPriority(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-[38px] w-full"
                    >
                      <option value="all">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>

                    <select
                      value={filterCategory}
                      onChange={(e) => {
                        setFilterCategory(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 sm:h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px] sm:min-h-[38px] col-span-2 sm:col-span-1 w-full"
                    >
                      <option value="all">All Categories</option>
                      <option value="Media & CDN">Media &amp; CDN</option>
                      <option value="Billing & Tax">Billing &amp; Tax</option>
                      <option value="Domain & SSL">Domain &amp; SSL</option>
                      <option value="Student Access">Student Access</option>
                      <option value="General">General</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={fetchTickets}
                      className="h-11 sm:h-10 px-3 rounded-xl border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] min-h-[44px] sm:min-h-[38px] hidden sm:flex items-center justify-center"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLoadingTickets ? 'animate-spin' : ''}`} />
                    </Button>
                  </div>
                </div>
              </div>

              {/* TICKETS ERROR STATE */}
              {ticketsError && (
                <div className="bg-rose-50 dark:bg-[rgba(244,63,94,0.14)] border border-rose-200 dark:border-[rgba(244,63,94,0.22)] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-rose-700 dark:text-rose-400 w-full">
                  <div className="flex items-center gap-2 min-w-0">
                    <AlertCircle className="w-5 h-5 shrink-0" />
                    <span className="break-words text-xs">{ticketsError}</span>
                  </div>
                  <Button size="sm" onClick={fetchTickets} className="bg-rose-600 text-white hover:bg-rose-700 w-full sm:w-auto min-h-[44px] sm:min-h-[36px]">
                    Retry
                  </Button>
                </div>
              )}

              {/* 5. DESKTOP TABLE (≥ md) */}
              <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden w-full">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Ticket Ref</th>
                        <th className="px-4 py-3.5">Subject</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Priority</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Last Activity</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                      {isLoadingTickets ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <Loader2 className="w-6 h-6 animate-spin text-[#2563EB]" />
                              <p className="font-medium text-xs">Loading support tickets...</p>
                            </div>
                          </td>
                        </tr>
                      ) : tickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8] font-normal">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <HelpCircle className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
                              <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                                No Support Tickets Found
                              </p>
                              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                                Try adjusting search keywords or filter dropdowns.
                              </p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        tickets.map((tk) => (
                          <tr key={tk.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#172033] transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC] select-all font-mono">
                              {tk.ticket_number}
                            </td>
                            <td className="px-4 py-3.5">
                              <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] max-w-[280px] break-words">
                                {tk.subject}
                              </p>
                            </td>
                            <td className="px-4 py-3.5 text-[#64748B] dark:text-[#94A3B8] font-normal">
                              {tk.category}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-block ${tk.priority === 'URGENT' || tk.priority === 'HIGH'
                                    ? 'bg-rose-50 dark:bg-[rgba(244,63,94,0.14)] text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-[rgba(244,63,94,0.22)]'
                                    : tk.priority === 'MEDIUM'
                                      ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                                      : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                  }`}
                              >
                                {tk.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-flex items-center gap-1.5 ${tk.status === 'RESOLVED' || tk.status === 'CLOSED'
                                    ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                                    : tk.status === 'IN_PROGRESS'
                                      ? 'bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] text-amber-700 dark:text-[#FBBF24] border border-amber-200 dark:border-[rgba(245,158,11,0.22)]'
                                      : 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                                  }`}
                              >
                                <span
                                  className={`w-1.5 h-1.5 rounded-full ${tk.status === 'RESOLVED' || tk.status === 'CLOSED'
                                      ? 'bg-emerald-500'
                                      : tk.status === 'IN_PROGRESS'
                                        ? 'bg-amber-500'
                                        : 'bg-blue-500'
                                    }`}
                                />
                                {tk.status.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[#64748B] dark:text-[#94A3B8] font-normal whitespace-nowrap">
                              {tk.last_updated_human}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => {
                                  navigate(`/support/${tk.ticket_number || tk.id}`);
                                  loadTicketDetail(tk.ticket_number || tk.id);
                                }}
                                className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                              >
                                View Conversation
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* 6. MOBILE CARDS (< md) */}
              <div className="grid grid-cols-1 gap-3 md:hidden min-w-0 w-full">
                {isLoadingTickets ? (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center text-[#64748B]">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-[#2563EB]" />
                    <p className="mt-2 text-xs">Loading support tickets...</p>
                  </div>
                ) : tickets.length === 0 ? (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center text-[#64748B] dark:text-[#94A3B8] font-normal space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#94A3B8]" />
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                      No Support Tickets Found
                    </p>
                    <p className="text-xs">Adjust your search keywords or filter selection.</p>
                  </div>
                ) : (
                  tickets.map((tk) => (
                    <div
                      key={tk.id}
                      className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-4 space-y-3 min-w-0 w-full"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold font-mono text-[#0F172A] dark:text-[#F8FAFC]">
                          {tk.ticket_number}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${tk.status === 'RESOLVED' || tk.status === 'CLOSED'
                              ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200'
                              : tk.status === 'IN_PROGRESS'
                                ? 'bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] text-amber-700 dark:text-[#FBBF24] border border-amber-200'
                                : 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200'
                            }`}
                        >
                          {tk.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
                        {tk.subject}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          {tk.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-medium">
                          Priority: {tk.priority}
                        </span>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] border-t border-[#E2E8F0] dark:border-[#263244] pt-2.5">
                        <span className="truncate">Activity: {tk.last_updated_human}</span>
                        <button
                          type="button"
                          onClick={() => {
                            navigate(`/support/${tk.ticket_number || tk.id}`);
                            loadTicketDetail(tk.ticket_number || tk.id);
                          }}
                          className="w-full sm:w-auto h-11 px-4 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[44px]"
                        >
                          <span>View Ticket</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 text-xs font-medium min-w-0 w-full">
                  <span className="text-[#64748B] dark:text-[#94A3B8] text-center sm:text-left">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                    {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} tickets
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-11 h-11 rounded-xl font-medium text-xs transition-all cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center ${currentPage === pg
                            ? 'bg-[#2563EB] text-white shadow-2xs font-semibold'
                            : 'bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#CBD5E1] hover:bg-slate-50 dark:hover:bg-[#172033]'
                          }`}
                      >
                        {pg}
                      </button>
                    ))}
                    <button
                      type="button"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                      className="p-2.5 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'options' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0 w-full">
              {SUPPORT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.title}
                    className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-4 space-y-3 min-w-0 w-full"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
                          {opt.title}
                        </h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)] shrink-0">
                        {opt.cost}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      Availability: {opt.available}
                    </p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-[#263244]">
                      <span className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                        Channel Enabled
                      </span>
                      <input
                        type="checkbox"
                        defaultChecked={opt.enabled}
                        className="accent-[#2563EB] w-5 h-5 rounded cursor-pointer min-h-[44px] min-w-[44px]"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-3 max-w-3xl min-w-0 w-full">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden w-full"
                  >
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors min-h-[44px]"
                    >
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words pr-2">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB] dark:text-[#60A5FA]' : ''
                          }`}
                      />
                    </button>
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 pt-0 text-xs text-[#64748B] dark:text-[#CBD5E1] leading-relaxed border-t border-[#E2E8F0] dark:border-[#263244] break-words">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* 7. TICKET DETAIL SLIDE-OVER / CONVERSATION THREAD PANEL */}
      {(selectedTicket || isLoadingDetail || detailError) && (
        <Modal
          isOpen={true}
          onClose={closeDetailModal}
          title={
            selectedTicket
              ? `Ticket: ${selectedTicket.ticket_number}`
              : 'Loading Ticket'
          }
          subtitle=""
        >
          {isLoadingDetail ? (
            <div className="p-12 text-center text-[#64748B]">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#2563EB]" />
              <p className="mt-2 text-xs">Loading ticket details and conversation thread...</p>
            </div>
          ) : detailError ? (
            <div className="p-6 text-center space-y-4">
              <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words">{detailError}</p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button onClick={() => loadTicketDetail(routeTicketId || selectedTicket?.id || '')} className="min-h-[44px] w-full sm:w-auto">
                  Retry
                </Button>
                <Button variant="outline" onClick={closeDetailModal} className="min-h-[44px] w-full sm:w-auto">
                  Return to Tickets
                </Button>
              </div>
            </div>
          ) : selectedTicket ? (
            <div className="space-y-4 text-xs font-sans text-left max-h-[80vh] overflow-y-auto pr-1 scrollbar-hide pb-28 sm:pb-8 min-w-0 w-full">
              {/* BACK & SUBJECT HEADER */}
              <div className="flex flex-col gap-2 bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] min-w-0 w-full">
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={closeDetailModal}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer min-h-[44px]"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Tickets</span>
                  </button>
                  <span className="font-mono text-xs font-bold px-2.5 py-1 rounded bg-slate-200 dark:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC]">
                    {selectedTicket.ticket_number}
                  </span>
                </div>
                <h2 className="text-sm sm:text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words mt-1">
                  {selectedTicket.subject}
                </h2>
              </div>

              {/* TICKET METADATA */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-[#F8FAFC] dark:bg-[#0F172A] p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[11px] min-w-0 w-full">
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Status:</span>
                  <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {selectedTicket.status.replace('_', ' ')}
                    </span>
                    {selectedTicket.status === 'OPEN' || selectedTicket.status === 'IN_PROGRESS' ? (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleStatusChange('CLOSED')}
                        className="text-[10px] text-rose-600 underline font-medium cursor-pointer min-h-[36px] inline-flex items-center"
                      >
                        Close
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={isUpdatingStatus}
                        onClick={() => handleStatusChange('IN_PROGRESS')}
                        className="text-[10px] text-blue-600 underline font-medium cursor-pointer min-h-[36px] inline-flex items-center"
                      >
                        Reopen
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Priority:</span>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5">
                    {selectedTicket.priority}
                  </p>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Category:</span>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] mt-0.5 break-words">
                    {selectedTicket.category}
                  </p>
                </div>
                <div>
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Creator:</span>
                  <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words mt-0.5">
                    {selectedTicket.user_name || selectedTicket.user_email}
                  </p>
                </div>
              </div>

              {/* CONVERSATION MESSAGES */}
              <div className="space-y-3 pt-2 min-w-0 w-full">
                <span className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Conversation Thread
                </span>
                {selectedTicket.replies && selectedTicket.replies.length > 0 ? (
                  selectedTicket.replies.map((msg) => (
                    <div
                      key={msg.id}
                      className={`p-3.5 sm:p-4 rounded-2xl border space-y-2 min-w-0 w-full ${msg.role === 'customer'
                          ? 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#263244]'
                          : 'bg-blue-50/70 dark:bg-[rgba(37,99,235,0.10)] border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                        }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-words">
                            {msg.sender_name || msg.sender_email}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[9px] font-semibold ${msg.role === 'support'
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                              }`}
                          >
                            {msg.role === 'support' ? 'CubixSkill Support' : 'Customer'}
                          </span>
                        </div>
                        <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                          {new Date(msg.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm text-[#475569] dark:text-[#CBD5E1] leading-relaxed whitespace-pre-wrap break-words min-w-0 overflow-hidden">
                        {msg.message}
                      </p>
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {msg.attachments.map((att) => (
                            <a
                              key={att.id}
                              href={att.file_url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[11px] text-[#2563EB] dark:text-[#60A5FA] hover:underline break-all min-h-[44px]"
                            >
                              <Paperclip className="w-3.5 h-3.5 shrink-0" />
                              <span className="break-all">{att.file_name}</span>
                              <ExternalLink className="w-3 h-3 ml-0.5 opacity-70 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#64748B]">No messages recorded for this ticket.</p>
                )}
              </div>

              {/* REPLY COMPOSER & ATTACHMENT DROPZONE */}
              <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244] min-w-0 w-full">
                <span className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Post Reply
                </span>
                {replyError && (
                  <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs break-words">
                    {replyError}
                  </div>
                )}
                <textarea
                  rows={3}
                  placeholder="Type your response to the support team..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3.5 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] min-h-[90px]"
                />

                {/* ATTACHMENT DROPZONE */}
                <div className="relative border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3.5 bg-white dark:bg-[#0F172A] text-center cursor-pointer hover:border-[#3B82F6] min-h-[44px] flex items-center justify-center">
                  <input
                    type="file"
                    disabled={isUploadingReplyAttachment}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleReplyFileUpload(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  />
                  <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] dark:text-[#CBD5E1] break-words">
                    {isUploadingReplyAttachment ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#2563EB] shrink-0" />
                    ) : (
                      <UploadCloud className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
                    )}
                    <span className="break-words">
                      {isUploadingReplyAttachment
                        ? 'Uploading file...'
                        : 'Click to attach error screenshots or log files'}
                    </span>
                  </div>
                </div>

                {replyAttachmentError && (
                  <p className="text-xs text-rose-600 break-words">{replyAttachmentError}</p>
                )}

                {replyAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 text-xs text-[#2563EB]">
                    {replyAttachments.map((f) => (
                      <span key={f.id} className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 break-all">
                        Attached: {f.name}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2 w-full">
                  <Button
                    variant="outline"
                    onClick={closeDetailModal}
                    className="w-full sm:w-auto font-medium min-h-[44px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] text-sm"
                  >
                    Close
                  </Button>
                  <Button
                    disabled={isSubmittingReply || !replyText.trim()}
                    leftIcon={
                      isSubmittingReply ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )
                    }
                    onClick={handleSendReply}
                    className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[44px] rounded-xl cursor-pointer disabled:opacity-50 text-sm"
                  >
                    {isSubmittingReply ? 'Submitting...' : 'Send Reply'}
                  </Button>
                </div>
              </div>
            </div>
          ) : null}
        </Modal>
      )}

      {/* 8. SUBMIT NEW SUPPORT TICKET MODAL */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Open Support Ticket"
        subtitle="Submit a technical request to the CubixSkill support engineering team."
      >
        <div className="space-y-4 text-xs font-sans text-left min-w-0 w-full">
          {createTicketError && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs break-words">
              {createTicketError}
            </div>
          )}

          <div>
            <Input
              label="Subject Title"
              placeholder="e.g. Issue connecting custom domain CNAME record"
              value={newSubject}
              onChange={(e) => {
                setNewSubject(e.target.value);
                if (validationErrors.subject) setValidationErrors((v) => ({ ...v, subject: undefined }));
              }}
              className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] text-base sm:text-xs min-h-[44px]"
            />
            {validationErrors.subject && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.subject}</p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                Category
              </label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
              >
                <option value="Media & CDN">Media &amp; CDN</option>
                <option value="Billing & Tax">Billing &amp; Tax</option>
                <option value="Domain & SSL">Domain &amp; SSL</option>
                <option value="Student Access">Student Access</option>
                <option value="General">General</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] min-h-[44px]"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">
              Description
            </label>
            <textarea
              rows={4}
              placeholder="Describe the issue or error message you encountered in detail..."
              value={newDescription}
              onChange={(e) => {
                setNewDescription(e.target.value);
                if (validationErrors.description) setValidationErrors((v) => ({ ...v, description: undefined }));
              }}
              className="w-full p-3.5 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-base sm:text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
            {validationErrors.description && (
              <p className="text-[11px] text-rose-600 mt-1">{validationErrors.description}</p>
            )}
          </div>

          {/* ATTACHMENT DROPZONE */}
          <div className="relative border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3.5 bg-white dark:bg-[#0F172A] text-center cursor-pointer hover:border-[#3B82F6] min-h-[44px] flex items-center justify-center">
            <input
              type="file"
              disabled={isUploadingAttachment}
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileUpload(e.target.files[0]);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] dark:text-[#CBD5E1] break-words">
              {isUploadingAttachment ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] shrink-0" />
              ) : (
                <UploadCloud className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA] shrink-0" />
              )}
              <span className="break-words">
                {isUploadingAttachment
                  ? 'Uploading attachment...'
                  : 'Click or drag files here to attach screenshots or log files'}
              </span>
            </div>
          </div>

          {attachmentUploadError && (
            <p className="text-[11px] text-rose-600 break-words">{attachmentUploadError}</p>
          )}

          {attachedFiles.length > 0 && (
            <div className="flex flex-wrap gap-2 text-[11px] text-[#2563EB]">
              {attachedFiles.map((f) => (
                <span key={f.id} className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 break-all">
                  Attached: {f.name}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              variant="outline"
              onClick={() => setIsTicketModalOpen(false)}
              className="w-full sm:w-auto font-medium min-h-[44px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1] text-sm"
            >
              Cancel
            </Button>
            <Button
              disabled={isSubmittingTicket}
              leftIcon={
                isSubmittingTicket ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <MessageSquare className="w-4 h-4" />
                )
              }
              onClick={handleCreateTicket}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[44px] rounded-xl cursor-pointer disabled:opacity-50 text-sm"
            >
              {isSubmittingTicket ? 'Submitting Ticket...' : 'Submit Ticket'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SupportPage;
