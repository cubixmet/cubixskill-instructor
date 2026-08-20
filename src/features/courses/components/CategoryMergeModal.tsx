import React, { useState, useEffect, useCallback } from "react";
import { GitMerge, AlertTriangle, Check, Loader2, History } from "lucide-react";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { coursesService } from "../../../services/courses.service";
import type { CourseCategory } from "../types/course.types";

interface CategoryMergeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const CategoryMergeModal: React.FC<CategoryMergeModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [sourceId, setSourceId] = useState("");
  const [targetId, setTargetId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [audits, setAudits] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    try {
      const list = await coursesService.listCategories();
      setCategories(list);
      const auditList = await coursesService.listMergeAudits();
      setAudits(auditList);
    } catch (err: any) {
      setErrorMsg("Failed to load category list for merge");
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadData();
      setSourceId("");
      setTargetId("");
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, loadData]);

  const handleMerge = async () => {
    if (!sourceId || !targetId) {
      setErrorMsg("Please select both source and target categories.");
      return;
    }
    if (sourceId === targetId) {
      setErrorMsg("Source and Target categories cannot be identical.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await coursesService.mergeCategories(sourceId, targetId);
      setSuccessMsg(res.message);
      loadData();
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.message || err?.message || "Failed to merge categories.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Admin Category Merge Tool">
      <div className="space-y-5 text-xs font-sans text-left">
        <p className="text-slate-500">
          Merge duplicate or similar categories. Reassigns all associated courses, creates a search alias, and records an audit trail.
        </p>

        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 font-bold flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 font-bold flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">Source Category (To Delete)</label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="">-- Select Source Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === targetId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-slate-700 font-bold block">Target Canonical Category</label>
            <select
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:outline-hidden"
            >
              <option value="">-- Select Target Category --</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id} disabled={c.id === sourceId}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Audit Log Preview */}
        {audits.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 font-bold text-slate-700">
              <History className="w-4 h-4 text-blue-600" />
              <span>Recent Category Merges (Audit Trail)</span>
            </div>
            <div className="max-h-36 overflow-y-auto space-y-1.5 no-scrollbar bg-slate-50 p-2 rounded-xl border border-slate-200">
              {audits.map((a) => (
                <div key={a.id} className="p-2 bg-white rounded-lg border border-slate-100 flex items-center justify-between text-[11px]">
                  <div>
                    <span className="font-bold text-slate-900">&quot;{a.source_category_name}&quot;</span>
                    <span className="text-slate-400"> → </span>
                    <span className="font-bold text-blue-600">&quot;{a.target_category?.name || "Canonical"}&quot;</span>
                    <span className="text-slate-500 font-medium text-[10px] block">
                      Reassigned {a.courses_reassigned_count} courses • Merged by {a.merged_by_name || "Admin"}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {new Date(a.merged_at).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button
            size="sm"
            disabled={isSubmitting || !sourceId || !targetId}
            onClick={handleMerge}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
            leftIcon={isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <GitMerge className="w-4 h-4" />}
          >
            {isSubmitting ? "Merging..." : "Execute Category Merge"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
