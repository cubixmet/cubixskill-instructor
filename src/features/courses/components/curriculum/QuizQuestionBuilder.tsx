import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  Copy,
  ArrowUp,
  ArrowDown,
} from 'lucide-react';
import { Input } from '../../../../components/ui/Input';
import { Modal } from '../../../../components/ui/Modal';

export type BuilderQuestionType =
  | 'single_choice'
  | 'mcq'
  | 'multiple_choice'
  | 'multiple_select'
  | 'true_false'
  | 'short_answer'
  | 'long_answer'
  | 'fill_blank';

export interface QuizOptionItem {
  id: string;
  text: string;
}

export interface BuilderQuestion {
  id: string;
  type: BuilderQuestionType;
  questionText: string;
  options: QuizOptionItem[];
  correctAnswer: string;
}

interface QuizQuestionBuilderProps {
  questions: BuilderQuestion[];
  onChange: (questions: BuilderQuestion[]) => void;
  errors?: Record<string, string>;
}

// eslint-disable-next-line react-refresh/only-export-components
export const createDefaultQuestion = (): BuilderQuestion => {
  const qId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const opt1Id = `opt-1-${qId}`;
  const opt2Id = `opt-2-${qId}`;

  return {
    id: qId,
    type: 'single_choice',
    questionText: '',
    options: [
      { id: opt1Id, text: '' },
      { id: opt2Id, text: '' },
    ],
    correctAnswer: opt1Id,
  };
};

export const QuizQuestionBuilder: React.FC<QuizQuestionBuilderProps> = React.memo(({
  questions,
  onChange,
  errors = {},
}) => {
  const [deleteModalIndex, setDeleteModalIndex] = useState<number | null>(null);

  const handleAddQuestion = () => {
    const newQ = createDefaultQuestion();
    onChange([...questions, newQ]);
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const newQId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

    const idMap: Record<string, string> = {};
    const newOptions = target.options.map((opt, i) => {
      const newOptId = `opt-${i + 1}-${newQId}`;
      idMap[opt.id] = newOptId;
      return { id: newOptId, text: opt.text };
    });

    let newCorrect = target.correctAnswer;
    if (idMap[target.correctAnswer]) {
      newCorrect = idMap[target.correctAnswer];
    }

    const duplicated: BuilderQuestion = {
      ...target,
      id: newQId,
      options: newOptions,
      correctAnswer: newCorrect,
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const confirmDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      onChange([createDefaultQuestion()]);
      setDeleteModalIndex(null);
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
    setDeleteModalIndex(null);
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= questions.length) return;
    const updated = [...questions];
    const [temp] = updated.splice(index, 1);
    updated.splice(targetIndex, 0, temp);
    onChange(updated);
  };

  const handleUpdateQuestion = (index: number, updates: Partial<BuilderQuestion>) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], ...updates };
    onChange(updated);
  };

  const handleTypeChange = (index: number, newType: BuilderQuestionType) => {
    const q = questions[index];
    const qId = q.id;

    let defaultOptions: QuizOptionItem[] = q.options;
    let defaultCorrect = q.correctAnswer;

    if (newType === 'single_choice' || newType === 'mcq' || newType === 'multiple_choice' || newType === 'multiple_select') {
      if (!defaultOptions || defaultOptions.length < 2) {
        defaultOptions = [
          { id: `opt-1-${qId}`, text: '' },
          { id: `opt-2-${qId}`, text: '' },
        ];
      }
      defaultCorrect = defaultOptions[0]?.id || '';
    } else if (newType === 'true_false') {
      defaultOptions = [];
      defaultCorrect = 'True';
    } else {
      defaultOptions = [];
      defaultCorrect = '';
    }

    handleUpdateQuestion(index, {
      type: newType,
      options: defaultOptions,
      correctAnswer: defaultCorrect,
    });
  };

  const handleAddOption = (qIndex: number) => {
    const q = questions[qIndex];
    const newOptId = `opt-${q.options.length + 1}-${Date.now()}`;
    const updatedOptions = [...q.options, { id: newOptId, text: '' }];
    handleUpdateQuestion(qIndex, { options: updatedOptions });
  };

  const handleRemoveOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    if (q.options.length <= 2) return;
    const targetOpt = q.options[optIndex];
    const updatedOptions = q.options.filter((_, i) => i !== optIndex);

    let newCorrect = q.correctAnswer;
    if (q.correctAnswer === targetOpt.id || q.correctAnswer === targetOpt.text) {
      newCorrect = ''; // Require instructor to select a new option
    }

    handleUpdateQuestion(qIndex, {
      options: updatedOptions,
      correctAnswer: newCorrect,
    });
  };

  const handleOptionTextChange = (qIndex: number, optIndex: number, text: string) => {
    const q = questions[qIndex];
    const updatedOptions = [...q.options];
    updatedOptions[optIndex] = { ...updatedOptions[optIndex], text };
    handleUpdateQuestion(qIndex, { options: updatedOptions });
  };

  const [expandedCardIds, setExpandedCardIds] = useState<Record<string, boolean>>({});

  const toggleExpand = (id: string) => {
    setExpandedCardIds((prev) => ({
      ...prev,
      [id]: prev[id] === undefined ? false : !prev[id],
    }));
  };

  return (
    <div className="space-y-3 sm:space-y-4 font-sans text-left w-full min-w-0 box-border">
      <div className="flex items-center justify-between gap-2 flex-wrap pb-1 w-full min-w-0">
        <div className="min-w-0 flex-1">
          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-tight">
            Questions
          </h4>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] leading-tight">
            Add and manage your quiz questions.
          </p>
        </div>
        <span className="text-xs font-semibold text-[var(--text-secondary)] shrink-0">
          Total: <strong className="text-[var(--text-primary)]">{questions.length}</strong>
        </span>
      </div>

      <div className="space-y-3 w-full min-w-0">
        {questions.map((q, index) => {
          const cardError = errors[q.id];
          const isExpanded = expandedCardIds[q.id] !== false;

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`p-3 sm:p-4 border rounded-[14px] bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] shadow-xs space-y-3 transition-all relative w-full min-w-0 box-border ${
                cardError ? 'ring-1 ring-rose-400/30 border-rose-400' : ''
              }`}
            >
              {/* Card Header */}
              <div className="flex items-center justify-between gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border border-[var(--brand-primary)]/30 bg-[var(--brand-primary)]/15 text-[var(--brand-primary)]">
                    {index + 1}
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] truncate">
                    Question {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(index, 'up')}
                      className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
                      title="Move Question Up"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                  )}
                  {index < questions.length - 1 && (
                    <button
                      type="button"
                      onClick={() => handleMoveQuestion(index, 'down')}
                      className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
                      title="Move Question Down"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDuplicateQuestion(index)}
                    className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--brand-primary)] rounded-lg transition-colors cursor-pointer"
                    title="Duplicate Question"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleExpand(q.id)}
                    className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
                    title={isExpanded ? 'Collapse Question' : 'Expand Question'}
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteModalIndex(index)}
                    className="p-1 sm:p-1.5 text-[var(--text-secondary)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer min-w-[32px] min-h-[32px] flex items-center justify-center"
                    title="Delete Question"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Card Body - Collapsible */}
              {isExpanded && (
                <div className="space-y-3 pt-2 border-t border-[var(--border)] w-full min-w-0">
                  {/* Question Text */}
                  <div className="space-y-1 min-w-0 w-full">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      Question Text <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      value={q.questionText}
                      onChange={(e) =>
                        handleUpdateQuestion(index, { questionText: e.target.value })
                      }
                      placeholder="Enter question text here..."
                      rows={2}
                      className="w-full p-2.5 sm:p-3 rounded-[10px] border border-[var(--input-border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] text-xs sm:text-sm font-medium focus:outline-none focus:border-[var(--brand-primary)] placeholder:[var(--text-muted)] min-h-[80px] resize-y box-border"
                    />
                  </div>

                  {/* Question Type & Points Row - Responsive Grid */}
                  <div className="grid grid-cols-1 min-[350px]:grid-cols-[minmax(0,1fr)_88px] gap-2.5 items-start w-full min-w-0">
                    <div className="space-y-1 min-w-0 w-full">
                      <label className="block text-xs font-bold text-[var(--text-primary)]">
                        Question Type
                      </label>
                      <div className="relative inline-flex items-center w-full min-w-0">
                        <select
                          value={q.type}
                          onChange={(e) =>
                            handleTypeChange(index, e.target.value as BuilderQuestionType)
                          }
                          className="h-[44px] sm:h-[48px] w-full pl-3 pr-8 rounded-[10px] text-xs font-semibold border border-[var(--input-border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] appearance-none cursor-pointer transition-all focus:outline-none focus:border-[var(--brand-primary)] min-w-0 box-border"
                        >
                          <option value="single_choice">Single Choice</option>
                          <option value="multiple_select">Multiple Choice</option>
                          <option value="true_false">True / False</option>
                          <option value="short_answer">Short Answer</option>
                          <option value="long_answer">Long Answer</option>
                          <option value="fill_blank">Fill in Blank</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)] shrink-0" />
                      </div>
                    </div>

                    <div className="space-y-1 min-w-0 w-full">
                      <label className="block text-xs font-bold text-[var(--text-primary)]">
                        Points
                      </label>
                      <Input
                        type="number"
                        min={1}
                        defaultValue={1}
                        className="h-[44px] sm:h-[48px] text-xs font-semibold rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] w-full text-center min-w-0 box-border"
                      />
                    </div>
                  </div>

              {/* Options & Answers Section */}
              {(q.type === 'single_choice' || q.type === 'mcq' || q.type === 'multiple_choice' || q.type === 'multiple_select') && (
                <div className="space-y-2.5 pt-1 w-full min-w-0">
                  <div className="flex flex-col min-[360px]:flex-row min-[360px]:items-center justify-between gap-1 w-full">
                    <label className="block text-xs font-bold text-[var(--text-primary)]">
                      Options
                    </label>
                    <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                      Mark the correct answer
                    </span>
                  </div>

                  <div className="space-y-2 w-full min-w-0">
                    {q.options.map((opt, optIdx) => {
                      const isChecked =
                        q.correctAnswer === opt.id || q.correctAnswer === opt.text;

                      return (
                        <div
                          key={opt.id}
                          className={`grid grid-cols-[28px_minmax(0,1fr)_32px] items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 rounded-[10px] border transition-all w-full min-w-0 box-border ${
                            isChecked
                              ? 'border-emerald-500/50 bg-emerald-500/5'
                              : 'border-[var(--border)] bg-[var(--surface-secondary)]'
                          }`}
                        >
                          {/* Correct Answer Selection Button */}
                          <button
                            type="button"
                            role={q.type === 'multiple_select' ? 'checkbox' : 'radio'}
                            aria-checked={Boolean(isChecked)}
                            onClick={() =>
                              handleUpdateQuestion(index, {
                                correctAnswer: opt.id,
                              })
                            }
                            className={`w-5 h-5 border flex items-center justify-center shrink-0 cursor-pointer transition-all ${
                              isChecked
                                ? 'border-emerald-500 bg-emerald-500 text-white'
                                : 'border-[var(--input-border)] bg-[var(--surface)] text-transparent'
                            } ${q.type === 'multiple_select' ? 'rounded-md' : 'rounded-full'}`}
                            title="Mark as correct answer"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 stroke-[3]" />
                          </button>

                          {/* Option Input Wrapper with Relative Correct Badge */}
                          <div className="relative flex items-center w-full min-w-0">
                            <Input
                              value={opt.text}
                              onChange={(e) =>
                                handleOptionTextChange(index, optIdx, e.target.value)
                              }
                              placeholder={`Option ${String.fromCharCode(65 + optIdx)}`}
                              className={`h-[40px] text-xs font-medium rounded-[8px] border-[var(--input-border)] bg-[var(--surface)] text-[var(--text-primary)] w-full min-w-0 ${
                                isChecked ? 'border-emerald-500/60 pr-16 sm:pr-20 font-semibold' : 'pr-3'
                              }`}
                            />
                            {isChecked && (
                              <span className="hidden min-[360px]:inline-flex absolute right-2 top-1/2 -translate-y-1/2 text-[9px] sm:text-[10px] font-bold uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full pointer-events-none shrink-0 border border-emerald-500/20">
                                Correct
                              </span>
                            )}
                          </div>

                          <div className="flex items-center justify-center shrink-0">
                            {q.options.length > 2 && (
                              <button
                                type="button"
                                onClick={() => handleRemoveOption(index, optIdx)}
                                className="w-8 h-8 flex items-center justify-center text-[var(--text-muted)] hover:text-rose-500 rounded-lg transition-colors cursor-pointer"
                                title="Remove Option"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddOption(index)}
                    className="w-full h-[44px] rounded-[10px] border border-dashed border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--brand-primary)] text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors hover:border-[var(--brand-primary)] box-border"
                  >
                    <Plus className="w-4 h-4" /> Add Option
                  </button>
                </div>
              )}

              {/* True / False Options */}
              {q.type === 'true_false' && (
                <div className="space-y-2 pt-1 w-full min-w-0">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Select Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2.5 w-full min-w-0">
                    {['True', 'False'].map((val) => {
                      const isSelected =
                        (q.correctAnswer || '').toLowerCase() === val.toLowerCase();
                      return (
                        <button
                          key={`tf-${q.id}-${val}`}
                          type="button"
                          onClick={() =>
                            handleUpdateQuestion(index, { correctAnswer: val })
                          }
                          className={`h-[44px] px-3 rounded-[10px] border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer min-w-0 box-border ${
                            isSelected
                              ? 'bg-emerald-500/10 border-emerald-500 text-emerald-600 dark:text-emerald-400'
                              : 'bg-[var(--surface-secondary)] border-[var(--border)] text-[var(--text-secondary)]'
                          }`}
                        >
                          <CheckCircle2 className={`w-4 h-4 shrink-0 ${isSelected ? 'text-emerald-500' : 'text-[var(--text-muted)]'}`} />
                          <span className="truncate">{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short Answer / Fill Blank Field */}
              {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                <div className="pt-1 space-y-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Expected / Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleUpdateQuestion(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter expected answer text..."
                    className="h-[42px] text-xs sm:text-sm font-medium rounded-[10px] bg-[var(--surface-secondary)] border-[var(--input-border)] text-[var(--text-primary)] w-full"
                  />
                </div>
              )}

              {/* Long Answer Field */}
              {q.type === 'long_answer' && (
                <div className="pt-1 space-y-1">
                  <label className="block text-xs font-bold text-[var(--text-primary)]">
                    Grading Notes / Sample Answer (Instructor Only)
                  </label>
                  <textarea
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleUpdateQuestion(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter sample answer for evaluation..."
                    rows={2}
                    className="w-full p-2.5 rounded-[10px] border border-[var(--input-border)] bg-[var(--surface-secondary)] text-[var(--text-primary)] text-xs font-medium focus:outline-none focus:border-[var(--brand-primary)] min-h-[70px]"
                  />
                </div>
              )}

              {/* Card Inline Error Alert */}
              {cardError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-[10px] text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddQuestion}
          className="w-full py-3 border border-dashed border-[var(--border)] bg-[var(--surface-secondary)] text-[var(--brand-primary)] rounded-[12px] text-xs font-bold inline-flex items-center gap-1.5 justify-center transition-colors hover:border-[var(--brand-primary)] cursor-pointer h-[46px] sm:h-[50px]"
        >
          <Plus className="w-4 h-4 shrink-0" /> Add Question
        </button>
      </div>

      {/* Delete Question Confirmation Modal */}
      {deleteModalIndex !== null && (
        <Modal
          isOpen={true}
          onClose={() => setDeleteModalIndex(null)}
          title="Delete Question"
          maxWidth="sm"
        >
          <div className="space-y-4 font-sans text-left">
            <p className="text-xs text-[var(--text-secondary)]">
              Are you sure you want to delete Question {deleteModalIndex + 1}? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalIndex(null)}
                className="px-3.5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--surface-secondary)] text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => confirmDeleteQuestion(deleteModalIndex)}
                className="px-3.5 py-1.5 rounded-xl bg-rose-600 text-xs font-semibold text-white hover:bg-rose-700 cursor-pointer"
              >
                Delete Question
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
});
