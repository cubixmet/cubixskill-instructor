import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { studentsService } from '../../../services/students.service';

export const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<{ full_name?: string; email?: string; general?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErrors({});

    if (!name.trim()) {
      setFormErrors((prev) => ({ ...prev, full_name: 'Full name is required.' }));
      return;
    }
    if (!email.trim()) {
      setFormErrors((prev) => ({ ...prev, email: 'Email address is required.' }));
      return;
    }

    setIsSubmitting(true);
    try {
      await studentsService.createStudent({
        full_name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });
      navigate('/students');
    } catch (err: any) {
      if (err.data && typeof err.data === 'object') {
        setFormErrors({
          email: Array.isArray(err.data.email) ? err.data.email[0] : err.data.email,
          full_name: Array.isArray(err.data.full_name) ? err.data.full_name[0] : err.data.full_name,
          general: err.message || 'Failed to create student profile.',
        });
      } else {
        setFormErrors({ general: err.message || 'A student with this email address may already exist.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#172033] rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Add New Student</h1>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">Create a student account in your Academy database.</p>
        </div>
      </div>

      <Card padding="md" className="bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#263244] p-6 rounded-[16px] space-y-5">
        {formErrors.general && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl border border-rose-200 font-medium">
            {formErrors.general}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anish Varma"
              required
              className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                formErrors.full_name ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
              } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
            />
            {formErrors.full_name && (
              <p className="text-[11px] text-rose-600 font-medium">{formErrors.full_name}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[12px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="anish@example.com"
              required
              className={`w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border ${
                formErrors.email ? 'border-rose-500' : 'border-[#E2E8F0] dark:border-[#334155]'
              } rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]`}
            />
            {formErrors.email && (
              <p className="text-[11px] text-rose-600 font-medium">{formErrors.email}</p>
            )}
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              className="w-full h-10 px-3 bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0] dark:border-[#263244]">
            <Button type="button" variant="outline" onClick={() => navigate('/students')}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} leftIcon={<Check className="w-4 h-4 stroke-[3]" />} className="bg-[#2563EB] text-white">
              {isSubmitting ? 'Saving...' : 'Create Student'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
