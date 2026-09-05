import React, { useState } from 'react';
import {
  Plus,
  Trash2,
  Copy,
  ChevronUp,
  ChevronDown,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
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

  return (
    <div className="space-y-4 font-sans text-left w-full min-w-0 box-border">
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <h4 style={{ color: 'var(--text-primary)' }} className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
          <HelpCircle style={{ color: 'var(--brand-primary)' }} className="w-4 h-4" />
          <span>Questions ({questions.length})</span>
        </h4>
        <button
          type="button"
          onClick={handleAddQuestion}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--brand-primary)',
          }}
          className="px-3 py-1.5 rounded-xl border text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors hover:border-[var(--brand-primary)]"
        >
          <Plus className="w-3.5 h-3.5" /> Add Question
        </button>
      </div>

      <div className="space-y-4 w-full min-w-0">
        {questions.map((q, index) => {
          const cardError = errors[q.id];

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              style={{
                backgroundColor: 'var(--surface)',
                borderColor: cardError ? '#F87171' : 'var(--border)',
                color: 'var(--text-primary)',
              }}
              className={`p-4 sm:p-5 border rounded-2xl shadow-2xs space-y-4 transition-all relative w-full min-w-0 box-border ${
                cardError ? 'ring-1 ring-rose-400/30' : ''
              }`}
            >
              {/* Card Header: Numbering, Type Selector, Order Control */}
              <div style={{ borderColor: 'var(--border)' }} className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2.5 pb-3 border-b">
                <div className="flex items-center gap-2">
                  <span
                    style={{
                      backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                      color: 'var(--brand-primary)',
                      borderColor: 'color-mix(in srgb, var(--brand-primary) 20%, transparent)',
                    }}
                    className="w-7 h-7 rounded-lg font-extrabold text-xs flex items-center justify-center shrink-0 border"
                  >
                    {index + 1}
                  </span>
                  <span style={{ color: 'var(--text-primary)' }} className="text-xs font-bold">
                    Question {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap w-full sm:w-auto shrink-0 justify-between sm:justify-end">
                  {/* Standardized Theme Dropdown Container */}
                  <div className="relative inline-flex items-center w-full sm:w-auto min-w-0">
                    <select
                      value={q.type}
                      onChange={(e) =>
                        handleTypeChange(index, e.target.value as BuilderQuestionType)
                      }
                      style={{
                        backgroundColor: 'var(--surface-secondary)',
                        borderColor: 'var(--input-border)',
                        color: 'var(--text-primary)',
                      }}
                      className="h-10 w-full sm:w-auto min-w-[150px] pl-3.5 pr-9 rounded-lg text-[13px] font-medium border appearance-none cursor-pointer transition-all duration-150 focus:outline-none focus:border-[var(--brand-primary)] hover:bg-[var(--surface-hover)] hover:border-[var(--brand-primary)]"
                    >
                      <option value="single_choice" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Single Choice</option>
                      <option value="multiple_select" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Multiple Select</option>
                      <option value="true_false" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>True / False</option>
                      <option value="short_answer" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Short Answer</option>
                      <option value="long_answer" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Long Answer / Essay</option>
                      <option value="fill_blank" style={{ backgroundColor: 'var(--surface)', color: 'var(--text-primary)' }}>Fill in the Blank</option>
                    </select>
                    <ChevronDown
                      style={{ color: 'var(--text-muted)' }}
                      className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none stroke-current"
                    />
                  </div>

                  {/* Move Up / Move Down Reorder Controls */}
                  <div
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                    }}
                    className="h-10 px-1 border rounded-lg flex items-center justify-center gap-0.5 shrink-0"
                  >
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveQuestion(index, 'up')}
                      style={{ color: 'var(--text-secondary)' }}
                      className="p-1.5 hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={() => handleMoveQuestion(index, 'down')}
                      style={{ color: 'var(--text-secondary)' }}
                      className="p-1.5 hover:text-[var(--text-primary)] disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Statement Input */}
              <div>
                <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold mb-1">
                  Question Statement <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={q.questionText}
                  onChange={(e) =>
                    handleUpdateQuestion(index, { questionText: e.target.value })
                  }
                  placeholder="Enter question statement..."
                  className="h-10 text-xs sm:text-sm"
                />
              </div>

              {/* Single / Multiple Choice & Multiple Select Options */}
              {(q.type === 'single_choice' || q.type === 'mcq' || q.type === 'multiple_choice' || q.type === 'multiple_select') && (
                <div className="space-y-3 pt-1">
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold">
                    Options &amp; Correct Answer{q.type === 'multiple_select' ? 's' : ''} <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChecked =
                        q.correctAnswer === opt.id || q.correctAnswer === opt.text;

                      return (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2.5 group min-w-0"
                        >
                          {/* Company Theme Dynamic Option Selector */}
                          <button
                            type="button"
                            role={q.type === 'multiple_select' ? 'checkbox' : 'radio'}
                            aria-checked={Boolean(isChecked)}
                            onClick={() =>
                              handleUpdateQuestion(index, {
                                correctAnswer: opt.id,
                              })
                            }
                            style={
                              isChecked
                                ? {
                                    borderColor: 'var(--brand-primary)',
                                    backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                                  }
                                : {
                                    backgroundColor: 'var(--surface-secondary)',
                                    borderColor: 'var(--input-border)',
                                  }
                            }
                            className={`w-5 h-5 border flex items-center justify-center shrink-0 cursor-pointer transition-all focus:outline-2 focus:outline-[var(--brand-primary)] ${
                              q.type === 'multiple_select' ? 'rounded-md' : 'rounded-full'
                            }`}
                            title="Mark as correct answer"
                          >
                            {isChecked && (
                              <span
                                style={{ backgroundColor: 'var(--brand-primary)' }}
                                className={`shrink-0 ${q.type === 'multiple_select' ? 'w-3 h-3 rounded-xs' : 'w-2.5 h-2.5 rounded-full'}`}
                              />
                            )}
                          </button>

                          {/* Hidden Input for Form Accessibility */}
                          <input
                            type={q.type === 'multiple_select' ? 'checkbox' : 'radio'}
                            name={`correct-ans-${q.id}`}
                            value={opt.id}
                            checked={Boolean(isChecked)}
                            onChange={() =>
                              handleUpdateQuestion(index, {
                                correctAnswer: opt.id,
                              })
                            }
                            className="sr-only"
                          />

                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              handleOptionTextChange(index, optIdx, e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            className="h-9 text-xs flex-1 min-w-0"
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index, optIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddOption(index)}
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--border)',
                      color: 'var(--brand-primary)',
                    }}
                    className="px-3 py-1.5 rounded-xl border border-dashed text-[11px] font-semibold inline-flex items-center gap-1 cursor-pointer transition-colors hover:border-[var(--brand-primary)]"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </button>
                </div>
              )}

              {/* True / False Options */}
              {q.type === 'true_false' && (
                <div className="space-y-2 pt-1">
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold">
                    Select Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
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
                          style={
                            isSelected
                              ? {
                                  backgroundColor: 'color-mix(in srgb, var(--brand-primary) 12%, transparent)',
                                  borderColor: 'var(--brand-primary)',
                                  color: 'var(--brand-primary)',
                                }
                              : {
                                  backgroundColor: 'var(--surface-secondary)',
                                  borderColor: 'var(--border)',
                                  color: 'var(--text-secondary)',
                                }
                          }
                          className="flex-1 py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs"
                        >
                          <CheckCircle2
                            style={{ color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                            className="w-4 h-4 shrink-0"
                          />
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short Answer / Fill Blank Field */}
              {(q.type === 'short_answer' || q.type === 'fill_blank') && (
                <div className="pt-1">
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold mb-1">
                    Expected / Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleUpdateQuestion(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter expected answer text..."
                    className="h-10 text-xs sm:text-sm"
                  />
                </div>
              )}

              {/* Long Answer / Essay Field */}
              {q.type === 'long_answer' && (
                <div className="pt-1 space-y-1">
                  <label style={{ color: 'var(--text-secondary)' }} className="block text-xs font-semibold">
                    Grading Notes / Model Solution (Instructor Only)
                  </label>
                  <textarea
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleUpdateQuestion(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter grading guidelines or sample answer for manual evaluation..."
                    rows={3}
                    style={{
                      backgroundColor: 'var(--surface-secondary)',
                      borderColor: 'var(--input-border)',
                      color: 'var(--text-primary)',
                    }}
                    className="w-full p-2.5 rounded-xl border text-xs font-medium focus:outline-none focus:border-[var(--brand-primary)]"
                  />
                </div>
              )}

              {/* Card Inline Error Alert */}
              {cardError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{cardError}</span>
                </div>
              )}

              {/* Card Footer Actions: Duplicate & Delete */}
              <div style={{ borderColor: 'var(--border)' }} className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => handleDuplicateQuestion(index)}
                  style={{
                    backgroundColor: 'var(--surface-secondary)',
                    borderColor: 'var(--border)',
                    color: 'var(--text-secondary)',
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl border text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <Copy className="w-3 h-3 shrink-0" /> Duplicate
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteModalIndex(index)}
                  style={{
                    backgroundColor: 'transparent',
                    borderColor: 'rgba(248,113,113,0.3)',
                    color: '#F87171',
                  }}
                  className="w-full sm:w-auto px-3 py-1.5 rounded-xl border text-[11px] font-semibold inline-flex items-center justify-center gap-1 transition-colors hover:bg-rose-950/20 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <button
          type="button"
          onClick={handleAddQuestion}
          style={{
            backgroundColor: 'var(--surface-secondary)',
            borderColor: 'var(--border)',
            color: 'var(--brand-primary)',
          }}
          className="w-full py-2.5 border border-dashed rounded-xl text-xs font-bold inline-flex items-center gap-1.5 justify-center transition-colors hover:border-[var(--brand-primary)] cursor-pointer"
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
