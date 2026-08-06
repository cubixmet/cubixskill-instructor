import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
  Award,
  Plus,
  Eye,
  Download,
  CheckCircle2,
  Zap,
  Edit,
  Trash2,
  Copy,
  Archive,
  QrCode,
  Users,
  AlertTriangle,
  FileCheck,
  Search,
  Check,
  RotateCcw,
  Sliders,
  Sparkles,
  BarChart3,
  Layers,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { useCertificateStore } from '../../certificates/store/certificate.store';
import { CardFlowCertificateBuilderModal } from '../../certificates/components/CardFlowCertificateBuilderModal';
import type { CertificateTemplate, IssuedCertificate, AutoIssueConditions } from '../../../types/certificate.types';

export const CourseCertificatesPage: React.FC = () => {
  const { courseUuid = '550e8400-e29b-41d4-a716-446655440000' } = useParams<{ courseUuid?: string }>();

  // Store Selectors
  const templates = useCertificateStore((state) => state.templates);
  const issuedCertificates = useCertificateStore((state) => state.issuedCertificates);
  const deleteTemplate = useCertificateStore((state) => state.deleteTemplate);
  const duplicateTemplate = useCertificateStore((state) => state.duplicateTemplate);
  const setActiveTemplate = useCertificateStore((state) => state.setActiveTemplate);
  const updateAutoIssueConditions = useCertificateStore((state) => state.updateAutoIssueConditions);
  const revokeCertificate = useCertificateStore((state) => state.revokeCertificate);
  const reissueCertificate = useCertificateStore((state) => state.reissueCertificate);
  const bulkAutoGenerateForCourse = useCertificateStore((state) => state.bulkAutoGenerateForCourse);
  const incrementDownloadCount = useCertificateStore((state) => state.incrementDownloadCount);

  // Local UI State
  const [activeTab, setActiveTab] = useState<'templates' | 'issued' | 'conditions' | 'analytics'>('templates');
  const [searchQuery, setSearchQuery] = useState('');
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CertificateTemplate | null>(null);
  const [isAutoGenModalOpen, setIsAutoGenModalOpen] = useState(false);
  const [isConditionsModalOpen, setIsConditionsModalOpen] = useState(false);

  const courseTemplates = useMemo(
    () => templates.filter((t) => t.courseUuid === courseUuid || !t.courseUuid),
    [templates, courseUuid]
  );

  const courseIssued = useMemo(
    () => issuedCertificates.filter((c) => c.courseUuid === courseUuid || !c.courseUuid),
    [issuedCertificates, courseUuid]
  );

  const activeTemplate = courseTemplates.find((t) => t.status === 'Active') || courseTemplates[0];

  const filteredIssued = courseIssued.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Auto Issue Conditions
  const conditions = activeTemplate?.autoIssueConditions || {
    requireCourseCompletion: true,
    requireAllLessons: true,
    requireQuizPassed: true,
    requireAssignmentsApproved: true,
    minPassingPercentage: 75,
    requireFinalExam: false,
    requireManualApproval: false,
  };

  const handleRunAutoGenerate = () => {
    if (activeTemplate) {
      const eligibleStudents = [
        { uuid: 'std-201', name: 'Aarav Patel', email: 'aarav.patel@example.com' },
        { uuid: 'std-202', name: 'Sophia Lin', email: 'sophia.lin@example.com' },
        { uuid: 'std-203', name: 'Marcus Vance', email: 'marcus.vance@example.com' },
        { uuid: 'std-204', name: 'Elena Rostova', email: 'elena.rostova@example.com' },
      ];
      bulkAutoGenerateForCourse(activeTemplate.id, courseUuid, eligibleStudents);
      setIsAutoGenModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 font-sans text-left bg-[#F8FAFC]">
      {/* 1. AUTOMATED CERTIFICATE SYSTEM HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-[#E2E8F0] rounded-[16px] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
              Enterprise Certificate System
            </h1>
            <Badge variant="success" size="sm">
              Fully Automated Workflow
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-normal">
            Certificates are automatically generated and delivered upon satisfying course completion rules.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsConditionsModalOpen(true)}
            leftIcon={<Settings className="w-4 h-4 text-[#2563EB]" />}
            className="h-11 px-4 text-xs font-semibold"
          >
            Auto-Issue Rules
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => {
              setEditingTemplate(null);
              setIsBuilderOpen(true);
            }}
            leftIcon={<Plus className="w-4 h-4 text-white stroke-[3]" />}
            className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[12px]"
          >
            Create Template
          </Button>
        </div>
      </div>

      {/* INSTRUCTOR STORAGE CREDIT WARNING BANNER */}
      <div className="p-4 bg-blue-50/80 border border-blue-200 rounded-[14px] flex items-center justify-between gap-3 text-xs text-[#0F172A]">
        <div className="flex items-center gap-2.5">
          <Zap className="w-5 h-5 text-[#2563EB] shrink-0" />
          <div>
            <strong className="font-semibold text-[#2563EB] block">Instructor Storage Credit Notice:</strong>
            <span className="text-[#64748B]">
              PDF Generation consumes 1 Storage Credit per generated certificate PDF upon automatic course completion.
            </span>
          </div>
        </div>
        <Badge variant="outline" size="sm" className="border-blue-300 text-[#2563EB] shrink-0 hidden sm:inline-flex">
          Instructor Only Notice
        </Badge>
      </div>

      {/* 2. SUMMARY METRICS CARDS (5 CARDS) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Active Template</span>
            <Award className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-sm font-semibold text-[#0F172A] truncate block">
            {activeTemplate?.title || 'None Active'}
          </strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Total Generated</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl font-bold text-emerald-600">{courseIssued.length}</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">Eligible Students</span>
            <Users className="w-4 h-4 text-amber-600" />
          </div>
          <strong className="text-2xl font-bold text-amber-600">4</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">PDF Downloads</span>
            <Download className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl font-bold text-[#2563EB]">22</strong>
        </Card>

        <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
          <div className="flex items-center justify-between text-[#64748B] mb-2">
            <span className="text-xs font-medium">QR Scans Verified</span>
            <QrCode className="w-4 h-4 text-[#2563EB]" />
          </div>
          <strong className="text-2xl font-bold text-[#0F172A]">47</strong>
        </Card>
      </div>

      {/* 3. WORKSPACE TABS */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar w-full sm:w-auto">
          {(['templates', 'issued', 'conditions', 'analytics'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                activeTab === tab ? 'bg-[#2563EB] text-white shadow-2xs' : 'bg-slate-100 text-[#64748B]'
              }`}
            >
              {tab === 'templates'
                ? `Templates (${courseTemplates.length})`
                : tab === 'issued'
                ? `Issued Certificates (${courseIssued.length})`
                : tab === 'conditions'
                ? 'Auto-Issue Rules'
                : 'Analytics & Verification'}
            </button>
          ))}
        </div>

        {activeTab === 'issued' && (
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student or cert #..."
              className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-normal text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
            />
          </div>
        )}
      </div>

      {/* 4. TEMPLATES TAB */}
      {activeTab === 'templates' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between bg-white p-4 border border-[#E2E8F0] rounded-xl text-xs">
            <span className="text-[#64748B]">Active Template for this course:</span>
            <div className="flex items-center gap-2">
              <strong className="text-[#0F172A] font-semibold">{activeTemplate?.title}</strong>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsAutoGenModalOpen(true)}
                className="h-8 text-[11px] font-semibold border-amber-300 text-amber-900 bg-amber-50"
              >
                Auto-Generate for 4 Eligible Students
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {courseTemplates.map((template) => {
              const isActive = template.status === 'Active';

              return (
                <Card key={template.id} padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] space-y-4 shadow-2xs">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant={isActive ? 'success' : 'secondary'} size="sm">
                          {template.status}
                        </Badge>
                        <Badge variant="outline" size="sm" className="border-blue-200 text-[#2563EB]">
                          v{template.version || 1}.0 CardFlow
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-sm text-[#0F172A]">{template.title}</h3>
                      <p className="text-xs text-[#64748B] line-clamp-2">{template.description}</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs space-y-1">
                    <div className="flex justify-between text-[#64748B]">
                      <span>Auto-Issue Rule:</span>
                      <strong className="text-[#2563EB] font-bold uppercase">{template.autoIssueRule.replace('_', ' ')}</strong>
                    </div>
                    <div className="flex justify-between text-[#64748B]">
                      <span>Certificates Generated:</span>
                      <strong className="text-[#0F172A] font-semibold">{template.issuedCount}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-[#E2E8F0]">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingTemplate(template);
                          setIsBuilderOpen(true);
                        }}
                        className="h-8 text-xs font-semibold"
                      >
                        Open CardFlow Builder
                      </Button>
                      {!isActive && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveTemplate(courseUuid, template.id)}
                          className="h-8 text-xs font-semibold text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                        >
                          Apply to Course
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => duplicateTemplate(template.id)}
                        className="h-8 text-xs px-2"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => deleteTemplate(template.id)}
                        className="h-8 text-xs text-rose-600 border-rose-200 hover:bg-rose-50 px-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. ISSUED CERTIFICATES TAB */}
      {activeTab === 'issued' && (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Certificate #</th>
                  <th className="py-3.5 px-4">Student</th>
                  <th className="py-3.5 px-4">Issue Date</th>
                  <th className="py-3.5 px-4">Version</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {filteredIssued.map((cert) => (
                  <tr key={cert.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-4 font-mono font-bold text-[#2563EB]">
                      {cert.id}
                    </td>
                    <td className="py-4 px-4">
                      <strong className="text-xs font-semibold text-[#0F172A] block">{cert.studentName}</strong>
                      <span className="text-[11px] text-[#64748B]">{cert.studentEmail}</span>
                    </td>
                    <td className="py-4 px-4 text-[#0F172A] font-medium">
                      {new Date(cert.issuedAt).toLocaleDateString()}
                    </td>
                    <td className="py-4 px-4 font-semibold text-[#64748B]">
                      v{cert.templateVersion || 1}.0
                    </td>
                    <td className="py-4 px-4">
                      <Badge variant={cert.status === 'issued' ? 'success' : 'secondary'} size="sm">
                        {cert.status.toUpperCase()}
                      </Badge>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            incrementDownloadCount(cert.id);
                            alert(`Downloading PDF for ${cert.studentName}...`);
                          }}
                          className="h-8 text-[11px] px-3 font-semibold"
                        >
                          Download PDF
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(cert.qrVerificationUrl, '_blank')}
                          className="h-8 text-[11px] px-3 font-semibold"
                        >
                          Verify QR
                        </Button>
                        {cert.status === 'issued' ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => revokeCertificate(cert.id)}
                            className="h-8 text-[11px] text-rose-600 border-rose-200 hover:bg-rose-50"
                          >
                            Revoke
                          </Button>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => reissueCertificate(cert.id)}
                            className="h-8 text-[11px] text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                          >
                            Re-issue
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. AUTO-ISSUE CONDITIONS TAB */}
      {activeTab === 'conditions' && (
        <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-6 space-y-4 shadow-2xs text-xs">
          <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">Auto-Issue Rules &amp; Completion Conditions</h3>
          <div className="space-y-3">
            <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer">
              <span className="font-semibold text-[#0F172A]">Course Completion Required (100%)</span>
              <input
                type="checkbox"
                checked={conditions.requireCourseCompletion}
                onChange={(e) =>
                  updateAutoIssueConditions(activeTemplate.id, { requireCourseCompletion: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer">
              <span className="font-semibold text-[#0F172A]">All Curriculum Lessons Completed</span>
              <input
                type="checkbox"
                checked={conditions.requireAllLessons}
                onChange={(e) =>
                  updateAutoIssueConditions(activeTemplate.id, { requireAllLessons: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer">
              <span className="font-semibold text-[#0F172A]">Required Assessment Quiz Passed ({conditions.minPassingPercentage}% Threshold)</span>
              <input
                type="checkbox"
                checked={conditions.requireQuizPassed}
                onChange={(e) =>
                  updateAutoIssueConditions(activeTemplate.id, { requireQuizPassed: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>

            <label className="flex items-center justify-between p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl cursor-pointer">
              <span className="font-semibold text-[#0F172A]">Course Assignments Approved</span>
              <input
                type="checkbox"
                checked={conditions.requireAssignmentsApproved}
                onChange={(e) =>
                  updateAutoIssueConditions(activeTemplate.id, { requireAssignmentsApproved: e.target.checked })
                }
                className="w-4 h-4 rounded text-[#2563EB]"
              />
            </label>
          </div>
        </div>
      )}

      {/* CARDFLOW BUILDER MODAL */}
      <CardFlowCertificateBuilderModal
        isOpen={isBuilderOpen}
        onClose={() => setIsBuilderOpen(false)}
        initialTemplate={editingTemplate}
        courseUuid={courseUuid}
        onSave={() => {}}
      />

      {/* BULK AUTO GENERATION MODAL */}
      <Modal
        isOpen={isAutoGenModalOpen}
        onClose={() => setIsAutoGenModalOpen(false)}
        title="Auto-Generate Certificates for Completed Students"
        subtitle="The LMS detected 4 eligible students who have satisfied all course completion rules."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
            <strong className="text-xs font-semibold text-emerald-900 block">
              Automated Generation Ready
            </strong>
            <p className="text-[11px] text-emerald-800">
              Each student will automatically receive a personalized PDF certificate with QR code verification and student dashboard delivery.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsAutoGenModalOpen(false)} className="h-10 text-xs font-semibold">
              Later
            </Button>
            <Button onClick={handleRunAutoGenerate} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
              Generate Now
            </Button>
          </div>
        </div>
      </Modal>

      {/* AUTO ISSUE CONDITIONS MODAL */}
      <Modal
        isOpen={isConditionsModalOpen}
        onClose={() => setIsConditionsModalOpen(false)}
        title="Configure Auto-Issue Rules"
        subtitle="Set the mandatory completion conditions required before the LMS automatically generates a certificate."
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-[#F8FAFC] border rounded-xl space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-[#0F172A]">Require 100% Course Completion</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#2563EB]" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-[#0F172A]">Require Passing Score on Final Exam</span>
              <input type="checkbox" defaultChecked className="w-4 h-4 rounded text-[#2563EB]" />
            </label>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button onClick={() => setIsConditionsModalOpen(false)} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
              Save Rules
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
