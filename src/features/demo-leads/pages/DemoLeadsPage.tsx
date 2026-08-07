import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';

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

  // Extend Demo Modal
  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendLeadUuid, setExtendLeadUuid] = useState<string | null>(null);
  const [extraDays, setExtraDays] = useState<number>(3);

  const filteredLeads = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        l.fullName.toLowerCase().includes(search.toLowerCase()) ||
        l.email.toLowerCase().includes(search.toLowerCase()) ||
        (l.organization && l.organization.toLowerCase().includes(search.toLowerCase())) ||
        l.courseTitle.toLowerCase().includes(search.toLowerCase());
      const matchStatus = selectedStatus === 'all' || l.status === selectedStatus;
      return matchSearch && matchStatus;
    });
  }, [leads, search, selectedStatus]);

  // Statistics calculation
  const totalRegistrations = leads.length;
  const activeDemoUsers = leads.filter(
    (l) => l.status === 'active' && new Date(l.demoExpiryDate).getTime() > Date.now()
  ).length;
  const expiredDemos = leads.filter(
    (l) => l.status === 'expired' || (l.status === 'active' && new Date(l.demoExpiryDate).getTime() <= Date.now())
  ).length;
  const convertedCount = leads.filter((l) => l.status === 'converted').length;
  const conversionRate = totalRegistrations > 0 ? Math.round((convertedCount / totalRegistrations) * 100) : 0;

  const handleExtendDemo = (leadUuid: string) => {
    setExtendLeadUuid(leadUuid);
    setExtendModalOpen(true);
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

  return (
    <div className="space-y-6 font-sans text-xs text-slate-900 text-left pb-12 w-full max-w-full overflow-x-hidden">
      {/* 1. HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Demo Leads &amp; Temporary Access
          </h1>
          <p className="text-slate-500 text-xs mt-1">
            Track automated 5-day demo registrations, course progress, and conversion pipelines.
          </p>
        </div>

        <div className="w-full sm:w-auto">
          <Button variant="outline" size="sm" onClick={exportCSV} className="w-full sm:w-auto justify-center" leftIcon={<Download className="w-4 h-4" />}>
            Export Leads CSV
          </Button>
        </div>
      </div>

      {/* 2. METRICS SUMMARY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Total Demo Registrations</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-slate-900">{totalRegistrations}</span>
            <span className="text-xs text-emerald-600 font-bold flex items-center gap-0.5">
              <TrendingUp className="w-3.5 h-3.5" /> +100%
            </span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Active Demo Users</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-blue-600">{activeDemoUsers}</span>
            <span className="text-[11px] text-slate-400">Within 5-day window</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Expired Demos</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-amber-600">{expiredDemos}</span>
            <span className="text-[11px] text-slate-400">Pending conversion</span>
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-1">
          <span className="text-slate-500 text-xs font-medium">Demo Conversion Rate</span>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-extrabold text-emerald-600">{conversionRate}%</span>
            <span className="text-[11px] text-slate-400">{convertedCount} Converted</span>
          </div>
        </div>
      </div>

      {/* 3. SEARCH & FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search lead name, email, company, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-xl border border-slate-200 text-xs focus:outline-hidden focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full sm:w-auto h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-700 focus:outline-hidden"
          >
            <option value="all">All Lead Statuses</option>
            <option value="active">Active (Within 5 Days)</option>
            <option value="converted">Converted to Paid</option>
            <option value="expired">Expired</option>
            <option value="deactivated">Deactivated</option>
          </select>
        </div>
      </div>

      {/* 4. DEMO LEADS DATA TABLE (DESKTOP) */}
      <div className="hidden md:block bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="p-4">Lead Name &amp; Contact</th>
                <th className="p-4">Organization</th>
                <th className="p-4">Requested Course</th>
                <th className="p-4">Demo Period</th>
                <th className="p-4">Progress</th>
                <th className="p-4 whitespace-nowrap">Status</th>
                <th className="p-4 text-right whitespace-nowrap min-w-[220px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredLeads.map((lead) => {
                const isExpired = new Date(lead.demoExpiryDate).getTime() <= Date.now();
                return (
                  <tr key={lead.uuid} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-slate-900">{lead.fullName}</div>
                      <div className="text-slate-500 font-mono text-[11px] break-all">{lead.email}</div>
                      {lead.phone && <div className="text-slate-400 text-[10px]">{lead.phone}</div>}
                    </td>

                    <td className="p-4 text-slate-700 font-medium">
                      {lead.organization || <span className="text-slate-400 font-normal">Individual</span>}
                    </td>

                    <td className="p-4">
                      <span className="font-semibold text-slate-900 block max-w-xs truncate" title={lead.courseTitle}>
                        {lead.courseTitle}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 whitespace-nowrap">
                      <div>Start: {new Date(lead.demoStartDate).toLocaleDateString()}</div>
                      <div className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                        Expiry: {new Date(lead.demoExpiryDate).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="space-y-1 w-28">
                        <div className="flex justify-between text-[10px] font-bold text-slate-700">
                          <span>{lead.completionPercent}%</span>
                        </div>
                        <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full bg-blue-600 rounded-full" style={{ width: `${lead.completionPercent}%` }} />
                        </div>
                      </div>
                    </td>

                    <td className="p-4 whitespace-nowrap">
                      {lead.status === 'converted' ? (
                        <span className="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                          Converted
                        </span>
                      ) : lead.status === 'deactivated' ? (
                        <span className="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                          Deactivated
                        </span>
                      ) : isExpired ? (
                        <span className="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          Expired
                        </span>
                      ) : (
                        <span className="whitespace-nowrap inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">
                          Active Demo
                        </span>
                      )}
                    </td>

                    <td className="p-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2 shrink-0">
                        <Button variant="ghost" size="xs" onClick={() => setSelectedLead(lead)}>
                          Details
                        </Button>
                        <Button variant="outline" size="xs" onClick={() => handleExtendDemo(lead.uuid)}>
                          + Extend
                        </Button>
                        {lead.status !== 'converted' && (
                          <Button variant="outline" size="xs" className="text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={() => handleConvert(lead.uuid)}>
                            Convert
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. MOBILE LEAD CARDS VIEW (TABLET & MOBILE) */}
      <div className="block md:hidden space-y-3">
        {filteredLeads.map((lead) => {
          const isExpired = new Date(lead.demoExpiryDate).getTime() <= Date.now();
          return (
            <div key={lead.uuid} className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{lead.fullName}</h3>
                  <p className="text-slate-500 font-mono text-[11px] break-all">{lead.email}</p>
                  {lead.phone && <p className="text-slate-400 text-[11px] mt-0.5">{lead.phone}</p>}
                </div>
                <div>
                  {lead.status === 'converted' ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                      Converted
                    </span>
                  ) : lead.status === 'deactivated' ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 shrink-0">
                      Deactivated
                    </span>
                  ) : isExpired ? (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 shrink-0">
                      Expired
                    </span>
                  ) : (
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 shrink-0">
                      Active Demo
                    </span>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Organization</span>
                  <span className="font-semibold text-slate-800">{lead.organization || 'Individual'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-mono block">Progress</span>
                  <span className="font-bold text-blue-600">{lead.completionPercent}%</span>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-[10px] uppercase font-mono block">Requested Course</span>
                <span className="font-semibold text-slate-900 leading-snug block">{lead.courseTitle}</span>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
                <span>Start: {new Date(lead.demoStartDate).toLocaleDateString()}</span>
                <span className={`font-semibold ${isExpired ? 'text-rose-600' : 'text-slate-900'}`}>
                  Expiry: {new Date(lead.demoExpiryDate).toLocaleDateString()}
                </span>
              </div>

              <div className="pt-1 flex items-center gap-2">
                <Button variant="ghost" size="xs" onClick={() => setSelectedLead(lead)} className="flex-1 justify-center min-h-[36px]">
                  Details
                </Button>
                <Button variant="outline" size="xs" onClick={() => handleExtendDemo(lead.uuid)} className="flex-1 justify-center min-h-[36px]">
                  + Extend
                </Button>
                {lead.status !== 'converted' && (
                  <Button variant="outline" size="xs" className="flex-1 justify-center min-h-[36px] text-emerald-700 border-emerald-300 hover:bg-emerald-50" onClick={() => handleConvert(lead.uuid)}>
                    Convert
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 6. LEAD DETAILS MODAL */}
      {selectedLead && (
        <Modal isOpen={!!selectedLead} onClose={() => setSelectedLead(null)} title={`Demo Lead: ${selectedLead.fullName}`}>
          <div className="space-y-6 text-xs font-sans text-left">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Lead Email</span>
                <span className="font-bold text-slate-900 break-all">{selectedLead.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Organization</span>
                <span className="font-bold text-slate-900">{selectedLead.organization || 'Individual'}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Requested Course</span>
                <span className="font-bold text-slate-900">{selectedLead.courseTitle}</span>
              </div>
              <div>
                <span className="text-slate-400 font-mono text-[10px] uppercase block">Expiry Date</span>
                <span className="font-bold text-slate-900">{new Date(selectedLead.demoExpiryDate).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-bold text-slate-900">Demo Progress &amp; Activity Log</h4>
              <div className="p-4 rounded-2xl bg-white border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-700">Course Completion Rate</span>
                  <span className="font-extrabold text-blue-600">{selectedLead.completionPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div className="h-full bg-blue-600 rounded-full" style={{ width: `${selectedLead.completionPercent}%` }} />
                </div>
                <p className="text-[11px] text-slate-500">
                  Last login: {selectedLead.lastLoginAt ? new Date(selectedLead.lastLoginAt).toLocaleString() : 'Not recorded'}
                </p>
              </div>
            </div>

            {selectedLead.notes && (
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900">Instructor Notes</h4>
                <p className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                  {selectedLead.notes}
                </p>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row justify-between gap-3">
              <Button variant="outline" size="md" onClick={() => setSelectedLead(null)} className="w-full sm:w-auto">
                Close
              </Button>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <Button size="md" variant="outline" onClick={() => handleExtendDemo(selectedLead.uuid)} className="w-full sm:w-auto justify-center">
                  Extend Demo (+3 Days)
                </Button>
                <Button size="md" style={{ backgroundColor: '#2563EB' }} className="text-white w-full sm:w-auto justify-center" onClick={() => handleConvert(selectedLead.uuid)}>
                  Convert to Paid Student
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* 7. EXTEND DEMO MODAL */}
      <Modal isOpen={extendModalOpen} onClose={() => setExtendModalOpen(false)} title="Extend Demo Access">
        <form onSubmit={submitExtendDemo} className="space-y-4 font-sans text-xs text-left">
          <p className="text-slate-600">Choose the number of additional days to extend demo access for this lead.</p>
          <div>
            <label className="block font-semibold text-slate-900 mb-1">Additional Extension Days</label>
            <select
              value={extraDays}
              onChange={(e) => setExtraDays(Number(e.target.value))}
              className="w-full h-11 rounded-xl border border-slate-200 px-3 bg-white text-xs font-semibold focus:outline-hidden"
            >
              <option value={3}>+3 Days Extension</option>
              <option value={5}>+5 Days Extension</option>
              <option value={7}>+7 Days Extension</option>
              <option value={14}>+14 Days Extension</option>
            </select>
          </div>
          <Button type="submit" size="md" style={{ backgroundColor: '#2563EB' }} className="w-full font-semibold text-white justify-center min-h-[44px]">
            Confirm Extension
          </Button>
        </form>
      </Modal>
    </div>
  );
};
