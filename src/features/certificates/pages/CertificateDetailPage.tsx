import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Download,
  Trash2,
  CheckCircle2,
  Eye,
} from 'lucide-react';
import { useCertificateStore } from '../store/certificate.store';
import { useCourseStore } from '../../courses/store/course.store';
import { CertificateCanvas } from '../components/CertificateCanvas';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { ErrorState } from '../../../components/ui/ErrorState';
import { downloadCertificateAsImage } from '../utils/certificateExport';

export const CertificateDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { certificateId, courseUuid, courseId } = useParams<{
    certificateId?: string;
    courseUuid?: string;
    courseId?: string;
  }>();

  const activeCourseIdContext = courseUuid || courseId;

  const templates = useCertificateStore((state) => state.templates);
  const deleteTemplate = useCertificateStore((state) => state.deleteTemplate);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const template = templates.find((t) => t.id === certificateId);
  const course = template ? coursesByUuid[template.courseUuid] : undefined;

  const [isStudentPreviewOpen, setIsStudentPreviewOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState({
    name: 'Rahul Kumar',
    studentId: 'STD-2026-8841',
    email: 'rahul.kumar@example.com',
    overallPercentage: 87,
    grade: 'A+',
  });

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const backUrl = activeCourseIdContext
    ? `/courses/${activeCourseIdContext}/certificates`
    : '/certificates';

  const editUrl = activeCourseIdContext
    ? `/courses/${activeCourseIdContext}/certificates/${certificateId}/edit`
    : `/certificates/${certificateId}/edit`;

  if (!template) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 font-sans">
        <ErrorState
          title="Certificate Template Not Found"
          message="The requested certificate template does not exist or may have been deleted."
          actionText="Back to Certificates"
          onRetry={() => navigate(backUrl)}
        />
      </div>
    );
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await downloadCertificateAsImage(template, selectedStudent.name, {
        name: selectedStudent.name,
        studentId: selectedStudent.studentId,
        email: selectedStudent.email,
        courseName: course?.title || 'Fullstack React 19 & TypeScript Masterclass',
        completionDate: new Date().toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric',
          year: 'numeric',
        }),
        instructorName: course?.instructorName || 'Dr. Rajesh Varma',
        overallPercentage: selectedStudent.overallPercentage,
        grade: selectedStudent.grade,
        certificateNumber: 'CERT-2026-8841',
      });
      showToast('Certificate PNG downloaded successfully');
    } catch (_err) {
      showToast('Unable to export certificate image');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDeleteConfirm = () => {
    deleteTemplate(template.id);
    setIsDeleteModalOpen(false);
    navigate(backUrl);
  };

  const dynamicFieldsCount = template.elements.filter(
    (el) => el.type === 'dynamic_field' || Boolean(el.placeholderKey)
  ).length;

  return (
    <div className="space-y-6 font-sans text-left pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Navigation & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate(backUrl)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Certificates
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Eye className="w-4 h-4" />}
            onClick={() => setIsStudentPreviewOpen(true)}
          >
            Preview as Student
          </Button>

          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => navigate(editUrl)}
          >
            Edit Certificate
          </Button>

          <Button
            variant="primary"
            size="sm"
            isLoading={isDownloading}
            loadingText="Generating PDF..."
            leftIcon={<Download className="w-4 h-4" />}
            onClick={handleDownload}
          >
            Download Sample
          </Button>

          <Button
            variant="danger"
            size="sm"
            leftIcon={<Trash2 className="w-4 h-4" />}
            onClick={() => setIsDeleteModalOpen(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      {/* Main Preview Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                {template.title}
              </h1>
              <Badge variant={template.status === 'Active' ? 'success' : 'neutral'} size="sm">
                {template.status}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Course: <span className="font-semibold text-slate-800">{course?.title || 'Selected Course'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200/80">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Issued Count</span>
              <span className="text-slate-900 font-extrabold">{template.issuedCount || 0} Certificates</span>
            </div>
          </div>
        </div>

        {/* Scaled Canvas Preview */}
        <div className="bg-slate-900/90 p-3 sm:p-6 rounded-2xl border border-slate-800 shadow-xl overflow-hidden">
          <CertificateCanvas
            elements={template.elements}
            backgroundUrl={template.backgroundUrl}
            backgroundColor={template.backgroundColor}
            isEditorMode={false}
            studentPreviewContext={{
              name: selectedStudent.name,
              studentId: selectedStudent.studentId,
              email: selectedStudent.email,
              courseName: course?.title || 'Fullstack React 19 & TypeScript Masterclass',
              completionDate: 'August 11, 2026',
              instructorName: course?.instructorName || 'Dr. Rajesh Varma',
              overallPercentage: selectedStudent.overallPercentage,
              grade: selectedStudent.grade,
              certificateNumber: 'CERT-2026-8841',
            }}
          />
        </div>
      </div>

      {/* Specifications & Automation Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Template Specifications
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Dynamic Fields</span>
              <span className="font-bold text-slate-900">{dynamicFieldsCount} Fields</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Canvas Aspect Ratio</span>
              <span className="font-semibold text-slate-800">16:9 Standard A4 Landscape</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Coordinate System</span>
              <span className="font-semibold text-emerald-600">Normalized Relative (%)</span>
            </div>
            <div className="py-2.5 flex justify-between">
              <span className="text-slate-500 font-medium">Text Auto-Fit</span>
              <span className="font-semibold text-emerald-600">Active (Container Ceiling)</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5">
            Automation & Delivery Settings
          </h2>
          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Auto-Issue on Course Completion</span>
              <Badge variant={template.autoIssueOnCompletion ? 'success' : 'neutral'} size="sm">
                {template.autoIssueOnCompletion ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Allow Student Download</span>
              <Badge variant={template.allowStudentDownload ? 'info' : 'neutral'} size="sm">
                {template.allowStudentDownload ? 'ON' : 'OFF'}
              </Badge>
            </div>
            <div className="py-2.5 flex justify-between items-center">
              <span className="text-slate-500 font-medium">Default Management Behavior</span>
              <span className="font-semibold text-slate-800">Instructor Admin Download</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview As Student Modal */}
      <Modal
        isOpen={isStudentPreviewOpen}
        onClose={() => setIsStudentPreviewOpen(false)}
        title="Preview Certificate as Student"
        subtitle="Select an enrolled student to verify real dynamic data field resolution and long name fit."
      >
        <div className="space-y-4 font-sans text-left py-2">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Select Enrolled Student</label>
            <div className="space-y-2">
              {[
                { name: 'Rahul Kumar', studentId: 'STD-2026-8841', email: 'rahul.kumar@example.com', overallPercentage: 87, grade: 'A+' },
                { name: 'Muhammed Abdul Rahman Kizhakkethil', studentId: 'STD-2026-9902', email: 'muhammed.k@example.com', overallPercentage: 96, grade: 'A+' },
                { name: 'Sophia Lin', studentId: 'STD-2026-1042', email: 'sophia.lin@example.com', overallPercentage: 79, grade: 'B+' },
              ].map((std) => (
                <button
                  key={std.studentId}
                  type="button"
                  onClick={() => {
                    setSelectedStudent(std);
                    setIsStudentPreviewOpen(false);
                    showToast(`Switched preview student to "${std.name}"`);
                  }}
                  className={`w-full p-3 rounded-xl border text-left flex items-center justify-between cursor-pointer ${
                    selectedStudent.studentId === std.studentId
                      ? 'border-blue-600 bg-blue-50/70 font-bold'
                      : 'border-slate-200 bg-white hover:bg-slate-50 font-medium'
                  }`}
                >
                  <div>
                    <div className="text-xs text-slate-900">{std.name}</div>
                    <div className="text-[11px] text-slate-500">{std.email}</div>
                  </div>
                  <Badge variant="primary" size="sm">{std.overallPercentage}%</Badge>
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Certificate Template"
        subtitle={`Are you sure you want to delete "${template.title}"? Issued certificates will remain safely recorded.`}
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
            Delete Template
          </Button>
        </div>
      </Modal>
    </div>
  );
};
