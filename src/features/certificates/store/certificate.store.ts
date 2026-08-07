import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  CertificateTemplate,
  IssuedCertificate,
  CertificateStatus,
  AutoIssueConditions,
  DEFAULT_AUTO_ISSUE_CONDITIONS,
  mapAutoIssueConditions,
} from '../../../types/certificate.types';

interface CertificateState {
  templates: CertificateTemplate[];
  issuedCertificates: IssuedCertificate[];

  // Template Actions
  addTemplate: (data: Omit<CertificateTemplate, 'id' | 'createdAt' | 'updatedAt' | 'issuedCount' | 'version'>) => CertificateTemplate;
  updateTemplate: (id: string, data: Partial<CertificateTemplate>, versioningStrategy?: 'keep_existing' | 'future_only' | 'regenerate_all') => void;
  deleteTemplate: (id: string) => void;
  duplicateTemplate: (id: string) => CertificateTemplate | null;
  setActiveTemplate: (courseUuid: string, templateId: string) => void;
  updateAutoIssueConditions: (templateId: string, conditions: Partial<AutoIssueConditions>) => void;
  getTemplatesByCourse: (courseUuid: string) => CertificateTemplate[];

  // Issued Actions
  issueCertificate: (data: Omit<IssuedCertificate, 'id' | 'issuedAt' | 'status' | 'qrVerificationUrl' | 'downloadCount' | 'verificationScanCount' | 'templateVersion'>) => IssuedCertificate;
  bulkAutoGenerateForCourse: (templateId: string, courseUuid: string, eligibleStudents: { uuid: string; name: string; email: string }[]) => number;
  revokeCertificate: (certificateId: string) => void;
  reissueCertificate: (certificateId: string) => void;
  incrementDownloadCount: (certificateId: string) => void;
  incrementVerificationCount: (certificateId: string) => void;
  getIssuedByCourse: (courseUuid: string) => IssuedCertificate[];
}

const SEED_TEMPLATES: CertificateTemplate[] = [
  {
    id: 'cert-tmpl-101',
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Official Fullstack Excellence Certificate',
    description: 'Gold-embossed academy certificate of achievement with QR code verification.',
    type: 'custom_builder',
    status: 'Active',
    autoIssueRule: 'course_completion',
    autoIssueConditions: DEFAULT_AUTO_ISSUE_CONDITIONS,
    version: 1,
    canvasSize: 'a4_landscape',
    backgroundColor: '#FFFFFF',
    elements: [
      {
        id: 'el-1',
        type: 'placeholder',
        label: 'Academy Name',
        placeholderKey: '{{academy_name}}',
        text: 'CUBIXSKILL ACADEMY OF TECHNOLOGY',
        x: 50,
        y: 15,
        width: 80,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: '800',
        fontColor: '#2563EB',
        textAlign: 'center',
        opacity: 1,
        isLocked: true,
      },
      {
        id: 'el-2',
        type: 'text',
        label: 'Title Banner',
        text: 'CERTIFICATE OF COMPLETION',
        x: 50,
        y: 26,
        width: 80,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 32,
        fontWeight: '800',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: true,
      },
      {
        id: 'el-3',
        type: 'text',
        label: 'Presented To Subtitle',
        text: 'THIS IS PROUDLY PRESENTED TO',
        x: 50,
        y: 38,
        width: 60,
        height: 6,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '600',
        fontColor: '#64748B',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-4',
        type: 'placeholder',
        label: 'Student Name',
        placeholderKey: '{{student_name}}',
        text: 'Aarav Patel',
        x: 50,
        y: 48,
        width: 80,
        height: 12,
        fontFamily: 'Inter',
        fontSize: 36,
        fontWeight: '800',
        fontColor: '#2563EB',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-5',
        type: 'placeholder',
        label: 'Course Name',
        placeholderKey: '{{course_name}}',
        text: 'React 19 & Fullstack Architecture Masterclass',
        x: 50,
        y: 62,
        width: 85,
        height: 10,
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: '600',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-6',
        type: 'placeholder',
        label: 'Issue Date',
        placeholderKey: '{{issue_date}}',
        text: 'Issued on August 5, 2026',
        x: 25,
        y: 82,
        width: 35,
        height: 8,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '500',
        fontColor: '#64748B',
        textAlign: 'left',
        opacity: 1,
        isLocked: false,
      },
      {
        id: 'el-7',
        type: 'qr_code',
        label: 'QR Code Verification',
        placeholderKey: '{{qr_code}}',
        text: 'https://cubixskill.com/verify/CERT-2026-8841',
        x: 82,
        y: 80,
        width: 14,
        height: 14,
        fontFamily: 'Inter',
        fontSize: 12,
        fontWeight: '400',
        fontColor: '#0F172A',
        textAlign: 'center',
        opacity: 1,
        isLocked: false,
      },
    ],
    issuedCount: 32,
    createdAt: '2026-08-01T10:00:00Z',
    updatedAt: '2026-08-05T12:00:00Z',
  },
];

const SEED_ISSUED: IssuedCertificate[] = [
  {
    id: 'CERT-2026-8841',
    templateId: 'cert-tmpl-101',
    templateVersion: 1,
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'std-201',
    studentName: 'Aarav Patel',
    studentEmail: 'aarav.patel@example.com',
    issuedAt: '2026-08-04T16:20:00Z',
    completionDate: '2026-08-04',
    status: 'issued',
    qrVerificationUrl: 'http://localhost:5173/verify/certificate/CERT-2026-8841',
    downloadCount: 14,
    verificationScanCount: 28,
  },
  {
    id: 'CERT-2026-8842',
    templateId: 'cert-tmpl-101',
    templateVersion: 1,
    courseUuid: '550e8400-e29b-41d4-a716-446655440000',
    studentUuid: 'std-202',
    studentName: 'Sophia Lin',
    studentEmail: 'sophia.lin@example.com',
    issuedAt: '2026-08-05T09:15:00Z',
    completionDate: '2026-08-05',
    status: 'issued',
    qrVerificationUrl: 'http://localhost:5173/verify/certificate/CERT-2026-8842',
    downloadCount: 8,
    verificationScanCount: 19,
  },
];

export const useCertificateStore = create<CertificateState>()(
  persist(
    (set, get) => ({
      templates: SEED_TEMPLATES,
      issuedCertificates: SEED_ISSUED,

      // TEMPLATE ACTIONS
      addTemplate: (data) => {
        const newTemplate: CertificateTemplate = {
          ...data,
          id: `cert-tmpl-${Date.now()}`,
          version: 1,
          autoIssueConditions: mapAutoIssueConditions(data.autoIssueConditions),
          issuedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({ templates: [newTemplate, ...state.templates] }));
        return newTemplate;
      },

      updateTemplate: (id, data, versioningStrategy = 'future_only') => {
        set((state) => {
          const currentTmpl = state.templates.find((t) => t.id === id);
          const newVersion = (currentTmpl?.version || 1) + (versioningStrategy !== 'keep_existing' ? 1 : 0);

          const updatedTemplates = state.templates.map((t) =>
            t.id === id
              ? {
                  ...t,
                  ...data,
                  version: newVersion,
                  updatedAt: new Date().toISOString(),
                }
              : t
          );

          let updatedIssued = state.issuedCertificates;
          if (versioningStrategy === 'regenerate_all') {
            updatedIssued = updatedIssued.map((c) =>
              c.templateId === id ? { ...c, templateVersion: newVersion, issuedAt: new Date().toISOString() } : c
            );
          }

          return {
            templates: updatedTemplates,
            issuedCertificates: updatedIssued,
          };
        });
      },

      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      duplicateTemplate: (id) => {
        const source = get().templates.find((t) => t.id === id);
        if (!source) return null;

        const newId = `cert-tmpl-${Date.now()}`;
        const duplicated: CertificateTemplate = {
          ...source,
          id: newId,
          title: `${source.title} (Copy)`,
          status: 'Draft',
          version: 1,
          issuedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({ templates: [duplicated, ...state.templates] }));
        return duplicated;
      },

      setActiveTemplate: (courseUuid, templateId) => {
        set((state) => ({
          templates: state.templates.map((t) => {
            if (t.courseUuid !== courseUuid) return t;
            return {
              ...t,
              status: t.id === templateId ? ('Active' as CertificateStatus) : ('Draft' as CertificateStatus),
            };
          }),
        }));
      },

      updateAutoIssueConditions: (templateId, conditions) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === templateId
              ? {
                  ...t,
                  autoIssueConditions: { ...t.autoIssueConditions, ...conditions },
                  updatedAt: new Date().toISOString(),
                }
              : t
          ),
        }));
      },

      getTemplatesByCourse: (courseUuid) => {
        return get().templates.filter((t) => t.courseUuid === courseUuid);
      },

      // ISSUED ACTIONS
      issueCertificate: (data) => {
        const certNumber = `CERT-2026-${Math.floor(1000 + Math.random() * 9000)}`;
        const tmpl = get().templates.find((t) => t.id === data.templateId);

        const newIssued: IssuedCertificate = {
          ...data,
          id: certNumber,
          templateVersion: tmpl?.version || 1,
          issuedAt: new Date().toISOString(),
          status: 'issued',
          qrVerificationUrl: `http://localhost:5173/verify/certificate/${certNumber}`,
          downloadCount: 0,
          verificationScanCount: 0,
        };

        set((state) => {
          const updatedTemplates = state.templates.map((t) =>
            t.id === data.templateId ? { ...t, issuedCount: (t.issuedCount || 0) + 1 } : t
          );
          return {
            issuedCertificates: [newIssued, ...state.issuedCertificates],
            templates: updatedTemplates,
          };
        });

        return newIssued;
      },

      bulkAutoGenerateForCourse: (templateId, courseUuid, eligibleStudents) => {
        let count = 0;
        eligibleStudents.forEach((st) => {
          get().issueCertificate({
            templateId,
            courseUuid,
            studentUuid: st.uuid,
            studentName: st.name,
            studentEmail: st.email,
            completionDate: new Date().toISOString().split('T')[0],
          });
          count++;
        });
        return count;
      },

      revokeCertificate: (certificateId) => {
        set((state) => ({
          issuedCertificates: state.issuedCertificates.map((c) =>
            c.id === certificateId ? { ...c, status: 'revoked' } : c
          ),
        }));
      },

      reissueCertificate: (certificateId) => {
        set((state) => ({
          issuedCertificates: state.issuedCertificates.map((c) =>
            c.id === certificateId ? { ...c, status: 'issued', issuedAt: new Date().toISOString() } : c
          ),
        }));
      },

      incrementDownloadCount: (certificateId) => {
        set((state) => ({
          issuedCertificates: state.issuedCertificates.map((c) =>
            c.id === certificateId ? { ...c, downloadCount: (c.downloadCount || 0) + 1 } : c
          ),
        }));
      },

      incrementVerificationCount: (certificateId) => {
        set((state) => ({
          issuedCertificates: state.issuedCertificates.map((c) =>
            c.id === certificateId ? { ...c, verificationScanCount: (c.verificationScanCount || 0) + 1 } : c
          ),
        }));
      },

      getIssuedByCourse: (courseUuid) => {
        return get().issuedCertificates.filter((c) => c.courseUuid === courseUuid);
      },
    }),
    {
      name: 'cubixskill-certificate-store',
    }
  )
);
