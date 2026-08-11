import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Award,
  Plus,
  Eye,
  Edit3,
  Copy,
  Trash2,
  CheckCircle2,
  Search,
} from 'lucide-react';
import { useCertificateStore } from '../store/certificate.store';
import { useCourseStore } from '../../courses/store/course.store';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { EmptyState } from '../../../components/ui/EmptyState';

export const CertificateListPage: React.FC = () => {
  const navigate = useNavigate();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = courseUuid || courseId;

  const templates = useCertificateStore((state) => state.templates);
  const deleteTemplate = useCertificateStore((state) => state.deleteTemplate);
  const duplicateTemplate = useCertificateStore((state) => state.duplicateTemplate);
  const coursesByUuid = useCourseStore((state) => state.coursesByUuid);

  const activeCourse = activeCourseId ? coursesByUuid[activeCourseId] : undefined;

  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const filteredTemplates = useMemo(() => {
    let list = activeCourseId
      ? templates.filter((t) => t.courseUuid === activeCourseId || !t.courseUuid)
      : templates;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (coursesByUuid[t.courseUuid]?.title &&
            coursesByUuid[t.courseUuid].title.toLowerCase().includes(q))
      );
    }

    return list;
  }, [templates, activeCourseId, searchQuery, coursesByUuid]);

  const createUrl = activeCourseId
    ? `/courses/${activeCourseId}/certificates/new`
    : '/certificates/new';

  const handleDuplicate = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dup = duplicateTemplate(id);
    if (dup) {
      showToast(`Duplicated certificate template "${dup.title}"`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTargetId) return;
    deleteTemplate(deleteTargetId);
    setDeleteTargetId(null);
    showToast('Certificate template deleted');
  };

  const formatDate = (isoStr: string) => {
    if (!isoStr) return '—';
    return new Date(isoStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="space-y-6 font-sans text-left pb-16 w-full max-w-full overflow-hidden">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {activeCourse ? `${activeCourse.title} — Certificates` : 'Certificate Templates'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Design dynamic certificates, configure auto-issuance, and manage student completion downloads.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          leftIcon={<Plus className="w-4 h-4" />}
          onClick={() => navigate(createUrl)}
        >
          Create Certificate
        </Button>
      </div>

      {/* Search Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
        <div className="max-w-md">
          <Input
            placeholder="Search certificate or course..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            size="sm"
          />
        </div>
      </div>

      {/* Main List Grid */}
      {filteredTemplates.length === 0 ? (
        <EmptyState
          title="No certificate templates found"
          description={
            searchQuery
              ? 'No certificate templates matched your search query.'
              : 'Create your first course certificate template using the unified dynamic builder.'
          }
          actionLabel="Create Certificate"
          onAction={() => navigate(createUrl)}
          icon={<Award className="w-8 h-8 text-blue-600" />}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map((template) => {
            const courseTitle = coursesByUuid[template.courseUuid]?.title || 'All Courses';

            const detailUrl = activeCourseId
              ? `/courses/${activeCourseId}/certificates/${template.id}`
              : `/certificates/${template.id}`;

            const editUrl = activeCourseId
              ? `/courses/${activeCourseId}/certificates/${template.id}/edit`
              : `/certificates/${template.id}/edit`;

            return (
              <div
                key={template.id}
                onClick={() => navigate(detailUrl)}
                className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4 font-sans group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                    <span className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {template.title}
                    </span>
                    <Badge variant={template.status === 'Active' ? 'success' : 'neutral'} size="sm">
                      {template.status}
                    </Badge>
                  </div>

                  <div className="mt-3 space-y-1.5">
                    <div className="text-xs font-semibold text-slate-700 line-clamp-1">
                      {courseTitle}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-medium text-slate-500">
                      <span>Updated {formatDate(template.updatedAt)}</span>
                      <span>•</span>
                      <span>{template.elements?.length || 0} Elements</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-600">Auto-Issue on Completion</span>
                  <Badge variant={template.autoIssueOnCompletion !== false ? 'success' : 'neutral'} size="sm">
                    {template.autoIssueOnCompletion !== false ? 'ON' : 'OFF'}
                  </Badge>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100" onClick={(e) => e.stopPropagation()}>
                  <Link
                    to={detailUrl}
                    className="flex-1 inline-flex items-center justify-center min-h-[40px] px-3 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 mr-1.5" />
                    View
                  </Link>

                  <Link
                    to={editUrl}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Edit Certificate"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={(e) => handleDuplicate(template.id, e)}
                    className="p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                    title="Duplicate Template"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTargetId(template.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Delete Template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTargetId)}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Certificate Template"
        subtitle="Are you sure you want to delete this certificate template? Issued historical certificates will remain safely recorded."
      >
        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={() => setDeleteTargetId(null)}>
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
