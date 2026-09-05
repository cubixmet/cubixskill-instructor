import React, { useState } from 'react';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { certificatesService } from '../../../services/certificates.service';

interface PersonalFieldsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFieldCreated: (field: { key: string; label: string; field_type: string }) => void;
}

export const PersonalFieldsModal: React.FC<PersonalFieldsModalProps> = ({
  isOpen,
  onClose,
  onFieldCreated,
}) => {
  const [label, setLabel] = useState('');
  const [key, setKey] = useState('');
  const [fieldType, setFieldType] = useState('text');
  const [isRequired, setIsRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLabelChange = (val: string) => {
    setLabel(val);
    const sanitizedKey = val.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
    setKey(sanitizedKey);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!label.trim() || !key.trim()) {
      setError('Field label is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const created = await certificatesService.createCustomField({
        key,
        label: label.trim(),
        field_type: fieldType.toUpperCase(),
        available_for_certificate: true,
        required: isRequired,
      });

      onFieldCreated({
        key: created.key || key,
        label: created.label || label.trim(),
        field_type: fieldType,
      });

      setLabel('');
      setKey('');
      setError(null);
      onClose();
    } catch (err: any) {
      const respData = err?.response?.data;
      const errorMsg =
        respData?.detail ||
        respData?.message ||
        respData?.key?.[0] ||
        respData?.label?.[0] ||
        (typeof respData === 'object' ? Object.values(respData).flat().join(' ') : null) ||
        err?.message ||
        'Unable to add personal detail field.';
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Personal Detail Field">
      <form onSubmit={handleSubmit} className="space-y-4 text-left font-sans text-xs">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-200 dark:border-rose-800 font-medium">
            {error}
          </div>
        )}

        <div>
          <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-semibold mb-1">
            Field Label *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => handleLabelChange(e.target.value)}
            placeholder="e.g. Father Name, Registration Number, Batch"
            className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div>
          <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-semibold mb-1">
            Canonical Key
          </label>
          <input
            type="text"
            value={key}
            readOnly
            className="w-full h-9 px-3 bg-slate-100 dark:bg-[#172033] border border-slate-200 dark:border-[#263244] rounded-xl text-xs font-mono text-slate-600 dark:text-slate-400"
          />
        </div>

        <div>
          <label className="block text-[#0F172A] dark:text-[#F8FAFC] font-semibold mb-1">
            Data Type
          </label>
          <select
            value={fieldType}
            onChange={(e) => setFieldType(e.target.value)}
            className="w-full h-9 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs focus:outline-none focus:border-[#2563EB]"
          >
            <option value="text">Text (Single Line)</option>
            <option value="multiline_text">Multiline Text</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
          </select>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <input
            type="checkbox"
            id="req-check"
            checked={isRequired}
            onChange={(e) => setIsRequired(e.target.checked)}
            className="w-4 h-4 rounded text-[#2563EB] cursor-pointer"
          />
          <label htmlFor="req-check" className="text-slate-700 dark:text-slate-300 font-medium cursor-pointer">
            Required student field
          </label>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-[#263244]">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Personal Field'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
