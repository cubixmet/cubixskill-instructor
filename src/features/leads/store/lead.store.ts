import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type LeadSource =
  | 'Demo Request'
  | 'Contact Form'
  | 'Course Inquiry'
  | 'Student Registration'
  | 'Pricing Inquiry';

export type LeadPipelineStatus =
  | 'New'
  | 'Contacted'
  | 'Demo Scheduled'
  | 'Qualified'
  | 'Converted'
  | 'Closed';

export interface LeadItem {
  uuid: string;
  fullName: string;
  email: string;
  countryCode: string;
  phone?: string;
  country?: string;
  source: LeadSource;
  courseTitle?: string;
  status: LeadPipelineStatus;
  createdAt: string;
  notes?: string;
}

interface LeadStoreState {
  leads: LeadItem[];
  addLead: (lead: Omit<LeadItem, 'uuid' | 'createdAt' | 'status'>) => void;
  updateLeadStatus: (uuid: string, status: LeadPipelineStatus) => void;
  updateLeadNotes: (uuid: string, notes: string) => void;
  exportLeadsCSV: () => void;
}

const INITIAL_LEADS: LeadItem[] = [
  {
    uuid: 'lead-pub-1',
    fullName: 'David Miller',
    email: 'david.miller@acme.com',
    countryCode: '+1',
    phone: '555-019-2831',
    country: 'United States',
    source: 'Demo Request',
    courseTitle: 'Full-Stack Web Development Bootcamp',
    status: 'Demo Scheduled',
    createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Interested in team onboarding for 10 engineers.',
  },
  {
    uuid: 'lead-pub-2',
    fullName: 'Elena Rostova',
    email: 'elena.rostova@designlab.io',
    countryCode: '+44',
    phone: '20-7946-0912',
    country: 'United Kingdom',
    source: 'Course Inquiry',
    courseTitle: 'UI/UX Design Masterclass 2026',
    status: 'New',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    notes: 'Asked about live mentor session availability.',
  },
  {
    uuid: 'lead-pub-3',
    fullName: 'Rajesh Kumar',
    email: 'rajesh.kumar@techglobal.in',
    countryCode: '+91',
    phone: '98765-12345',
    country: 'India',
    source: 'Student Registration',
    courseTitle: 'Full-Stack Web Development Bootcamp',
    status: 'Converted',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    notes: 'Completed student registration and token activation.',
  },
];

export const useLeadStore = create<LeadStoreState>()(
  persist(
    (set, get) => ({
      leads: INITIAL_LEADS,

      addLead: (input) => {
        const newLead: LeadItem = {
          uuid: `lead-${Date.now()}`,
          ...input,
          status: 'New',
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ leads: [newLead, ...state.leads] }));
      },

      updateLeadStatus: (uuid, status) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.uuid === uuid ? { ...l, status } : l)),
        }));
      },

      updateLeadNotes: (uuid, notes) => {
        set((state) => ({
          leads: state.leads.map((l) => (l.uuid === uuid ? { ...l, notes } : l)),
        }));
      },

      exportLeadsCSV: () => {
        const headers = 'Name,Email,Country Code,Phone,Country,Source,Course,Status,Created Date,Notes\n';
        const rows = get()
          .leads.map(
            (l) =>
              `"${l.fullName}","${l.email}","${l.countryCode}","${l.phone || ''}","${l.country || ''}","${
                l.source
              }","${l.courseTitle || ''}","${l.status}","${new Date(
                l.createdAt
              ).toLocaleDateString()}","${l.notes || ''}"`
          )
          .join('\n');

        const blob = new Blob([headers + rows], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Public_Website_Leads_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
      },
    }),
    {
      name: 'cubixskill_instructor_leads_store',
    }
  )
);
