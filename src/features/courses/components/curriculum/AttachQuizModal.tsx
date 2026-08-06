import React, { useState } from 'react';
import { Search, HelpCircle, Plus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Modal } from '../../../../components/ui/Modal';
import { Button } from '../../../../components/ui/Button';
import { Badge } from '../../../../components/ui/Badge';
import { useQuizStore } from '../../../quizzes/store/quiz.store';
import type { Quiz } from '../../../../types/quiz.types';

interface AttachQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
  courseUuid: string;
  onSelectQuiz: (quiz: Quiz) => void;
  currentlyAttachedUuid?: string;
}

export const AttachQuizModal: React.FC<AttachQuizModalProps> = ({
  isOpen,
  onClose,
  courseUuid,
  onSelectQuiz,
  currentlyAttachedUuid,
}) => {
  const navigate = useNavigate();
  const quizzes = useQuizStore((state) => state.quizzes);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTab, setFilterTab] = useState<'All' | 'Published' | 'Draft'>('All');
  const [selectedUuid, setSelectedUuid] = useState<string | undefined>(currentlyAttachedUuid);

  if (!isOpen) return null;

  const courseQuizzes = quizzes.filter((q) => q.courseUuid === courseUuid || !q.courseUuid);

  const filteredQuizzes = courseQuizzes.filter((q) => {
    const matchesSearch =
      q.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.shortDescription.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter =
      filterTab === 'All' ? true : filterTab === 'Published' ? q.status === 'Published' : q.status === 'Draft';
    return matchesSearch && matchesFilter;
  });

  const activeSelectedUuid = selectedUuid || currentlyAttachedUuid || courseQuizzes[0]?.id;
  const selectedQuiz = quizzes.find((q) => q.id === activeSelectedUuid);

  const handleCreateNew = () => {
    onClose();
    navigate(`/courses/${courseUuid}/quizzes`);
  };

  const handleConfirmAttach = () => {
    if (selectedQuiz) {
      onSelectQuiz(selectedQuiz);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Attach Quiz"
      subtitle="Select an existing quiz assessment to attach to this lesson."
      maxWidth="md"
    >
      <div className="space-y-4 font-sans text-xs text-left">
        <div className="relative w-full">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search quizzes by title..."
            className="w-full h-10 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-medium text-[#0F172A] focus:outline-none focus:border-[#2563EB]"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-xs">
            {(['All', 'Published', 'Draft'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setFilterTab(tab)}
                className={`px-3 py-1.5 rounded-full text-xs transition-colors cursor-pointer ${
                  filterTab === tab ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B] hover:bg-slate-200'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            leftIcon={<Plus className="w-3.5 h-3.5 text-[#2563EB]" />}
            onClick={handleCreateNew}
            className="border-[#2563EB] text-[#2563EB] text-[11px] font-semibold h-8 shrink-0"
          >
            Create Quiz
          </Button>
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar">
          {filteredQuizzes.length === 0 ? (
            <div className="p-6 text-center text-[#64748B] bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
              No quizzes found matching your filter.
            </div>
          ) : (
            filteredQuizzes.map((quiz) => {
              const isSelected = activeSelectedUuid === quiz.id;

              return (
                <button
                  key={quiz.id}
                  type="button"
                  onClick={() => setSelectedUuid(quiz.id)}
                  className={`w-full p-3.5 rounded-[14px] border text-left transition-all flex items-start justify-between gap-3 cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 border-[#2563EB]' : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-amber-50 text-amber-600 border border-amber-100'
                      }`}
                    >
                      <HelpCircle className="w-4 h-4" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <strong className="text-xs font-semibold text-[#0F172A] truncate">{quiz.title}</strong>
                        <Badge variant={quiz.status === 'Published' ? 'success' : 'secondary'} size="sm">
                          {quiz.status}
                        </Badge>
                      </div>
                      <span className="text-[11px] text-[#64748B] block mt-0.5 truncate">
                        {quiz.shortDescription || 'No description'}
                      </span>
                      <div className="flex items-center gap-3 text-[10px] text-[#64748B] pt-1">
                        <span>Pass Threshold: <strong className="text-[#2563EB] font-bold">{quiz.passingScore}%</strong></span>
                        <span>•</span>
                        <span>Time Limit: <strong>{quiz.timeLimitMinutes} Mins</strong></span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectQuiz(quiz);
                      onClose();
                    }}
                    className={`h-7 text-[10px] px-3 font-semibold shrink-0 ${
                      isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB]'
                    }`}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </Button>
                </button>
              );
            })
          )}
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
          <Button type="button" variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!selectedQuiz}
            onClick={handleConfirmAttach}
            className="h-10 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-xs px-6"
          >
            Attach Selected Quiz
          </Button>
        </div>
      </div>
    </Modal>
  );
};
