import React from 'react';
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
import { Button } from '../../../../components/ui/Button';
import { Input } from '../../../../components/ui/Input';

export type BuilderQuestionType = 'mcq' | 'true_false' | 'short_answer';

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
  return {
    id: qId,
    type: 'mcq',
    questionText: '',
    options: [
      { id: `opt-1-${qId}`, text: '' },
      { id: `opt-2-${qId}`, text: '' },
    ],
    correctAnswer: '',
  };
};

export const QuizQuestionBuilder: React.FC<QuizQuestionBuilderProps> = ({
  questions,
  onChange,
  errors = {},
}) => {
  const handleAddQuestion = () => {
    const newQ = createDefaultQuestion();
    onChange([...questions, newQ]);
  };

  const handleDuplicateQuestion = (index: number) => {
    const target = questions[index];
    const newQId = `q-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const duplicated: BuilderQuestion = {
      ...target,
      id: newQId,
      options: target.options.map((opt, i) => ({
        id: `opt-${i + 1}-${newQId}`,
        text: opt.text,
      })),
    };
    const updated = [...questions];
    updated.splice(index + 1, 0, duplicated);
    onChange(updated);
  };

  const handleDeleteQuestion = (index: number) => {
    if (questions.length <= 1) {
      // Reset to 1 fresh empty question instead of leaving zero questions
      onChange([createDefaultQuestion()]);
      return;
    }
    const updated = questions.filter((_, i) => i !== index);
    onChange(updated);
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

    if (newType === 'mcq') {
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
    } else if (newType === 'short_answer') {
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
    if (q.options.length <= 2) return; // Require at least 2 options for MCQ
    const targetOpt = q.options[optIndex];
    const updatedOptions = q.options.filter((_, i) => i !== optIndex);
    let newCorrect = q.correctAnswer;
    if (q.correctAnswer === targetOpt.id || q.correctAnswer === targetOpt.text) {
      newCorrect = updatedOptions[0]?.id || '';
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
    <div className="space-y-4 font-sans text-left">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-[#2563EB]" />
          <span>Questions ({questions.length})</span>
        </h4>
        <Button
          type="button"
          size="xs"
          variant="outline"
          onClick={handleAddQuestion}
          className="gap-1 text-[11px] font-semibold"
        >
          <Plus className="w-3.5 h-3.5" /> Add Question
        </Button>
      </div>

      <div className="space-y-4">
        {questions.map((q, index) => {
          const cardError = errors[q.id];

          return (
            <div
              key={q.id}
              id={`question-card-${q.id}`}
              className={`p-4 sm:p-5 bg-white border rounded-2xl shadow-2xs space-y-4 transition-all relative ${
                cardError
                  ? 'border-rose-400 ring-1 ring-rose-400/30'
                  : 'border-[#E2E8F0] hover:border-blue-200'
              }`}
            >
              {/* Card Header: Numbering, Type Selector, Order Control */}
              <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-lg bg-blue-50 text-[#2563EB] font-extrabold text-xs flex items-center justify-center shrink-0 border border-blue-100">
                    {index + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0F172A]">
                    Question {index + 1}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {/* Question Type Selector */}
                  <select
                    value={q.type}
                    onChange={(e) =>
                      handleTypeChange(index, e.target.value as BuilderQuestionType)
                    }
                    className="h-8 px-2.5 bg-slate-50 border border-[#E2E8F0] rounded-lg text-xs font-semibold text-[#0F172A] focus:outline-none focus:border-[#2563EB] cursor-pointer"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="true_false">True / False</option>
                    <option value="short_answer">Short Answer</option>
                  </select>

                  {/* Move Up / Move Down */}
                  <div className="flex items-center gap-0.5 border border-[#E2E8F0] rounded-lg bg-slate-50 p-0.5">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveQuestion(index, 'up')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Up"
                    >
                      <ChevronUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === questions.length - 1}
                      onClick={() => handleMoveQuestion(index, 'down')}
                      className="p-1 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                      title="Move Down"
                    >
                      <ChevronDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Question Statement Input */}
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] mb-1">
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

              {/* Multiple Choice Options */}
              {q.type === 'mcq' && (
                <div className="space-y-3 pt-1">
                  <label className="block text-xs font-semibold text-[#0F172A]">
                    Options & Correct Answer <span className="text-rose-500">*</span>
                  </label>

                  <div className="space-y-2">
                    {q.options.map((opt, optIdx) => {
                      const isChecked =
                        q.correctAnswer === opt.id || q.correctAnswer === opt.text;

                      return (
                        <div
                          key={opt.id}
                          className="flex items-center gap-2 group"
                        >
                          {/* Radio button to mark correct answer */}
                          <input
                            type="radio"
                            name={`correct-ans-${q.id}`}
                            checked={Boolean(isChecked)}
                            onChange={() =>
                              handleUpdateQuestion(index, {
                                correctAnswer: opt.id || opt.text,
                              })
                            }
                            className="w-4 h-4 text-[#2563EB] border-slate-300 focus:ring-[#2563EB] cursor-pointer shrink-0"
                            title="Mark as correct answer"
                          />

                          <Input
                            value={opt.text}
                            onChange={(e) =>
                              handleOptionTextChange(index, optIdx, e.target.value)
                            }
                            placeholder={`Option ${optIdx + 1}`}
                            className="h-9 text-xs flex-1"
                          />

                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveOption(index, optIdx)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="Remove Option"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="xs"
                    onClick={() => handleAddOption(index)}
                    className="gap-1 text-[11px] text-[#2563EB] border-dashed border-blue-200 hover:bg-blue-50"
                  >
                    <Plus className="w-3 h-3" /> Add Option
                  </Button>
                </div>
              )}

              {/* True / False Options */}
              {q.type === 'true_false' && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-[#0F172A]">
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
                          className={`flex-1 py-2 px-4 rounded-xl border text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 border-[#2563EB] text-[#2563EB] shadow-2xs'
                              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 ${
                              isSelected ? 'text-[#2563EB]' : 'text-slate-300'
                            }`}
                          />
                          <span>{val}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Short Answer Field */}
              {q.type === 'short_answer' && (
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-[#0F172A] mb-1">
                    Expected / Correct Answer <span className="text-rose-500">*</span>
                  </label>
                  <Input
                    value={q.correctAnswer}
                    onChange={(e) =>
                      handleUpdateQuestion(index, { correctAnswer: e.target.value })
                    }
                    placeholder="Enter expected text answer..."
                    className="h-10 text-xs sm:text-sm"
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
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#E2E8F0]">
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleDuplicateQuestion(index)}
                  className="gap-1 text-[11px] text-slate-700"
                >
                  <Copy className="w-3 h-3" /> Duplicate
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="xs"
                  onClick={() => handleDeleteQuestion(index)}
                  className="gap-1 text-[11px] text-rose-600 hover:bg-rose-50 border-rose-200"
                >
                  <Trash2 className="w-3 h-3" /> Delete
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleAddQuestion}
          className="w-full py-2.5 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 text-xs font-bold text-[#2563EB] gap-1.5 justify-center"
        >
          <Plus className="w-4 h-4" /> Add Question
        </Button>
      </div>
    </div>
  );
};
