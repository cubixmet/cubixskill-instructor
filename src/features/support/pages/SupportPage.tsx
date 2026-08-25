import React, { useState, useMemo } from 'react';
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
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  LifeBuoy,
  BookOpen,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SupportTicket } from '../../../types/models.types';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Input } from '../../../components/ui/Input';

interface ReplyMessage {
  id: string;
  author: string;
  role: 'customer' | 'support';
  message: string;
  timestamp: string;
  attachments?: string[];
}

interface ExtendedSupportTicket extends SupportTicket {
  replies: ReplyMessage[];
}

const INITIAL_TICKETS: ExtendedSupportTicket[] = [
  {
    id: 't-1',
    ticketNumber: 'SUP-9041',
    subject: 'Issue setting up Bunny Stream CDN video watermark',
    category: 'Media & CDN',
    priority: 'High',
    status: 'In Progress',
    createdAt: '2026-08-03',
    lastUpdated: '1 hour ago',
    description: 'The automated dynamic text watermark is not overlaying correctly on iOS Safari playback during live HLS stream rendering.',
    replies: [
      {
        id: 'r-1',
        author: 'Vikramaditya Roy (You)',
        role: 'customer',
        message: 'The automated text watermark is not overlaying correctly on iOS Safari playback during live HLS stream rendering. Android Chrome works as expected.',
        timestamp: 'Aug 03, 2026 • 10:15 AM',
      },
      {
        id: 'r-2',
        author: 'Priya Sharma (CubixSkill Support)',
        role: 'support',
        message: 'Hello Vikram, we are investigating the Bunny Stream player overlay CSS positioning on WebKit/Safari engine. We have updated your player config flags.',
        timestamp: 'Aug 03, 2026 • 11:30 AM',
      },
    ],
  },
  {
    id: 't-2',
    ticketNumber: 'SUP-8812',
    subject: 'GST Invoice breakdown for July credit wallet purchase',
    category: 'Billing & Tax',
    priority: 'Medium',
    status: 'Resolved',
    createdAt: '2026-07-28',
    lastUpdated: '2 days ago',
    description: 'Need B2B GST tax invoice copy with SGST/CGST breakdown for our accounting audit compliance team.',
    replies: [
      {
        id: 'r-1',
        author: 'Vikramaditya Roy (You)',
        role: 'customer',
        message: 'Please share the tax invoice PDF for invoice #INV-2026-078 with GSTIN 27AABCU9603R1ZM.',
        timestamp: 'Jul 28, 2026 • 02:40 PM',
      },
      {
        id: 'r-2',
        author: 'Finance Operations Desk',
        role: 'support',
        message: 'Tax invoice PDF attached and sent to your registered email. Ticket resolved.',
        timestamp: 'Jul 28, 2026 • 04:10 PM',
        attachments: ['Invoice_INV-2026-078_GST.pdf'],
      },
    ],
  },
  {
    id: 't-3',
    ticketNumber: 'SUP-9104',
    subject: 'Custom CNAME SSL certificate renewal status',
    category: 'Domain & SSL',
    priority: 'Urgent',
    status: 'Open',
    createdAt: '2026-08-22',
    lastUpdated: '30 mins ago',
    description: 'Our custom academy domain learn.cubixskill.com certificate auto-renewal is pending DNS verification.',
    replies: [
      {
        id: 'r-1',
        author: 'Vikramaditya Roy (You)',
        role: 'customer',
        message: 'The Let\'s Encrypt SSL renewal ACME challenge TXT record has been added to Cloudflare DNS. Please trigger re-verification.',
        timestamp: 'Aug 22, 2026 • 11:00 AM',
      },
    ],
  },
];

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
  const [tickets, setTickets] = useState<ExtendedSupportTicket[]>(INITIAL_TICKETS);
  const [activeTab, setActiveTab] = useState<'tickets' | 'options' | 'knowledge'>('tickets');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  // Modals & Detail Panel
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<ExtendedSupportTicket | null>(null);

  // Form States (New Ticket)
  const [newSubject, setNewSubject] = useState('');
  const [newCategory, setNewCategory] = useState('Media & CDN');
  const [newPriority, setNewPriority] = useState<'Low' | 'Medium' | 'High' | 'Urgent'>('Medium');
  const [newDescription, setNewDescription] = useState('');
  const [newAttachmentName, setNewAttachmentName] = useState<string | null>(null);

  // Reply State (Detail Panel)
  const [replyText, setReplyText] = useState('');
  const [replyAttachmentName, setReplyAttachmentName] = useState<string | null>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Filter computation
  const filteredTickets = useMemo(() => {
    const q = search.toLowerCase().trim();
    return tickets.filter((tk) => {
      const matchQ =
        !q ||
        tk.ticketNumber.toLowerCase().includes(q) ||
        tk.subject.toLowerCase().includes(q) ||
        tk.category.toLowerCase().includes(q) ||
        tk.description.toLowerCase().includes(q);
      const matchStatus = filterStatus === 'all' || tk.status === filterStatus;
      const matchPriority = filterPriority === 'all' || tk.priority === filterPriority;
      const matchCategory = filterCategory === 'all' || tk.category === filterCategory;
      return matchQ && matchStatus && matchPriority && matchCategory;
    });
  }, [tickets, search, filterStatus, filterPriority, filterCategory]);

  // Metrics computation
  const metrics = useMemo(() => {
    const total = tickets.length;
    const open = tickets.filter((t) => t.status === 'Open').length;
    const inProgress = tickets.filter((t) => t.status === 'In Progress').length;
    const resolved = tickets.filter((t) => t.status === 'Resolved').length;
    const urgent = tickets.filter((t) => t.priority === 'Urgent' || t.priority === 'High').length;
    return { total, open, inProgress, resolved, urgent };
  }, [tickets]);

  // Pagination slice
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage) || 1;
  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredTickets.slice(start, start + itemsPerPage);
  }, [filteredTickets, currentPage]);

  // Submit New Ticket
  const handleCreateTicket = () => {
    if (!newSubject.trim() || !newDescription.trim()) return;

    const ticket: ExtendedSupportTicket = {
      id: `t-${Date.now()}`,
      ticketNumber: `SUP-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newSubject.trim(),
      category: newCategory,
      priority: newPriority,
      status: 'Open',
      createdAt: new Date().toISOString().split('T')[0],
      lastUpdated: 'Just now',
      description: newDescription.trim(),
      replies: [
        {
          id: `r-init-${Date.now()}`,
          author: 'Vikramaditya Roy (You)',
          role: 'customer',
          message: newDescription.trim(),
          timestamp: 'Just now',
          attachments: newAttachmentName ? [newAttachmentName] : undefined,
        },
      ],
    };

    setTickets((prev) => [ticket, ...prev]);
    setIsTicketModalOpen(false);
    resetTicketForm();
  };

  // Submit Reply
  const handleSendReply = () => {
    if (!selectedTicket || !replyText.trim()) return;

    const newReply: ReplyMessage = {
      id: `r-${Date.now()}`,
      author: 'Vikramaditya Roy (You)',
      role: 'customer',
      message: replyText.trim(),
      timestamp: 'Just now',
      attachments: replyAttachmentName ? [replyAttachmentName] : undefined,
    };

    const updated = {
      ...selectedTicket,
      lastUpdated: 'Just now',
      replies: [...selectedTicket.replies, newReply],
    };

    setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
    setSelectedTicket(updated);
    setReplyText('');
    setReplyAttachmentName(null);
  };

  const resetTicketForm = () => {
    setNewSubject('');
    setNewCategory('Media & CDN');
    setNewPriority('Medium');
    setNewDescription('');
    setNewAttachmentName(null);
  };

  return (
    <div className="w-full min-w-0 max-w-full overflow-x-clip space-y-4 pb-24 md:pb-8 text-left font-sans text-xs text-[#0F172A] dark:text-[#F8FAFC] bg-[#F8FAFC] dark:bg-[#0B1120] min-h-screen font-normal">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-0.5 min-w-0">
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
          onClick={() => { resetTicketForm(); setIsTicketModalOpen(true); }}
          className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium h-[38px] min-h-[38px] px-4 rounded-xl shadow-xs w-full sm:w-auto shrink-0 cursor-pointer"
        >
          Open New Ticket
        </Button>
      </div>

      {/* 2. SUMMARY METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 min-w-0">
        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Total Tickets</span>
            <FileText className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.total}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Open Tickets</span>
            <AlertCircle className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.open}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">In Progress</span>
            <Clock className="w-4 h-4 text-amber-500 dark:text-amber-400" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.inProgress}</p>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-2xl p-3.5 sm:p-4 shadow-2xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8]">Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
          </div>
          <p className="text-lg sm:text-xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{metrics.resolved}</p>
        </div>
      </div>

      {/* 3. NAVIGATION TABS */}
      <div className="flex border-b border-[#E2E8F0] dark:border-[#263244] gap-6 overflow-x-auto scrollbar-hide pt-1">
        {[
          { id: 'tickets', label: 'My Support Tickets' },
          { id: 'options', label: 'Support Channels & Credit Costs' },
          { id: 'knowledge', label: 'Instructor Knowledge Base' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'tickets' | 'options' | 'knowledge')}
            className={`pb-3 text-xs font-semibold border-b-2 transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === tab.id
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
          className="space-y-4 min-w-0"
        >
          {activeTab === 'tickets' && (
            <>
              {/* 4. SEARCH & FILTERS BAR */}
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-3 sm:p-4 space-y-3 min-w-0">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <div className="relative flex-1 min-w-0">
                    <Search className="w-4 h-4 text-[#64748B] dark:text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search ticket ref, subject, category…"
                      value={search}
                      onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                      className="w-full h-10 pl-9 pr-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6] focus:ring-2 focus:ring-[#3B82F6]/10"
                    />
                  </div>

                  <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide shrink-0 py-0.5">
                    <select
                      value={filterStatus}
                      onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }}
                      className="h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] shrink-0"
                    >
                      <option value="all">All Status</option>
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>

                    <select
                      value={filterPriority}
                      onChange={(e) => { setFilterPriority(e.target.value); setCurrentPage(1); }}
                      className="h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] shrink-0"
                    >
                      <option value="all">All Priorities</option>
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Urgent">Urgent</option>
                    </select>

                    <select
                      value={filterCategory}
                      onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                      className="h-10 px-3 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6] shrink-0"
                    >
                      <option value="all">All Categories</option>
                      <option value="Media & CDN">Media &amp; CDN</option>
                      <option value="Billing & Tax">Billing &amp; Tax</option>
                      <option value="Domain & SSL">Domain &amp; SSL</option>
                      <option value="Student Access">Student Access</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 5. DESKTOP TABLE (≥ md) */}
              <div className="hidden md:block bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs min-w-[750px]">
                    <thead className="bg-[#F8FAFC] dark:bg-[#172033] border-b border-[#E2E8F0] dark:border-[#263244] text-[11px] font-medium text-[#475569] dark:text-[#94A3B8] uppercase tracking-wider">
                      <tr>
                        <th className="px-4 py-3.5">Ticket Ref</th>
                        <th className="px-4 py-3.5">Subject</th>
                        <th className="px-4 py-3.5">Category</th>
                        <th className="px-4 py-3.5">Priority</th>
                        <th className="px-4 py-3.5">Status</th>
                        <th className="px-4 py-3.5">Last Updated</th>
                        <th className="px-4 py-3.5 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E2E8F0] dark:divide-[#263244]">
                      {paginatedTickets.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-[#64748B] dark:text-[#94A3B8] font-normal">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <HelpCircle className="w-8 h-8 text-[#64748B] dark:text-[#94A3B8]" />
                              <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">No Support Tickets Found</p>
                              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Try adjusting search keywords or filter dropdowns.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        paginatedTickets.map((tk) => (
                          <tr key={tk.id} className="hover:bg-[#F8FAFC] dark:hover:bg-[#172033] transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-[#0F172A] dark:text-[#F8FAFC] select-all">{tk.ticketNumber}</td>
                            <td className="px-4 py-3.5">
                              <p className="font-medium text-[#0F172A] dark:text-[#F8FAFC] max-w-[280px] truncate">{tk.subject}</p>
                            </td>
                            <td className="px-4 py-3.5 text-[#64748B] dark:text-[#94A3B8] font-normal">{tk.category}</td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-block ${
                                tk.priority === 'Urgent' || tk.priority === 'High'
                                  ? 'bg-rose-50 dark:bg-[rgba(244,63,94,0.14)] text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-[rgba(244,63,94,0.22)]'
                                  : tk.priority === 'Medium'
                                  ? 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                                  : 'bg-slate-100 dark:bg-[#1E293B] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                              }`}>
                                {tk.priority}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-medium inline-flex items-center gap-1.5 ${
                                tk.status === 'Resolved'
                                  ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200 dark:border-[rgba(52,211,153,0.22)]'
                                  : tk.status === 'In Progress'
                                  ? 'bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] text-amber-700 dark:text-[#FBBF24] border border-amber-200 dark:border-[rgba(245,158,11,0.22)]'
                                  : 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  tk.status === 'Resolved' ? 'bg-emerald-500' : tk.status === 'In Progress' ? 'bg-amber-500' : 'bg-blue-500'
                                }`} />
                                {tk.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-[#64748B] dark:text-[#94A3B8] font-normal whitespace-nowrap">{tk.lastUpdated}</td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                type="button"
                                onClick={() => setSelectedTicket(tk)}
                                className="text-xs font-semibold text-[#2563EB] dark:text-[#60A5FA] hover:underline cursor-pointer"
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
              <div className="grid grid-cols-1 gap-3 md:hidden min-w-0">
                {paginatedTickets.length === 0 ? (
                  <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] p-8 text-center text-[#64748B] dark:text-[#94A3B8] font-normal space-y-2">
                    <HelpCircle className="w-8 h-8 mx-auto text-[#64748B] dark:text-[#94A3B8]" />
                    <p className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">No Support Tickets Found</p>
                    <p className="text-xs">Adjust your search keywords or filter selection.</p>
                  </div>
                ) : (
                  paginatedTickets.map((tk) => (
                    <div
                      key={tk.id}
                      className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-3.5 sm:p-4 space-y-3 min-w-0"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">{tk.ticketNumber}</span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          tk.status === 'Resolved'
                            ? 'bg-emerald-50 dark:bg-[rgba(16,185,129,0.14)] text-emerald-700 dark:text-[#34D399] border border-emerald-200'
                            : tk.status === 'In Progress'
                            ? 'bg-amber-50 dark:bg-[rgba(245,158,11,0.14)] text-amber-700 dark:text-[#FBBF24] border border-amber-200'
                            : 'bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200'
                        }`}>
                          {tk.status}
                        </span>
                      </div>
                      <p className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-snug">{tk.subject}</p>
                      <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] border-t border-[#E2E8F0] dark:border-[#263244] pt-2">
                        <span>{tk.category} • {tk.priority}</span>
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(tk)}
                          className="font-semibold text-[#2563EB] dark:text-[#60A5FA]"
                        >
                          View Ticket
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* PAGINATION */}
              {totalPages > 1 && (
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 text-xs font-medium min-w-0">
                  <span className="text-[#64748B] dark:text-[#94A3B8] text-center sm:text-left">
                    Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredTickets.length)} of {filteredTickets.length} tickets
                  </span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pg) => (
                      <button
                        key={pg}
                        type="button"
                        onClick={() => setCurrentPage(pg)}
                        className={`w-9 h-9 rounded-xl font-medium text-xs transition-all cursor-pointer ${
                          currentPage === pg
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
                      className="p-2 rounded-xl border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#CBD5E1] disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-[#172033] cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'options' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
              {SUPPORT_OPTIONS.map((opt) => {
                const IconComponent = opt.icon;
                return (
                  <div
                    key={opt.title}
                    className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs p-4 space-y-3 min-w-0"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-[#2563EB] dark:text-[#60A5FA] shrink-0">
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <h3 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug truncate">{opt.title}</h3>
                      </div>
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-[rgba(37,99,235,0.14)] text-blue-700 dark:text-[#60A5FA] border border-blue-200 dark:border-[rgba(59,130,246,0.22)] shrink-0">
                        {opt.cost}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Availability: {opt.available}</p>
                    <div className="flex items-center justify-between pt-2.5 border-t border-[#E2E8F0] dark:border-[#263244]">
                      <span className="text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Channel Enabled</span>
                      <input
                        type="checkbox"
                        defaultChecked={opt.enabled}
                        className="accent-[#2563EB] w-4 h-4 rounded cursor-pointer"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'knowledge' && (
            <div className="space-y-3 max-w-3xl min-w-0">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div key={idx} className="bg-white dark:bg-[#111827] rounded-2xl border border-[#E2E8F0] dark:border-[#263244] shadow-2xs overflow-hidden">
                    <button
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-4 flex items-center justify-between text-left focus:outline-none cursor-pointer hover:bg-slate-50 dark:hover:bg-[#172033] transition-colors"
                    >
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{faq.question}</span>
                      <ChevronDown className={`w-4 h-4 text-[#64748B] dark:text-[#94A3B8] transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#2563EB] dark:text-[#60A5FA]' : ''}`} />
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
                          <div className="p-4 pt-0 text-xs text-[#64748B] dark:text-[#CBD5E1] leading-relaxed border-t border-[#E2E8F0] dark:border-[#263244]">
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
      {selectedTicket && (
        <Modal
          isOpen={!!selectedTicket}
          onClose={() => setSelectedTicket(null)}
          title={`Ticket Details: ${selectedTicket.ticketNumber}`}
          subtitle={selectedTicket.subject}
        >
          <div className="space-y-4 text-xs font-sans text-left max-h-[75vh] overflow-y-auto pr-1 scrollbar-hide">
            {/* TICKET METADATA */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-[#F8FAFC] dark:bg-[#0F172A] p-3 rounded-xl border border-[#E2E8F0] dark:border-[#334155] text-[11px]">
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">Status:</span>
                <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{selectedTicket.status}</p>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">Priority:</span>
                <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{selectedTicket.priority}</p>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">Category:</span>
                <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{selectedTicket.category}</p>
              </div>
              <div>
                <span className="text-[#64748B] dark:text-[#94A3B8]">Created:</span>
                <p className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{selectedTicket.createdAt}</p>
              </div>
            </div>

            {/* CONVERSATION MESSAGES */}
            <div className="space-y-3 pt-2">
              <span className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Conversation Thread</span>
              {selectedTicket.replies.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3.5 rounded-2xl border space-y-1.5 ${
                    msg.role === 'customer'
                      ? 'bg-white dark:bg-[#0F172A] border-[#E2E8F0] dark:border-[#263244]'
                      : 'bg-blue-50/70 dark:bg-[rgba(37,99,235,0.10)] border-blue-200 dark:border-[rgba(59,130,246,0.22)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{msg.author}</span>
                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">{msg.timestamp}</span>
                  </div>
                  <p className="text-xs text-[#475569] dark:text-[#CBD5E1] leading-relaxed">{msg.message}</p>
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] text-[#2563EB] dark:text-[#60A5FA]">
                      <Paperclip className="w-3.5 h-3.5" />
                      <span>{msg.attachments.join(', ')}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* REPLY COMPOSER & ATTACHMENT DROPZONE */}
            <div className="space-y-3 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
              <span className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Post Reply</span>
              <textarea
                rows={3}
                placeholder="Type your response to the support team..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
              />

              {/* ATTACHMENT DROPZONE */}
              <div className="relative border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3 bg-white dark:bg-[#0F172A] text-center cursor-pointer hover:border-[#3B82F6]">
                <input
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setReplyAttachmentName(e.target.files[0].name);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <div className="flex items-center justify-center gap-2 text-[11px] text-[#64748B] dark:text-[#CBD5E1]">
                  <UploadCloud className="w-4 h-4 text-[#2563EB] dark:text-[#60A5FA]" />
                  <span>{replyAttachmentName ? `Attached: ${replyAttachmentName}` : 'Click to attach error screenshots or log files (PNG, JPG, PDF)'}</span>
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedTicket(null)}
                  className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
                >
                  Close
                </Button>
                <Button
                  leftIcon={<Send className="w-4 h-4" />}
                  onClick={handleSendReply}
                  className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
                >
                  Send Reply
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 8. SUBMIT NEW SUPPORT TICKET MODAL */}
      <Modal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        title="Open Support Ticket"
        subtitle="Submit a technical request to the CubixSkill support engineering team."
      >
        <div className="space-y-4 text-xs font-sans text-left">
          <Input
            label="Subject Title"
            placeholder="e.g. Issue connecting custom domain CNAME record"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            className="bg-white dark:bg-[#0F172A] border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC]"
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="Media & CDN">Media &amp; CDN</option>
                <option value="Billing & Tax">Billing &amp; Tax</option>
                <option value="Domain & SSL">Domain &amp; SSL</option>
                <option value="Student Access">Student Access</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Priority</label>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as any)}
                className="w-full h-11 px-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] font-medium focus:outline-none focus:border-[#3B82F6]"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0F172A] dark:text-[#CBD5E1]">Description</label>
            <textarea
              rows={4}
              placeholder="Describe the issue or error message you encountered in detail..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              className="w-full p-3 bg-white dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#64748B] focus:outline-none focus:border-[#3B82F6]"
            />
          </div>

          {/* ATTACHMENT DROPZONE */}
          <div className="relative border border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl p-3.5 bg-white dark:bg-[#0F172A] text-center cursor-pointer hover:border-[#3B82F6]">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setNewAttachmentName(e.target.files[0].name);
                }
              }}
              className="absolute inset-0 opacity-0 cursor-pointer"
            />
            <div className="flex items-center justify-center gap-2 text-xs text-[#64748B] dark:text-[#CBD5E1]">
              <UploadCloud className="w-5 h-5 text-[#2563EB] dark:text-[#60A5FA]" />
              <span>{newAttachmentName ? `Attached: ${newAttachmentName}` : 'Click or drag files here to attach screenshots or log files'}</span>
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button
              variant="outline"
              onClick={() => setIsTicketModalOpen(false)}
              className="w-full sm:w-auto font-medium min-h-[42px] rounded-xl border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#172033] text-[#0F172A] dark:text-[#CBD5E1]"
            >
              Cancel
            </Button>
            <Button
              leftIcon={<MessageSquare className="w-4 h-4" />}
              onClick={handleCreateTicket}
              className="w-full sm:w-auto bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-medium min-h-[42px] rounded-xl cursor-pointer"
            >
              Submit Ticket
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
