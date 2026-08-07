import React from 'react';
import { Plus, Trash2, Copy, ArrowUp, ArrowDown, Award, HelpCircle } from 'lucide-react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import type { RubricCriterion } from '../../../types/assignment.types';

interface RubricBuilderProps {
  criteria: RubricCriterion[];
  onChange: (updated: RubricCriterion[]) => void;
}

export const RubricBuilder: React.FC<RubricBuilderProps> = ({ criteria, onChange }) => {
  const handleAddCriterion = () => {
    const newCriterion: RubricCriterion = {
      id: `rub-${Date.now()}`,
      title: 'New Evaluation Criterion',
      description: 'Describe criteria expectations for full marks...',
      maxMarks: 20,
    };
    onChange([...criteria, newCriterion]);
  };

  const handleUpdateCriterion = <K extends keyof RubricCriterion>(id: string, field: K, value: RubricCriterion[K]) => {
    onChange(
      criteria.map((c) => (c.id === id ? { ...c, [field]: value } : c))
    );
  };

  const handleDeleteCriterion = (id: string) => {
    onChange(criteria.filter((c) => c.id !== id));
  };

  const handleDuplicateCriterion = (criterion: RubricCriterion) => {
    const duplicated: RubricCriterion = {
      ...criterion,
      id: `rub-${Date.now()}`,
      title: `${criterion.title} (Copy)`,
    };
    onChange([...criteria, duplicated]);
  };

  const handleMove = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === criteria.length - 1) return;
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = [...criteria];
    const [moved] = updated.splice(index, 1);
    updated.splice(targetIdx, 0, moved);
    onChange(updated);
  };

  const totalRubricMarks = criteria.reduce((sum, c) => sum + (Number(c.maxMarks) || 0), 0);

  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-left text-xs">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-blue-950 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-blue-600" />
            Rubric Criteria Builder
          </h4>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Define criteria and weightage for objective instructor evaluation.
          </p>
        </div>
        <div className="bg-white px-3 py-1 rounded-xl border border-slate-200 text-right">
          <span className="text-[10px] text-slate-400 font-bold block">Total Rubric Marks</span>
          <span className="text-blue-700 font-black text-sm">{totalRubricMarks} Marks</span>
        </div>
      </div>

      {criteria.length === 0 ? (
        <div className="p-6 bg-white rounded-xl border border-dashed border-slate-300 text-center space-y-2">
          <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-extrabold text-slate-700 text-xs">No Rubric Criteria Added Yet</p>
          <p className="text-[10px] text-slate-400">Add criteria to streamline manual grading and student feedback.</p>
          <Button size="sm" onClick={handleAddCriterion} className="bg-blue-600 text-white font-bold mt-2">
            <Plus className="w-4 h-4 mr-1" /> Add First Criterion
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {criteria.map((c, index) => (
            <div key={c.id} className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-2 shadow-2xs">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-slate-100 font-black text-[10px] text-slate-600 flex items-center justify-center shrink-0">
                  {index + 1}
                </span>

                <Input
                  value={c.title}
                  onChange={(e) => handleUpdateCriterion(c.id, 'title', e.target.value)}
                  placeholder="Criterion Title (e.g. Code Structure)"
                  className="w-full font-extrabold text-xs"
                />

                <div className="flex items-center gap-1 shrink-0">
                  <span className="text-[10px] font-bold text-slate-400">Max Marks:</span>
                  <Input
                    type="number"
                    min={1}
                    value={c.maxMarks}
                    onChange={(e) => handleUpdateCriterion(c.id, 'maxMarks', Number(e.target.value))}
                    className="w-20 font-bold text-blue-700 text-center"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'up')}
                    disabled={index === 0}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(index, 'down')}
                    disabled={index === criteria.length - 1}
                    className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDuplicateCriterion(c)}
                    className="p-1 text-slate-400 hover:text-blue-600 cursor-pointer"
                    title="Duplicate Criterion"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteCriterion(c.id)}
                    className="p-1 text-slate-400 hover:text-red-600 cursor-pointer"
                    title="Delete Criterion"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <Input
                value={c.description}
                onChange={(e) => handleUpdateCriterion(c.id, 'description', e.target.value)}
                placeholder="Description of what is expected for full marks..."
                className="w-full text-[11px]"
              />
            </div>
          ))}

          <Button size="sm" variant="outline" onClick={handleAddCriterion} className="w-full border-dashed font-extrabold text-blue-600">
            <Plus className="w-4 h-4 mr-1" /> Add Criterion
          </Button>
        </div>
      )}
    </div>
  );
};
