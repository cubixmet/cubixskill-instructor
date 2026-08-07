import React, { useState, useMemo } from 'react';
import { Search, Filter, Download, UserCheck, MessageSquare, Mail, Phone, Calendar, Globe } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useLeadStore, LeadItem, LeadPipelineStatus, LeadSource } from '../store/lead.store';

export const LeadsManagementPage: React.FC = () => {
  const leads = useLeadStore((state) => state.leads);
  const updateLeadStatus = useLeadStore((state) => state.updateLeadStatus);
  const updateLeadNotes = useLeadStore((state) => state.updateLeadNotes);
  const exportLeadsCSV = useLeadStore((state) => state.exportLeadsCSV);

  const [search, setSearch] = useState('');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.courseTitle && l.courseTitle.toLowerCase().includes(search.toLowerCase()));
      const matchSource = selectedSource === 'all' || l.source === selectedSource;
      const matchStatus = selectedStatus === 'all' || l.status === selectedStatus;
      return matchSearch && matchSource && matchStatus;
    });
  }, [leads, search, selectedSource, selectedStatus]);

  return (
    <div className="space-y-6 font-sans text-xs text-slate-900 text-left pb-12 w-full max-w-full overflow-x-hidden">
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Public Website Leads</h1>
          <p className="text-slate-500 text-xs mt-1">
            Capture and qualify inquiries, demo requests, and student registrations from your public academy website.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportLeadsCSV} className="w-full sm:w-auto justify-center" leftIcon={<Download className="w-4 h-4" />}>
            Export Leads CSV
          </Button>
        </div>
      </div>

      {/* 2. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search lead name, email, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Lead Sources</option>
            <option value="Demo Request">Demo Request</option>
            <option value="Contact Form">Contact Form</option>
            <option value="Course Inquiry">Course Inquiry</option>
            <option value="Student Registration">Student Registration</option>
            <option value="Pricing Inquiry">Pricing Inquiry</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700"
          >
            <option value="all">All Pipeline Statuses</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Demo Scheduled">Demo Scheduled</option>
            <option value="Qualified">Qualified</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      {/* 3. LEADS TABLE (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Lead Name &amp; Contact</th>
                <th className="p-4">Country &amp; Code</th>
                <th className="p-4">Lead Source</th>
                <th className="p-4">Requested Course</th>
                <th className="p-4">Captured Date</th>
                <th className="p-4">Pipeline Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.map((lead) => (
                <tr key={lead.uuid} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-4">
                    <div className="font-bold text-slate-900">{lead.fullName}</div>
                    <div className="text-slate-500 font-mono text-[11px] break-all">{lead.email}</div>
                    {lead.phone && <div className="text-slate-400 text-[10px]">{lead.countryCode} {lead.phone}</div>}
                  </td>

                  <td className="p-4 font-medium text-slate-700">
                    {lead.country || 'Not specified'}
                  </td>

                  <td className="p-4">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap">
                      {lead.source}
                    </span>
                  </td>

                  <td className="p-4 font-semibold text-slate-900 max-w-xs truncate">
                    {lead.courseTitle || 'General Academy Inquiry'}
                  </td>

                  <td className="p-4 text-slate-600 whitespace-nowrap">
                    {new Date(lead.createdAt).toLocaleDateString()}
                  </td>

                  <td className="p-4 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => updateLeadStatus(lead.uuid, e.target.value as LeadPipelineStatus)}
                      className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800"
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Demo Scheduled">Demo Scheduled</option>
                      <option value="Qualified">Qualified</option>
                      <option value="Converted">Converted</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>

                  <td className="p-4 text-right whitespace-nowrap">
                    <Button variant="ghost" size="xs" onClick={() => setSelectedLead(lead)}>
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 4. LEADS CARDS (MOBILE) */}
      <div className="block md:hidden space-y-3">
        {filteredLeads.map((lead) => (
          <div key={lead.uuid} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{lead.fullName}</h3>
                <p className="text-slate-500 font-mono text-[11px] break-all">{lead.email}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 shrink-0">
                {lead.source}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block">Country</span>
                <span className="font-semibold text-slate-800">{lead.country || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block">Captured Date</span>
                <span className="font-semibold text-slate-800">{new Date(lead.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="pt-1 flex items-center justify-between gap-2">
              <select
                value={lead.status}
                onChange={(e) => updateLeadStatus(lead.uuid, e.target.value as LeadPipelineStatus)}
                className="h-8 px-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-800 flex-1"
              >
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Demo Scheduled">Demo Scheduled</option>
                <option value="Qualified">Qualified</option>
                <option value="Converted">Converted</option>
                <option value="Closed">Closed</option>
              </select>

              <Button variant="ghost" size="xs" onClick={() => setSelectedLead(lead)}>
                Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* LEAD DETAILS MODAL */}
      {selectedLead && (
        <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title={`Lead: ${selectedLead.fullName}`}>
          <div className="space-y-4 text-xs font-sans text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Email Address</span>
                <span className="font-bold text-slate-900 break-all">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Phone</span>
                <span className="font-bold text-slate-900">{selectedLead.countryCode} {selectedLead.phone || 'N/A'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Lead Source</span>
                <span className="font-bold text-slate-900">{selectedLead.source}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Requested Course</span>
                <span className="font-bold text-slate-900">{selectedLead.courseTitle || 'General Inquiry'}</span>
              </div>
            </div>

            <div className="space-y-1">
              <label className="block font-bold text-slate-900">Lead Notes</label>
              <textarea
                rows={3}
                value={selectedLead.notes || ''}
                onChange={(e) => updateLeadNotes(selectedLead.uuid, e.target.value)}
                placeholder="Add internal notes about lead conversations..."
                className="w-full p-3 rounded-xl border border-slate-200 text-xs focus:outline-hidden"
              />
            </div>

            <Button variant="outline" size="md" onClick={() => setSelectedLead(null)} className="w-full justify-center">
              Close Window
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
};
