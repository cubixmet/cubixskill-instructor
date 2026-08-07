import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useStudentStore } from '../store/student.store';

export const StudentEditPage: React.FC = () => {
  const navigate = useNavigate();
  const { studentUuid } = useParams<{ studentUuid?: string }>();
  const student = useStudentStore((state) => state.students.find((s) => s.uuid === studentUuid));
  const updateStudent = useStudentStore((state) => state.updateStudent);

  const [name, setName] = useState(student?.name || '');
  const [email, setEmail] = useState(student?.email || '');
  const [phone, setPhone] = useState(student?.phone || '');
  const [notes, setNotes] = useState(student?.notes || '');

  useEffect(() => {
    if (student) {
      const tid = setTimeout(() => {
        setName(student.name);
        setEmail(student.email);
        setPhone(student.phone || '');
        setNotes(student.notes || '');
      }, 0);
      return () => clearTimeout(tid);
    }
  }, [student]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentUuid || !name || !email) return;

    updateStudent(studentUuid, {
      name,
      email,
      phone,
      notes,
    });

    navigate(`/students/${studentUuid}`);
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-3xl mx-auto pb-12">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate(`/students/${studentUuid}`)}
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
            <Button type="button" variant="outline" onClick={() => navigate(`/students/${studentUuid}`)} className="border-[#E2E8F0]">
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
