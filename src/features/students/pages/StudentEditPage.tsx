import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { studentsService } from '../../../services/students.service';

export const StudentEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentId, studentUuid } = useParams<{ studentId?: string; studentUuid?: string }>();
  const id = studentId || studentUuid || '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setIsLoading(true);
    studentsService.getStudent(id)
      .then((data) => {
        if (!isMounted) return;
        setName(data.display_name || data.full_name || data.user?.full_name || '');
        setEmail(data.email || data.user?.email || '');
        setPhone(data.phone || data.user?.phone || '');
        setNotes(data.bio || '');
      })
      .catch((err) => {
        if (!isMounted) return;
        setErrorMsg(err.message || 'Failed to load student details.');
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name || !email) return;

    setIsSubmitting(true);
    setErrorMsg('');
    try {
      await studentsService.updateStudent(id, {
        full_name: name,
        email,
        phone,
        bio: notes,
      });
      navigate(`/students/${id}`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update student.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/students/${id}`)}
          className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">Edit Student Details</h1>
          <p className="text-xs text-[#64748B]">Update profile information for {name || 'Student'}.</p>
        </div>
      </div>

      <Card padding="md" className="bg-white border border-[#E2E8F0] p-6 rounded-[16px] space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[12px] font-semibold text-[#0F172A]">Full Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full text-xs font-medium h-10"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-[12px] font-semibold text-[#0F172A]">Email Address *</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full text-xs font-medium h-10"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-[#0F172A]">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs font-medium h-9"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="block text-[11px] font-semibold text-[#0F172A]">Private Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-normal resize-none focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" onClick={() => navigate(`/students/${id}`)} className="border-[#E2E8F0]">
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Save className="w-4 h-4" />} className="bg-[#2563EB] text-white">
              Save Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
