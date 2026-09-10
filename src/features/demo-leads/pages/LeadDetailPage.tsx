import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  User,
  Tag,
  Clock,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Edit,
  UserCheck,
  Plus,
  MessageSquare,
  Activity,
  FileText,
  X,
  Share2,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { leadsService, type LeadData, type LeadTimelineEvent } from '../../../services/leads.service';
import { staffService, type BackendStaffUser } from '../../../services/staff.service';
import { authStore } from '../../../store/auth.store';

export const LeadDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  const userRole = (authStore.getState().user?.role || 'instructor') as string;
  const canManageLeads = userRole === 'admin' || userRole === 'instructor' || userRole === 'ta';

  const [lead, setLead] = useState<LeadData | null>(null);
  const [timelineEvents, setTimelineEvents] = useState<LeadTimelineEvent[]>([]);
  const [staffMembers, setStaffMembers] = useState<BackendStaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Active Tab: 'overview' | 'notes' | 'followups' | 'timeline'
  const [activeTab, setActiveTab] = useState<'overview' | 'notes' | 'followups' | 'timeline'>('overview');

  // Modals
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);
  const [noteModalOpen, setNoteModalOpen] = useState(false);

  // Form inputs
  const [newStatus, setNewStatus] = useState<string>('CONTACTED');
  const [lostReason, setLostReason] = useState<string>('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const [assignedToId, setAssignedToId] = useState<string>('');
  const [assignReason, setAssignReason] = useState<string>('');
  const [isSubmittingAssign, setIsSubmittingAssign] = useState(false);

  const [followUpForm, setFollowUpForm] = useState({ scheduled_at: '', follow_up_type: 'CALL', notes: '' });
  const [isSubmittingFollowUp, setIsSubmittingFollowUp] = useState(false);

  const [noteContent, setNoteContent] = useState('');
  const [isSubmittingNote, setIsSubmittingNote] = useState(false);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchLeadData = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const [leadRes, timelineRes, staffRes] = await Promise.all([
        leadsService.getLead(leadId),
        leadsService.getTimeline(leadId).catch(() => []),
        staffService.getStaffMembers().catch(() => []),
      ]);

      setLead(leadRes);
      setTimelineEvents(timelineRes);
      setStaffMembers(staffRes || []);
      setNewStatus(leadRes.status);
      setAssignedToId(leadRes.assigned_to_id || '');
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Unable to load lead details.');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadData();
  }, [fetchLeadData]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    setIsSubmittingStatus(true);
    try {
      const updated = await leadsService.updateStatus(leadId, newStatus, lostReason);
      setLead(updated);
      showToast(`Lead status updated to ${newStatus}.`);
      setStatusModalOpen(false);
      fetchLeadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update status.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleAssignStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !assignedToId) return;
    setIsSubmittingAssign(true);
    try {
      const updated = await leadsService.assignLead(leadId, assignedToId, assignReason);
      setLead(updated);
      showToast('Lead assigned successfully.');
      setAssignModalOpen(false);
      fetchLeadData();
    } catch (err: any) {
      showToast(err.message || 'Assignment failed.');
    } finally {
      setIsSubmittingAssign(false);
    }
  };

  const handleScheduleFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !followUpForm.scheduled_at) return;
    setIsSubmittingFollowUp(true);
    try {
      await leadsService.scheduleFollowUp(leadId, followUpForm);
      showToast('Follow-up activity scheduled.');
      setFollowUpModalOpen(false);
      setFollowUpForm({ scheduled_at: '', follow_up_type: 'CALL', notes: '' });
      fetchLeadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to schedule follow-up.');
    } finally {
      setIsSubmittingFollowUp(false);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId || !noteContent.trim()) return;
    setIsSubmittingNote(true);
    try {
      await leadsService.addNote(leadId, noteContent.trim());
      showToast('Note added successfully.');
      setNoteModalOpen(false);
      setNoteContent('');
      fetchLeadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to add note.');
    } finally {
      setIsSubmittingNote(false);
    }
  };

  const handleConvertLead = async () => {
    if (!lead) return;
    try {
      const result = await leadsService.convertLead(lead.id);
      showToast(`${lead.full_name} converted to Student.`);
      fetchLeadData();
      if (result.student_id) {
        navigate(`/students/${result.student_id}`);
      }
    } catch (err: any) {
      showToast(err.message || 'Conversion failed.');
    }
  };

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

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full font-sans">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 mt-2">Loading demo lead profile...</span>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-rose-50 dark:bg-[#3f1d24]/50 border border-rose-200 dark:border-rose-900/60 rounded-[16px] text-center space-y-4 font-sans">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Lead Not Found</h2>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage || 'The requested demo lead does not exist.'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/demo-leads')}>
          Back to Demo Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left font-sans pb-32 sm:pb-12 max-w-6xl mx-auto px-1 sm:px-2">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-[#0F172A] text-white text-xs font-semibold rounded-2xl shadow-xl flex items-center gap-2">
          <span>{toastMsg}</span>
          <button type="button" onClick={() => setToastMsg(null)} className="p-0.5 hover:bg-slate-700 rounded cursor-pointer">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Back Button */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/demo-leads')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Demo Leads</span>
        </button>

        {canManageLeads && (
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Edit className="w-3.5 h-3.5" />}
              onClick={() => navigate(`/demo-leads/${lead.id}/edit`)}
              className="min-h-[44px] text-xs font-semibold border-[#CBD5E1] dark:border-[#334155]"
            >
              Edit Lead
            </Button>

            {lead.status !== 'CONVERTED' && (
              <Button
                variant="primary"
                size="sm"
                leftIcon={<UserCheck className="w-3.5 h-3.5" />}
                onClick={handleConvertLead}
                className="min-h-[44px] text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Convert to Student
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Lead Header Card */}
      <Card padding="none" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-2xs p-4 sm:p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#E2E8F0] dark:border-[#263244] pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {lead.full_name}
              </h1>
              <Badge variant={getStatusBadgeVariant(lead.status)}>
                {lead.status}
              </Badge>
              <span className={`text-xs font-bold ${lead.priority === 'URGENT' ? 'text-rose-600' : lead.priority === 'HIGH' ? 'text-amber-600' : 'text-slate-500'}`}>
                {lead.priority || 'NORMAL'} Priority
              </span>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] font-medium">
              Source: <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{lead.source || 'WEBSITE'}</span>
              {lead.source_detail && ` (${lead.source_detail})`}
            </p>
          </div>

          {canManageLeads && (
            <div className="flex items-center gap-2 flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setStatusModalOpen(true)}
                className="min-h-[44px] text-xs font-semibold text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              >
                Update Status
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAssignModalOpen(true)}
                className="min-h-[44px] text-xs font-semibold text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700"
              >
                Assign Staff
              </Button>
            </div>
          )}
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-1">
          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Email</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] break-all">
              <Mail className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              {lead.email ? (
                <a href={`mailto:${lead.email}`} className="hover:underline text-blue-600 dark:text-blue-400">
                  {lead.email}
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Phone</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <Phone className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              {lead.phone ? (
                <a href={`tel:${lead.phone}`} className="hover:underline">
                  {lead.phone}
                </a>
              ) : (
                '—'
              )}
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Assigned Staff</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
              <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>{lead.assigned_to_name || 'Unassigned'}</span>
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase">Next Follow-Up</span>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              <Calendar className="w-3.5 h-3.5 text-purple-600 shrink-0" />
              <span>{lead.next_follow_up_at ? new Date(lead.next_follow_up_at).toLocaleDateString() : 'None scheduled'}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Responsive Tabs Navigation */}
      <div
        role="tablist"
        aria-label="Lead Details Sections"
        className="grid grid-cols-2 gap-2 md:flex md:items-center md:gap-2.5 border-b border-[#E2E8F0] dark:border-[#263244] pb-3"
      >
        <button
          type="button"
          role="tab"
          id="tab-overview"
          aria-selected={activeTab === 'overview'}
          aria-controls="panel-overview"
          onClick={() => setActiveTab('overview')}
          className={`min-w-0 w-full md:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 text-center transition-all cursor-pointer border select-none ${
            activeTab === 'overview'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white font-medium'
          }`}
        >
          <span className="leading-snug">Overview & Notes</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-notes"
          aria-selected={activeTab === 'notes'}
          aria-controls="panel-notes"
          onClick={() => setActiveTab('notes')}
          className={`min-w-0 w-full md:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 text-center transition-all cursor-pointer border select-none ${
            activeTab === 'notes'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white font-medium'
          }`}
        >
          <span className="leading-snug">Staff Notes</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              activeTab === 'notes'
                ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-[#1E293B] dark:text-slate-300'
            }`}
          >
            {lead.notes?.length || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-followups"
          aria-selected={activeTab === 'followups'}
          aria-controls="panel-followups"
          onClick={() => setActiveTab('followups')}
          className={`min-w-0 w-full md:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 text-center transition-all cursor-pointer border select-none ${
            activeTab === 'followups'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white font-medium'
          }`}
        >
          <span className="leading-snug">Follow-Up Schedule</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              activeTab === 'followups'
                ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-[#1E293B] dark:text-slate-300'
            }`}
          >
            {lead.follow_ups?.length || 0}
          </span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-timeline"
          aria-selected={activeTab === 'timeline'}
          aria-controls="panel-timeline"
          onClick={() => setActiveTab('timeline')}
          className={`min-w-0 w-full md:w-auto min-h-[44px] px-3.5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 text-center transition-all cursor-pointer border select-none ${
            activeTab === 'timeline'
              ? 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-600/15 dark:text-blue-400 dark:border-blue-500/30 font-bold shadow-xs'
              : 'bg-slate-50 text-slate-600 border-slate-200/80 hover:bg-slate-100 hover:text-slate-900 dark:bg-[#111827] dark:text-slate-400 dark:border-[#263244] dark:hover:bg-white/5 dark:hover:text-white font-medium'
          }`}
        >
          <span className="leading-snug">Activity Timeline</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
              activeTab === 'timeline'
                ? 'bg-blue-600 text-white dark:bg-blue-500 dark:text-white'
                : 'bg-slate-200 text-slate-700 dark:bg-[#1E293B] dark:text-slate-300'
            }`}
          >
            {timelineEvents.length}
          </span>
        </button>
      </div>

      {/* Tab Content 1: Overview */}
      {activeTab === 'overview' && (
        <div id="panel-overview" role="tabpanel" aria-labelledby="tab-overview" className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Enquiry & Summary Notes
            </h3>
            <p className="text-xs text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed whitespace-pre-line">
              {lead.notes_summary || 'No summary notes added for this lead yet.'}
            </p>
            {lead.lost_reason && (
              <div className="p-3 bg-rose-50 dark:bg-[#3f1d24]/40 border border-rose-200 dark:border-rose-900/60 rounded-xl text-xs">
                <span className="font-bold text-rose-700 dark:text-rose-300">Lost Reason: </span>
                <span className="text-rose-600 dark:text-rose-200">{lead.lost_reason}</span>
              </div>
            )}
          </Card>

          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Course Interests
            </h3>
            {lead.course_interests && lead.course_interests.length > 0 ? (
              <div className="space-y-2">
                {lead.course_interests.map((ci) => (
                  <div key={ci.id} className="p-3 bg-slate-50 dark:bg-[#172033] rounded-xl border border-slate-200/80 dark:border-[#263244] flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">{ci.course_title}</span>
                    <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase">{ci.interest_level} Interest</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">No course interests attached to this lead.</p>
            )}
          </Card>
        </div>
      )}

      {/* Tab Content 2: Staff Notes */}
      {activeTab === 'notes' && (
        <div id="panel-notes" role="tabpanel" aria-labelledby="tab-notes">
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Internal Staff Notes
              </h3>
              {canManageLeads && (
                <Button size="sm" onClick={() => setNoteModalOpen(true)} className="min-h-[44px] text-xs font-bold bg-[#2563EB] text-white">
                  <Plus className="w-4 h-4 mr-1" /> Add Note
                </Button>
              )}
            </div>

            {lead.notes && lead.notes.length > 0 ? (
              <div className="space-y-3">
                {lead.notes.map((n) => (
                  <div key={n.id} className="p-3.5 bg-slate-50 dark:bg-[#172033] rounded-xl border border-slate-200/80 dark:border-[#263244] space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">{n.author_name || 'Staff Member'}</span>
                      <span>{new Date(n.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-[#0F172A] dark:text-[#F8FAFC] whitespace-pre-line leading-relaxed pt-1">
                      {n.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                No staff notes added for this lead yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab Content 3: Follow-Up Schedule */}
      {activeTab === 'followups' && (
        <div id="panel-followups" role="tabpanel" aria-labelledby="tab-followups">
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Follow-Up Schedule
              </h3>
              {canManageLeads && (
                <Button size="sm" onClick={() => setFollowUpModalOpen(true)} className="min-h-[44px] text-xs font-bold bg-[#2563EB] text-white">
                  <Plus className="w-4 h-4 mr-1" /> Schedule Follow-Up
                </Button>
              )}
            </div>

            {lead.follow_ups && lead.follow_ups.length > 0 ? (
              <div className="space-y-3">
                {lead.follow_ups.map((fu) => (
                  <div key={fu.id} className="p-3.5 bg-slate-50 dark:bg-[#172033] rounded-xl border border-slate-200/80 dark:border-[#263244] flex items-center justify-between text-xs gap-3">
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-2">
                        <span className="uppercase text-blue-600 dark:text-blue-400 text-[11px] font-bold">{fu.follow_up_type}</span>
                        <span>— {new Date(fu.scheduled_at).toLocaleString()}</span>
                      </div>
                      {fu.notes && <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">{fu.notes}</p>}
                    </div>
                    <Badge variant={fu.status === 'COMPLETED' ? 'success' : 'warning'}>
                      {fu.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                No follow-ups scheduled yet.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* Tab Content 4: Activity Timeline */}
      {activeTab === 'timeline' && (
        <div id="panel-timeline" role="tabpanel" aria-labelledby="tab-timeline">
          <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-3.5 sm:p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Lead Activity & Audit History
            </h3>

            {timelineEvents.length > 0 ? (
              <div className="relative space-y-5 pt-1">
                {/* Timeline vertical connector line */}
                <div className="absolute left-[7px] top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-[#263244]" aria-hidden="true" />

                {timelineEvents.map((evt, idx) => {
                  const formatEventTitle = (code: string) => {
                    if (!code) return 'Activity Event';
                    const EVENT_MAP: Record<string, string> = {
                      ENQUIRY_RECEIVED_DUPLICATE_LEAD: 'Duplicate enquiry received',
                      ENQUIRY_RECEIVED: 'Enquiry received',
                      LEAD_CREATED: 'Lead created',
                      LEAD_ASSIGNED: 'Lead assigned',
                      FOLLOW_UP_SCHEDULED: 'Follow-up scheduled',
                      FOLLOW_UP_COMPLETED: 'Follow-up completed',
                      STATUS_CHANGED: 'Status changed',
                      REOPENED: 'Lead reopened',
                      LEAD_CONVERTED: 'Lead converted',
                      NOTE_ADDED: 'Note added',
                    };

                    if (EVENT_MAP[code]) return EVENT_MAP[code];

                    // Readable fallback for unknown event codes
                    return code
                      .toLowerCase()
                      .replace(/_/g, ' ')
                      .replace(/\b\w/g, (char) => char.toUpperCase());
                  };

                  const title = formatEventTitle(evt.event);
                  const formattedTime = evt.timestamp ? new Date(evt.timestamp).toLocaleString() : '';

                  return (
                    <div key={idx} className="relative flex items-start gap-3 min-w-0">
                      {/* Timeline dot marker aligned with first line of title */}
                      <div className="relative z-10 mt-1.5 w-3 h-3 rounded-full bg-blue-600 dark:bg-blue-500 ring-4 ring-white dark:ring-[#111827] shrink-0" />

                      {/* Content column */}
                      <div className="flex-1 min-w-0 space-y-1">
                        {/* Event Title */}
                        <div className="text-[13px] font-semibold text-[#0F172A] dark:text-[#F8FAFC] leading-snug break-words">
                          {title}
                        </div>

                        {/* Timestamp */}
                        {formattedTime && (
                          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            {formattedTime}
                          </div>
                        )}

                        {/* Performed By / Actor */}
                        {evt.performed_by && (
                          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                            By: <span className="font-medium text-[#334155] dark:text-[#CBD5E1]">{evt.performed_by}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="py-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                No recorded timeline events.
              </div>
            )}
          </Card>
        </div>
      )}

      {/* MODAL 1: UPDATE STATUS */}
      {statusModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Update Status</h3>
              <button type="button" onClick={() => setStatusModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatus} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Pipeline Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="NEW" className="dark:bg-[#111827]">New</option>
                  <option value="CONTACTED" className="dark:bg-[#111827]">Contacted</option>
                  <option value="INTERESTED" className="dark:bg-[#111827]">Interested</option>
                  <option value="QUALIFIED" className="dark:bg-[#111827]">Qualified</option>
                  <option value="FOLLOW_UP" className="dark:bg-[#111827]">Follow Up</option>
                  <option value="CONVERTED" className="dark:bg-[#111827]">Converted</option>
                  <option value="LOST" className="dark:bg-[#111827]">Lost</option>
                  <option value="DISQUALIFIED" className="dark:bg-[#111827]">Disqualified</option>
                </select>
              </div>

              {newStatus === 'LOST' && (
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-rose-600 dark:text-rose-400">Lost Reason *</label>
                  <textarea
                    value={lostReason}
                    onChange={(e) => setLostReason(e.target.value)}
                    rows={3}
                    required
                    placeholder="State why this lead was lost..."
                    className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-rose-300 rounded-xl text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC]"
                  />
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setStatusModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingStatus} className="bg-[#2563EB] text-white">
                  {isSubmittingStatus ? 'Saving...' : 'Save Status'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN STAFF */}
      {assignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Assign Staff Member</h3>
              <button type="button" onClick={() => setAssignModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAssignStaff} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Select Staff Member *</label>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  required
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="" className="dark:bg-[#111827]">-- Select Staff Member --</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id} className="dark:bg-[#111827]">
                      {staff.full_name || staff.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Reason / Note (Optional)</label>
                <input
                  type="text"
                  value={assignReason}
                  onChange={(e) => setAssignReason(e.target.value)}
                  placeholder="e.g. Reassigned for demo call"
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setAssignModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingAssign} className="bg-[#2563EB] text-white">
                  {isSubmittingAssign ? 'Assigning...' : 'Assign Staff'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: SCHEDULE FOLLOW-UP */}
      {followUpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Schedule Follow-Up</h3>
              <button type="button" onClick={() => setFollowUpModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleScheduleFollowUp} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Date & Time *</label>
                <input
                  type="datetime-local"
                  value={followUpForm.scheduled_at}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, scheduled_at: e.target.value })}
                  required
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Type</label>
                <select
                  value={followUpForm.follow_up_type}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, follow_up_type: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                >
                  <option value="CALL" className="dark:bg-[#111827]">Phone Call</option>
                  <option value="EMAIL" className="dark:bg-[#111827]">Email</option>
                  <option value="WHATSAPP" className="dark:bg-[#111827]">WhatsApp</option>
                  <option value="MEETING" className="dark:bg-[#111827]">Meeting</option>
                  <option value="DEMO" className="dark:bg-[#111827]">Live Demo</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Notes</label>
                <input
                  type="text"
                  value={followUpForm.notes}
                  onChange={(e) => setFollowUpForm({ ...followUpForm, notes: e.target.value })}
                  placeholder="Notes for this follow up..."
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setFollowUpModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingFollowUp} className="bg-[#2563EB] text-white">
                  {isSubmittingFollowUp ? 'Scheduling...' : 'Schedule'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: ADD NOTE */}
      {noteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-xl w-full max-w-md p-6 space-y-4 text-left">
            <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#263244] pb-3">
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC]">Add Internal Note</h3>
              <button type="button" onClick={() => setNoteModalOpen(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddNote} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Note Content *</label>
                <textarea
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  rows={4}
                  required
                  placeholder="Enter staff note content..."
                  className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0] dark:border-[#263244]">
                <Button type="button" variant="outline" onClick={() => setNoteModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSubmittingNote} className="bg-[#2563EB] text-white">
                  {isSubmittingNote ? 'Saving...' : 'Add Note'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
