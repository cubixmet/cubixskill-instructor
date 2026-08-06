import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard } from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { useStudentStore } from '../store/student.store';

export const StudentCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const addStudent = useStudentStore((state) => state.addStudent);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) return;

    addStudent({
      name,
      email,
      phone,
      countryCode: '+91',
      country: 'India',
      status: 'Active',
      notes,
    });

    navigate('/students');
  };

  return (
    <div className="space-y-6 text-left font-sans max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/students')}
          className="p-2 text-[#64748B] hover:text-[#0F172A] hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5 text-[#0F172A]" />
        </button>
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A]">Enroll New Student</h1>
          <p className="text-xs text-[#64748B]">Fill in student credentials to grant course portal access.</p>
        </div>
      </div>

      <Card padding="md" className="bg-white border border-[#E2E8F0] p-6 rounded-[16px] space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="space-y-1">
            <label className="block text-[12px] font-semibold text-[#0F172A]">Full Name *</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Anish Varma"
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
              placeholder="anish@example.com"
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
                placeholder="+91 98765 43210"
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
              placeholder="Optional notes visible only to instructors..."
              className="w-full p-2.5 bg-white border border-[#E2E8F0] rounded-lg text-xs font-normal resize-none focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-[#2563EB] text-[11px] font-medium flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-[#2563EB] shrink-0" />
            <span>Enrolling a new student will deduct <strong>17 Media Credits</strong> for course access.</span>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#E2E8F0]">
            <Button type="button" variant="outline" onClick={() => navigate('/students')} className="border-[#E2E8F0]">
              Cancel
            </Button>
            <Button type="submit" leftIcon={<Check className="w-4 h-4 stroke-[3]" />} className="bg-[#2563EB] text-white">
              Confirm & Enroll
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
