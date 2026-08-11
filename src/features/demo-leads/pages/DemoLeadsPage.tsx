import React, { useState, useMemo } from 'react';
import {
  Search,
  TrendingUp,
  Download,
  Plus,
  MoreVertical,
  Calendar,
  UserCheck,
  Clock,
  Mail,
  Phone,
  Building2,
  Trash2,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { Badge } from '../../../components/ui/Badge';

export interface DemoLeadItem {
  uuid: string;
  courseTitle: string;
  fullName: string;
  email: string;
  phone?: string;
  organization?: string;
  status: 'active' | 'converted' | 'expired' | 'deactivated';
  interestedStatus: 'hot' | 'warm' | 'cold';
  demoStartDate: string;
  demoExpiryDate: string;
  magicToken: string;
  lastLoginAt?: string;
  completionPercent: number;
  completedLessonUuids: string[];
  notes?: string;
  createdAt: string;
}

const INITIAL_DEMO_LEADS: DemoLeadItem[] = [
  {
    uuid: 'lead-101',
    courseTitle: 'Full-Stack Web Development Bootcamp',
    fullName: 'Sophia Chen',
    email: 'sophia.chen@techcorp.io',
    phone: '+1 (555) 234-5678',
    organization: 'TechCorp Solutions',
    status: 'active',
    interestedStatus: 'hot',
    demoStartDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    demoExpiryDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
    magicToken: 'demo-tok-sophia-9823',
    lastLoginAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    completionPercent: 60,
    completedLessonUuids: ['les-1', 'les-2'],
    notes: 'Requested group discount info for engineering team of 15 members.',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uuid: 'lead-102',
    courseTitle: 'UI/UX Design Masterclass 2026',
    fullName: 'Marcus Vance',
    email: 'marcus.vance@designstudio.com',
    phone: '+1 (555) 876-5432',
    organization: 'Vance Design Lab',
    status: 'converted',
    interestedStatus: 'hot',
    demoStartDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    demoExpiryDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    magicToken: 'demo-tok-marcus-1102',
    lastLoginAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
    completionPercent: 100,
    completedLessonUuids: ['les-1', 'les-2', 'les-3'],
    notes: 'Converted to full paid student account after completing demo module.',
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    uuid: 'lead-103',
    courseTitle: 'Full-Stack Web Development Bootcamp',
    fullName: 'Aarav Patel',
    email: 'aarav.patel@devhouse.in',
    phone: '+91 98765 43210',
    organization: 'DevHouse India',
    status: 'expired',
    interestedStatus: 'warm',
    demoStartDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    demoExpiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    magicToken: 'demo-tok-aarav-3341',
    lastLoginAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    completionPercent: 33,
    completedLessonUuids: ['les-1'],
    notes: 'Expired 2 days ago. Candidate for demo extension email.',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

export const DemoLeadsPage: React.FC = () => {
  const [leads, setLeads] = useState<DemoLeadItem[]>(INITIAL_DEMO_LEADS);
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedLead, setSelectedLead] = useState<DemoLeadItem | null>(null);
  const [activeMenuUuid, setActiveMenuUuid] = useState<string | null>(null);

  // Extend Demo Modal
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendLeadUuid, setExtendLeadUuid] = useState<string | null>(null);
  const [extraDays, setExtraDays] = useState<number>(3);

  // Add Lead Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newOrg, setNewOrg] = useState('');
  const [newCourse, setNewCourse] = useState('Full-Stack Web Development Bootcamp');

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.phone && l.phone.toLowerCase().includes(search.toLowerCase())) ||
        (l.organization && l.organization.toLowerCase().includes(search.toLowerCase())) ||
        l.courseTitle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === 'all' || l.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, selectedStatus]);

  // Statistics calculation
  const [now] = useState(() => Date.now());
  const totalRegistrations = leads.length;
  const activeDemoUsers = leads.filter(
    (l) => l.status === 'active' && new Date(l.demoExpiryDate).getTime() > now
  ).length;
  const expiredDemos = leads.filter(
    (l) => l.status === 'expired' || (l.status === 'active' && new Date(l.demoExpiryDate).getTime() <= now)
  ).length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalRegistrations > 0 ? Math.round((convertedCount / totalRegistrations) * 100) : 0;

  const handleExtendDemo = (leadUuid: string) => {
    setExtendLeadUuid(leadUuid);
    setExtendModalOpen(true);
    setActiveMenuUuid(null);
  };

  const submitExtendDemo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extendLeadUuid) return;

    setLeads((prev) =>
      prev.map((l) => {
        if (l.uuid !== extendLeadUuid) return l;
        const currentExpiry = new Date(l.demoExpiryDate).getTime() > Date.now() ? new Date(l.demoExpiryDate) : new Date();
        const newExpiry = new Date(currentExpiry.getTime() + extraDays * 24 * 60 * 60 * 1000).toISOString();
        return {
          ...l,
          demoExpiryDate: newExpiry,
          status: 'active',
          notes: `${l.notes ? l.notes + ' | ' : ''}Extended by ${extraDays} days on ${new Date().toLocaleDateString()}`,
        };
      })
    );

    setExtendModalOpen(false);
    setExtendLeadUuid(null);
  };

  const handleConvert = (leadUuid: string) => {
    setLeads((prev) => prev.map((l) => (l.uuid === leadUuid ? { ...l, status: 'converted' } : l)));
    setActiveMenuUuid(null);
  };

  const handleDeleteLead = (leadUuid: string) => {
    setLeads((prev) => prev.filter((l) => l.uuid !== leadUuid));
    setActiveMenuUuid(null);
  };

  const handleAddLeadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName.trim() || !newEmail.trim()) return;

    const newLeadItem: DemoLeadItem = {
      uuid: `lead-${Date.now()}`,
      fullName: newFullName,
      email: newEmail,
      phone: newPhone,
      organization: newOrg || 'Individual',
      courseTitle: newCourse,
      status: 'active',
      interestedStatus: 'hot',
      demoStartDate: new Date().toISOString(),
      demoExpiryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      magicToken: `demo-tok-${Date.now()}`,
      completionPercent: 0,
      completedLessonUuids: [],
      createdAt: new Date().toISOString(),
    };

    setLeads((prev) => [newLeadItem, ...prev]);
    setAddModalOpen(false);
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewOrg('');
  };

  const exportCSV = () => {
    const headers = 'Name,Email,Phone,Organization,Course,Status,Demo Start,Demo Expiry,Completion %\n';
    const rows = leads
      .map(
        (l) =>
          `"${l.fullName}","${l.email}","${l.phone || ''}","${l.organization || ''}","${l.courseTitle}","${l.status}","${new Date(
            l.demoStartDate
          ).toLocaleDateString()}","${new Date(l.demoExpiryDate).toLocaleDateString()}","${l.completionPercent}%"`
      )
      .join('\n');

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Demo_Leads_Report_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  // Initials generator
  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-xs text-slate-900 text-left pb-36 sm:pb-12 max-w-[1600px] mx-auto px-1 sm:px-2">
      {/* 1. HEADER BAR */}
      <div className="bg-white p-4 sm:p-6 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Demo Leads
            </h1>
            <p className="text-xs text-[#64748B] font-medium mt-0.5">
              Manage demo requests, temporary access, and conversion pipelines.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={exportCSV}
              leftIcon={<Download className="w-4 h-4 text-[#0F172A]" />}
              className="border-[#E2E8F0] text-xs font-semibold text-[#0F172A] h-9 sm:h-10 cursor-pointer"
            >
              Export CSV
            </Button>

            <Button
              size="sm"
              onClick={() => setAddModalOpen(true)}
              leftIcon={<Plus className="w-4 h-4 stroke-[3]" />}
              className="bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold h-9 sm:h-10 cursor-pointer shadow-2xs"
            >
              Add Lead
            </Button>
          </div>
        </div>
      </div>

      {/* 2. METRICS SUMMARY GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
        <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block">Total Registrations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-2xl font-bold text-[#0F172A]">{totalRegistrations}</span>
            <span className="text-[10px] text-emerald-600 font-bold hidden sm:flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +100%
            </span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block">Active Demo Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-2xl font-bold text-[#2563EB]">{activeDemoUsers}</span>
            <span className="text-[10px] text-[#64748B] hidden sm:inline">5-day window</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block">Expired Demos</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-2xl font-bold text-amber-600">{expiredDemos}</span>
            <span className="text-[10px] text-[#64748B] hidden sm:inline">Pending</span>
          </div>
        </div>

        <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#E2E8F0] shadow-2xs space-y-1">
          <span className="text-[10px] sm:text-xs text-[#64748B] font-medium block">Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-lg sm:text-2xl font-bold text-emerald-600">{conversionRate}%</span>
            <span className="text-[10px] text-[#64748B] hidden sm:inline">{convertedCount} Converted</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="bg-white p-3.5 sm:p-4 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-3">
        <div className="relative">
          <Search className="w-4 h-4 text-[#64748B] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search leads by name, email, phone, company..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[#E2E8F0] text-xs font-medium text-[#0F172A] bg-white focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        {/* STATUS FILTER CHIPS */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {[
            { id: 'all', label: 'All Statuses' },
            { id: 'active', label: 'Active Demo' },
            { id: 'converted', label: 'Converted' },
            { id: 'expired', label: 'Expired' },
            { id: 'deactivated', label: 'Deactivated' },
          ].map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setSelectedStatus(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedStatus === f.id
                  ? 'bg-[#2563EB] text-white shadow-2xs'
                  : 'bg-slate-50 border border-[#E2E8F0] text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100'
              }`}
            >
              {f.label}
            </button>
          ))}

          {selectedStatus !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedStatus('all')}
              className="px-2 py-1.5 text-xs text-[#2563EB] font-bold hover:underline cursor-pointer shrink-0"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* 4. DEMO LEADS LIST (MOBILE CARDS & DESKTOP ROWS) */}
      {filteredLeads.length === 0 ? (
        <div className="bg-white p-8 rounded-[16px] border border-[#E2E8F0] text-center space-y-3">
          <p className="text-xs font-semibold text-[#64748B]">
            {search ? 'No demo leads match your search criteria.' : 'No demo leads found.'}
          </p>
          {search && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSearch('')}
              className="text-xs font-semibold h-8 px-3"
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLeads.map((lead) => {
            const isExpired = new Date(lead.demoExpiryDate).getTime() <= now;

            return (
              <div
                key={lead.uuid}
                className="bg-white p-4 rounded-[16px] border border-[#E2E8F0] shadow-2xs space-y-3 text-xs"
              >
                {/* Header: Avatar, Name, Status Badge & Menu */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="w-10 h-10 rounded-full bg-[#2563EB] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      {getInitials(lead.fullName)}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <h3 className="font-bold text-[#0F172A] text-sm leading-snug break-words">
                        {lead.fullName}
                      </h3>
                      <div>
                        <Badge
                          variant={
                            lead.status === 'converted'
                              ? 'success'
                              : lead.status === 'deactivated'
                              ? 'secondary'
                              : isExpired
                              ? 'warning'
                              : 'primary'
                          }
                          size="sm"
                        >
                          {lead.status === 'converted'
                            ? 'Converted'
                            : lead.status === 'deactivated'
                            ? 'Deactivated'
                            : isExpired
                            ? 'Expired'
                            : 'Active Demo'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  {/* 3-Dot Action Menu */}
                  <div className="relative shrink-0">
                    <button
                      type="button"
                      onClick={() => setActiveMenuUuid(activeMenuUuid === lead.uuid ? null : lead.uuid)}
                      className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#E2E8F0] text-[#64748B] hover:bg-slate-50 cursor-pointer"
                      title="More options"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuUuid === lead.uuid && (
                      <div className="absolute right-0 top-10 z-20 w-48 bg-white border border-[#E2E8F0] rounded-xl shadow-lg py-1 text-xs text-[#0F172A] space-y-0.5">
                        <button
                          type="button"
                          onClick={() => handleExtendDemo(lead.uuid)}
                          className="w-full px-3 py-2 text-left hover:bg-slate-50 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>Extend Demo (+3 Days)</span>
                        </button>

                        {lead.status !== 'converted' && (
                          <button
                            type="button"
                            onClick={() => handleConvert(lead.uuid)}
                            className="w-full px-3 py-2 text-left hover:bg-emerald-50 text-emerald-700 font-medium flex items-center gap-2 cursor-pointer"
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>Convert to Paid Student</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteLead(lead.uuid)}
                          className="w-full px-3 py-2 text-left hover:bg-rose-50 text-rose-600 font-medium flex items-center gap-2 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete Lead</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact Information Rows (Full Width) */}
                <div className="space-y-1.5 pt-1 text-xs text-[#64748B] font-medium">
                  <div className="flex items-start gap-2 min-w-0">
                    <Mail className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                    <span className="flex-1 min-w-0 break-all text-[#0F172A]">{lead.email}</span>
                  </div>

                  {lead.phone && (
                    <div className="flex items-start gap-2 min-w-0">
                      <Phone className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                      <span className="flex-1 min-w-0 break-words text-[#0F172A]">{lead.phone}</span>
                    </div>
                  )}

                  {lead.organization && (
                    <div className="flex items-start gap-2 min-w-0">
                      <Building2 className="w-4 h-4 text-[#64748B] shrink-0 mt-0.5" />
                      <span className="flex-1 min-w-0 break-words text-[#0F172A]">{lead.organization}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-[#E2E8F0] pt-3 space-y-3">
                  {/* Requested Course */}
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-[#64748B] uppercase tracking-wider block">
                      Requested Course
                    </span>
                    <h4 className="font-bold text-[#0F172A] text-xs leading-snug break-words">
                      {lead.courseTitle}
                    </h4>
                  </div>

                  {/* Demo Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#64748B]">Demo Completion</span>
                      <span className="font-bold text-[#2563EB]">{lead.completionPercent}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/50">
                      <div
                        className="h-full bg-[#2563EB] rounded-full transition-all"
                        style={{ width: `${lead.completionPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Dates Footer */}
                  <div className="flex items-center justify-between text-[11px] text-[#64748B] pt-1 flex-wrap gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-[#64748B]" /> Start: {new Date(lead.demoStartDate).toLocaleDateString()}
                    </span>
                    <span className={`font-semibold flex items-center gap-1 ${isExpired ? 'text-rose-600 font-bold' : 'text-[#0F172A]'}`}>
                      <Calendar className="w-3.5 h-3.5" /> Expiry: {new Date(lead.demoExpiryDate).toLocaleDateString()}
                    </span>
                  </div>

                  {/* View Details Action Button */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setSelectedLead(lead)}
                      className="w-full py-2.5 px-4 rounded-xl border border-[#E2E8F0] bg-slate-50 hover:bg-slate-100 text-[#0F172A] font-semibold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>View Details</span>
                      <span className="text-[#2563EB]">→</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. LEAD DETAILS MODAL */}
      {selectedLead && (
        <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title={`Demo Lead: ${selectedLead.fullName}`}>
          <div className="space-y-4 text-xs font-sans text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-[#E2E8F0] grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="text-[#64748B] text-[10px] font-semibold uppercase block">Lead Email</span>
                <span className="font-bold text-[#0F172A] break-all">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] font-semibold uppercase block">Organization</span>
                <span className="font-bold text-[#0F172A]">{selectedLead.organization || 'Individual'}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] font-semibold uppercase block">Requested Course</span>
                <span className="font-bold text-[#0F172A]">{selectedLead.courseTitle}</span>
              </div>
              <div>
                <span className="text-[#64748B] text-[10px] font-semibold uppercase block">Expiry Date</span>
                <span className="font-bold text-[#0F172A]">{new Date(selectedLead.demoExpiryDate).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-[#0F172A]">Demo Progress &amp; Activity Log</h4>
              <div className="p-3.5 rounded-xl bg-white border border-[#E2E8F0] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-[#64748B]">Course Completion Rate</span>
                  <span className="font-bold text-[#2563EB]">{selectedLead.completionPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-[#2563EB] rounded-full" style={{ width: `${selectedLead.completionPercent}%` }} />
                </div>
                <p className="text-[11px] text-[#64748B]">
                  Last login: {selectedLead.lastLoginAt ? new Date(selectedLead.lastLoginAt).toLocaleString() : 'Not recorded'}
                </p>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="space-y-1">
                <h4 className="font-bold text-[#0F172A]">Notes</h4>
                <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {selectedLead.notes}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-between gap-2 border-t border-[#E2E8F0]">
              <Button variant="outline" size="sm" onClick={() => setSelectedLead(null)} className="w-full sm:w-auto">
                Close
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button size="sm" variant="outline" onClick={() => handleExtendDemo(selectedLead.uuid)} className="w-full sm:w-auto justify-center">
                  Extend Demo (+3 Days)
                </Button>
                <Button size="sm" className="bg-[#2563EB] text-white w-full sm:w-auto justify-center font-semibold" onClick={() => handleConvert(selectedLead.uuid)}>
                  Convert to Paid Student
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 6. EXTEND DEMO MODAL */}
      <Modal isOpen={extendModalOpen} onClose={() => setExtendModalOpen(false)} title="Extend Demo Access">
        <form onSubmit={submitExtendDemo} className="space-y-4 font-sans text-xs text-left">
          <p className="text-[#64748B]">Choose the number of additional days to extend demo access for this lead.</p>
          <div>
            <label className="block font-semibold text-[#0F172A] mb-1">Additional Extension Days</label>
            <select
              value={extraDays}
              onChange={(e) => setExtraDays(Number(e.target.value))}
              className="w-full h-10 rounded-xl border border-[#E2E8F0] px-3 bg-white text-xs font-semibold focus:outline-none"
            >
              <option value={3}>+3 Days Extension</option>
              <option value={5}>+5 Days Extension</option>
              <option value={7}>+7 Days Extension</option>
              <option value={14}>+14 Days Extension</option>
            </select>
          </div>
          <Button type="submit" size="sm" className="w-full font-semibold bg-[#2563EB] text-white justify-center h-10">
            Confirm Extension
          </Button>
        </form>
      </Modal>

      {/* 7. ADD LEAD MODAL */}
      <Modal isOpen={addModalOpen} onClose={() => setAddModalOpen(false)} title="Add Demo Lead">
        <form onSubmit={handleAddLeadSubmit} className="space-y-3.5 font-sans text-xs text-left">
          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Full Name *</label>
            <input
              type="text"
              required
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              placeholder="e.g. Rahul Sharma"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Email Address *</label>
            <input
              type="email"
              required
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="e.g. rahul@example.com"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Phone Number</label>
            <input
              type="text"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
              placeholder="e.g. +91 98765 43210"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Organization / Company</label>
            <input
              type="text"
              value={newOrg}
              onChange={(e) => setNewOrg(e.target.value)}
              placeholder="e.g. Tech Corp"
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-semibold text-[#0F172A]">Interested Course</label>
            <input
              type="text"
              value={newCourse}
              onChange={(e) => setNewCourse(e.target.value)}
              className="w-full h-9 px-3 rounded-xl border border-[#E2E8F0] text-xs font-medium focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" size="sm" onClick={() => setAddModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" className="bg-[#2563EB] text-white font-semibold">
              Create Lead
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
