import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { leadsService, type LeadData } from '../../../services/leads.service';
import { staffService, type BackendStaffUser } from '../../../services/staff.service';

export const LeadEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { leadId } = useParams<{ leadId: string }>();

  const [lead, setLead] = useState<LeadData | null>(null);
  const [staffMembers, setStaffMembers] = useState<BackendStaffUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    source_detail: '',
    priority: 'NORMAL',
    status: 'NEW',
    preferred_contact_method: 'EMAIL',
    assigned_to_id: '',
    lost_reason: '',
    notes_summary: '',
  });

  const [errors, setErrors] = useState<{ full_name?: string; email?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchLeadAndStaff = useCallback(async () => {
    if (!leadId) return;
    setIsLoading(true);
    setIsError(false);
    try {
      const [leadData, staffData] = await Promise.all([
        leadsService.getLead(leadId),
        staffService.getStaffMembers().catch(() => []),
      ]);

      setLead(leadData);
      setStaffMembers(staffData || []);

      setForm({
        full_name: leadData.full_name || '',
        email: leadData.email || '',
        phone: leadData.phone || '',
        source: leadData.source || 'WEBSITE',
        source_detail: leadData.source_detail || '',
        priority: leadData.priority || 'NORMAL',
        status: leadData.status || 'NEW',
        preferred_contact_method: leadData.preferred_contact_method || 'EMAIL',
        assigned_to_id: leadData.assigned_to_id || '',
        lost_reason: leadData.lost_reason || '',
        notes_summary: leadData.notes_summary || '',
      });
    } catch (err: any) {
      setIsError(true);
      setErrorMessage(err.message || 'Unable to load lead details for editing.');
    } finally {
      setIsLoading(false);
    }
  }, [leadId]);

  useEffect(() => {
    fetchLeadAndStaff();
  }, [fetchLeadAndStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leadId) return;
    setErrors({});
    setSuccessMsg(null);

    if (!form.full_name.trim()) {
      setErrors({ full_name: 'Full name is required.' });
      return;
    }

    if (!form.email.trim() && !form.phone.trim()) {
      setErrors({ general: 'At least one contact method (email or phone) is required.' });
      return;
    }

    if (form.status === 'LOST' && !form.lost_reason.trim()) {
      setErrors({ general: 'A reason is required when marking a lead as Lost.' });
      return;
    }

    setIsSubmitting(true);

    try {
      const updated = await leadsService.updateLead(leadId, {
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: form.source,
        source_detail: form.source_detail.trim(),
        priority: form.priority as any,
        status: form.status as any,
        preferred_contact_method: form.preferred_contact_method,
        assigned_to_id: form.assigned_to_id || undefined,
        lost_reason: form.lost_reason.trim(),
        notes_summary: form.notes_summary.trim(),
      });

      setSuccessMsg(`Lead "${updated.full_name}" updated successfully.`);
      setTimeout(() => {
        navigate(`/demo-leads/${updated.id}`);
      }, 1000);
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setErrors({
          full_name: Array.isArray(err.data.full_name) ? err.data.full_name[0] : err.data.full_name,
          email: Array.isArray(err.data.email) ? err.data.email[0] : err.data.email,
          general: err.message || 'Error saving changes to lead.',
        });
      } else {
        setErrors({ general: err.message || 'Failed to update lead.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full font-sans">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
        <span className="text-xs font-semibold text-slate-500 mt-2">Loading lead details for editing...</span>
      </div>
    );
  }

  if (isError || !lead) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-rose-50 dark:bg-[#3f1d24]/50 border border-rose-200 dark:border-rose-900/60 rounded-[16px] text-center space-y-4 font-sans">
        <AlertCircle className="w-10 h-10 text-rose-600 mx-auto" />
        <div>
          <h2 className="text-base font-bold text-rose-900 dark:text-rose-200">Failed to Load Lead</h2>
          <p className="text-xs text-rose-700 dark:text-rose-300 mt-1">{errorMessage || 'Lead not found.'}</p>
        </div>
        <Button variant="outline" size="sm" onClick={() => navigate('/demo-leads')}>
          Back to Demo Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-left font-sans pb-32 sm:pb-12 max-w-4xl mx-auto px-1 sm:px-2">
      {/* Back Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate(`/demo-leads/${lead.id}`)}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Lead Details</span>
        </button>
      </div>

      <Card padding="none" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E2E8F0] dark:border-[#263244]">
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Edit Lead: {lead.full_name}
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Update contact details, assignment, status, and notes.
          </p>
        </div>

        {successMsg && (
          <div className="m-4 sm:m-6 p-4 bg-emerald-50 dark:bg-[#064e3b]/30 text-emerald-800 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800/40 text-xs font-semibold flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errors.general && (
          <div className="m-4 sm:m-6 p-4 bg-rose-50 dark:bg-[#3f1d24]/50 text-rose-800 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-900/60 text-xs font-semibold">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6">
          {/* Contact Details */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Full Name <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={form.full_name}
                    onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                    required
                    className={`w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                      errors.full_name ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                    } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* CRM Classification & Assignment */}
          <div className="space-y-4 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              CRM Status & Ownership
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Pipeline Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
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

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Priority
                </label>
                <select
                  value={form.priority}
                  onChange={(e) => setForm({ ...form, priority: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
                >
                  <option value="LOW" className="dark:bg-[#111827]">Low</option>
                  <option value="NORMAL" className="dark:bg-[#111827]">Normal</option>
                  <option value="HIGH" className="dark:bg-[#111827]">High</option>
                  <option value="URGENT" className="dark:bg-[#111827]">Urgent</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Assigned Staff
                </label>
                <select
                  value={form.assigned_to_id}
                  onChange={(e) => setForm({ ...form, assigned_to_id: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
                >
                  <option value="" className="dark:bg-[#111827]">Unassigned</option>
                  {staffMembers.map((staff) => (
                    <option key={staff.id} value={staff.id} className="dark:bg-[#111827]">
                      {staff.full_name || staff.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Lead Source
                </label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
                >
                  <option value="WEBSITE" className="dark:bg-[#111827]">Website</option>
                  <option value="LANDING_PAGE" className="dark:bg-[#111827]">Landing Page</option>
                  <option value="COURSE_ENQUIRY" className="dark:bg-[#111827]">Course Enquiry</option>
                  <option value="MANUAL" className="dark:bg-[#111827]">Manual Entry</option>
                  <option value="PHONE" className="dark:bg-[#111827]">Phone</option>
                  <option value="WHATSAPP" className="dark:bg-[#111827]">WhatsApp</option>
                  <option value="EMAIL" className="dark:bg-[#111827]">Email</option>
                  <option value="SOCIAL_MEDIA" className="dark:bg-[#111827]">Social Media</option>
                  <option value="REFERRAL" className="dark:bg-[#111827]">Referral</option>
                  <option value="WALK_IN" className="dark:bg-[#111827]">Walk In</option>
                  <option value="OTHER" className="dark:bg-[#111827]">Other</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Source Detail
                </label>
                <input
                  type="text"
                  value={form.source_detail}
                  onChange={(e) => setForm({ ...form, source_detail: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>

              {form.status === 'LOST' && (
                <div className="space-y-1.5 sm:col-span-3">
                  <label className="block text-xs font-bold text-rose-600 dark:text-rose-400">
                    Lost Reason *
                  </label>
                  <textarea
                    value={form.lost_reason}
                    onChange={(e) => setForm({ ...form, lost_reason: e.target.value })}
                    rows={2}
                    placeholder="Provide reason for losing this lead..."
                    className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-rose-300 dark:border-rose-900 rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}

              <div className="space-y-1.5 sm:col-span-3">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Summary Notes
                </label>
                <textarea
                  value={form.notes_summary}
                  onChange={(e) => setForm({ ...form, notes_summary: e.target.value })}
                  rows={3}
                  placeholder="Summary notes about lead background, requirements..."
                  className="w-full p-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-normal text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#263244] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(`/demo-leads/${lead.id}`)}
              className="w-full sm:w-auto min-h-[44px] px-6 text-xs font-semibold border-[#CBD5E1] dark:border-[#334155]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto min-h-[44px] px-8 text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white cursor-pointer shadow-xs shadow-blue-600/25"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Changes...</span>
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
