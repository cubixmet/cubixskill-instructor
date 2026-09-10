import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, User, Mail, Phone, Tag, Shield, FileText, Loader2, CheckCircle2 } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { leadsService } from '../../../services/leads.service';

export const LeadCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    source: 'WEBSITE',
    source_detail: '',
    priority: 'NORMAL',
    preferred_contact_method: 'EMAIL',
  });

  const [errors, setErrors] = useState<{ full_name?: string; email?: string; general?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setIsSubmitting(true);

    try {
      const createdLead = await leadsService.createLead({
        full_name: form.full_name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        source: form.source,
        source_detail: form.source_detail.trim(),
        priority: form.priority,
        preferred_contact_method: form.preferred_contact_method,
      });

      setSuccessMsg(`Lead "${createdLead.full_name}" registered successfully.`);
      setTimeout(() => {
        navigate(`/demo-leads/${createdLead.id}`);
      }, 1000);
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setErrors({
          full_name: Array.isArray(err.data.full_name) ? err.data.full_name[0] : err.data.full_name,
          email: Array.isArray(err.data.email) ? err.data.email[0] : err.data.email,
          general: err.message || 'Validation error while saving lead.',
        });
      } else {
        setErrors({ general: err.message || 'Failed to create lead. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 text-left font-sans pb-32 sm:pb-12 max-w-4xl mx-auto px-1 sm:px-2">
      {/* Back Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => navigate('/demo-leads')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white p-2 -ml-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#172033] transition-colors cursor-pointer min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Demo Leads</span>
        </button>
      </div>

      {/* Main Card */}
      <Card padding="none" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] rounded-[16px] shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-[#E2E8F0] dark:border-[#263244]">
          <h1 className="text-lg sm:text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC]">
            Register New Demo Lead
          </h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1">
            Add a new prospective student inquiry to your Academy CRM pipeline.
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
          {/* Section 1: Contact Information */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Contact Information
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
                    placeholder="e.g. Rahul Sharma"
                    required
                    className={`w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                      errors.full_name ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                    } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                  />
                </div>
                {errors.full_name && <p className="text-[11px] text-rose-500 font-medium">{errors.full_name}</p>}
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
                    placeholder="rahul@example.com"
                    className={`w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                      errors.email ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
                    } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
                  />
                </div>
                {errors.email && <p className="text-[11px] text-rose-500 font-medium">{errors.email}</p>}
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
                    placeholder="+91 98765 43210"
                    className="w-full min-h-[44px] pl-9 pr-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Lead Classification */}
          <div className="space-y-4 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
              Lead Source & Priority
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                  Preferred Contact
                </label>
                <select
                  value={form.preferred_contact_method}
                  onChange={(e) => setForm({ ...form, preferred_contact_method: e.target.value })}
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer"
                >
                  <option value="EMAIL" className="dark:bg-[#111827]">Email</option>
                  <option value="PHONE" className="dark:bg-[#111827]">Phone Call</option>
                  <option value="WHATSAPP" className="dark:bg-[#111827]">WhatsApp</option>
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-3">
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                  Source Detail / Campaign Note
                </label>
                <input
                  type="text"
                  value={form.source_detail}
                  onChange={(e) => setForm({ ...form, source_detail: e.target.value })}
                  placeholder="e.g. Google Ads campaign, Facebook webinar lead"
                  className="w-full min-h-[44px] px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-6 border-t border-[#E2E8F0] dark:border-[#263244] flex flex-col-reverse sm:flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/demo-leads')}
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
                  <span>Saving Lead...</span>
                </span>
              ) : (
                'Save Lead'
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
