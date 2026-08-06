import React, { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  RotateCcw,
  Save,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Input } from '../../../components/ui/Input';

import {
  COURSE_FEATURE_CATEGORIES,
  COURSE_FEATURE_DEFINITIONS,
  type CourseFeatureCategory,
  type CourseFeatureDefinition,
} from '../../course-features/config/course-features';
import { useCourseFeaturesStore, DEFAULT_COURSE_FEATURES } from '../store/courseFeatures.store';

import { FeatureCreditSummaryBar } from '../../course-features/components/FeatureCreditSummaryBar';
import { FeatureCard } from '../../course-features/components/FeatureCard';
import { FeatureConfigDrawer } from '../../course-features/components/FeatureConfigDrawer';
import { DependencyConfirmModal } from '../../course-features/components/DependencyConfirmModal';

export const CourseFeaturesPage: React.FC = () => {
  const params = useParams<{ courseUuid?: string }>();
  const courseUuid = params.courseUuid || '550e8400-e29b-41d4-a716-446655440000';

  const getCourseFeatures = useCourseFeaturesStore((state) => state.getCourseFeatures);
  const updateCourseFeatures = useCourseFeaturesStore((state) => state.updateCourseFeatures);

  const initialFeatures = getCourseFeatures(courseUuid);

  // Local editing state for unsaved changes
  const [localFeatures, setLocalFeatures] = useState<Record<string, boolean>>(() => {
    return { ...initialFeatures };
  });

  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'enabled' | 'disabled' | 'recommended' | 'premium'>('all');

  // Modals
  const [configFeature, setConfigFeature] = useState<CourseFeatureDefinition | null>(null);
  const [depModal, setDepModal] = useState<{
    isOpen: boolean;
    title: string;
    description: string;
    impactedFeatures: string[];
    actionType: 'enable_parents' | 'disable_dependents' | 'data_warning';
    pendingToggleId?: string;
    pendingState?: boolean;
  }>({
    isOpen: false,
    title: '',
    description: '',
    impactedFeatures: [],
    actionType: 'enable_parents',
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    setLocalFeatures({ ...getCourseFeatures(courseUuid) });
  }, [courseUuid]);

  // Compute Unsaved Count
  const unsavedCount = useMemo(() => {
    let count = 0;
    const currentStore = getCourseFeatures(courseUuid);
    Object.keys(localFeatures).forEach((key) => {
      if ((localFeatures as any)[key] !== (currentStore as any)[key]) {
        count++;
      }
    });
    return count;
  }, [localFeatures, courseUuid, getCourseFeatures]);

  // Compute Live Credit Impact
  const baseCredit = 10;
  const featureAddonsCost = useMemo(() => {
    return COURSE_FEATURE_DEFINITIONS.reduce((sum, f) => {
      if (localFeatures[f.id] && !f.isRequired) {
        return sum + f.creditCostPerStudent;
      }
      return sum;
    }, 0);
  }, [localFeatures]);

  const finalCreditsPerStudent = baseCredit + featureAddonsCost;

  const enabledFeaturesCount = useMemo(() => {
    return Object.values(localFeatures).filter(Boolean).length;
  }, [localFeatures]);

  // Handle Feature Toggle with Dependency Validation
  const handleToggle = (featureId: string, newState: boolean) => {
    const targetDef = COURSE_FEATURE_DEFINITIONS.find((f) => f.id === featureId);
    if (!targetDef) return;

    // Case 1: Enabling a feature that has parent dependencies
    if (newState && targetDef.dependencies && targetDef.dependencies.length > 0) {
      const missingParents = targetDef.dependencies.filter((pId) => !localFeatures[pId]);
      if (missingParents.length > 0) {
        setDepModal({
          isOpen: true,
          title: `Enable Required Dependencies for ${targetDef.name}?`,
          description: `${targetDef.name} requires parent feature(s) to function. The following features will also be enabled:`,
          impactedFeatures: missingParents.map((pId) => COURSE_FEATURE_DEFINITIONS.find((f) => f.id === pId)?.name || pId),
          actionType: 'enable_parents',
          pendingToggleId: featureId,
          pendingState: true,
        });
        return;
      }
    }

    // Case 2: Disabling a parent feature that has dependent features enabled
    if (!newState) {
      const activeDependents = COURSE_FEATURE_DEFINITIONS.filter(
        (f) => f.dependencies && f.dependencies.includes(featureId) && localFeatures[f.id]
      );
      if (activeDependents.length > 0) {
        setDepModal({
          isOpen: true,
          title: `Disable ${targetDef.name} & Dependent Features?`,
          description: `Disabling ${targetDef.name} will also disable the following active features that depend on it:`,
          impactedFeatures: activeDependents.map((f) => f.name),
          actionType: 'disable_dependents',
          pendingToggleId: featureId,
          pendingState: false,
        });
        return;
      }
    }

    // Direct toggle
    setLocalFeatures((prev) => ({ ...prev, [featureId]: newState }));
  };

  const handleConfirmDepAction = () => {
    const { pendingToggleId, pendingState, actionType } = depModal;
    if (!pendingToggleId) return;

    if (actionType === 'enable_parents' && pendingState) {
      const targetDef = COURSE_FEATURE_DEFINITIONS.find((f) => f.id === pendingToggleId);
      const updates: Record<string, boolean> = { [pendingToggleId]: true };
      if (targetDef?.dependencies) {
        targetDef.dependencies.forEach((pId) => {
          updates[pId] = true;
        });
      }
      setLocalFeatures((prev) => ({ ...prev, ...updates }));
    } else if (actionType === 'disable_dependents' && !pendingState) {
      const activeDependents = COURSE_FEATURE_DEFINITIONS.filter(
        (f) => f.dependencies && f.dependencies.includes(pendingToggleId) && localFeatures[f.id]
      );
      const updates: Record<string, boolean> = { [pendingToggleId]: false };
      activeDependents.forEach((d) => {
        updates[d.id] = false;
      });
      setLocalFeatures((prev) => ({ ...prev, ...updates }));
    }
  };

  // Save Changes to Store
  const handleSaveChanges = () => {
    updateCourseFeatures(courseUuid, localFeatures as any);
    setToastMessage('Course feature configurations saved successfully!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reset to Recommended Defaults
  const handleResetRecommended = () => {
    const recommendedState: Record<string, boolean> = {};
    COURSE_FEATURE_DEFINITIONS.forEach((f) => {
      recommendedState[f.id] = !!(f.isRequired || f.isRecommended);
    });
    setLocalFeatures(recommendedState);
    setToastMessage('Reset features to recommended course defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Filtering
  const filteredFeatures = useMemo(() => {
    let list = COURSE_FEATURE_DEFINITIONS;

    if (activeCategory !== 'All') {
      list = list.filter((f) => f.category === activeCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q) ||
          f.category.toLowerCase().includes(q)
      );
    }

    if (statusFilter === 'enabled') {
      list = list.filter((f) => localFeatures[f.id]);
    } else if (statusFilter === 'disabled') {
      list = list.filter((f) => !localFeatures[f.id]);
    } else if (statusFilter === 'recommended') {
      list = list.filter((f) => f.isRecommended);
    } else if (statusFilter === 'premium') {
      list = list.filter((f) => f.isPremium);
    }

    return list;
  }, [activeCategory, searchQuery, statusFilter, localFeatures]);

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white font-extrabold text-xs px-4 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-800 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-black text-slate-900 tracking-tight">Course Features &amp; Capability Control</h1>
              <Badge variant="info" size="sm" className="font-bold">
                {enabledFeaturesCount} Active Tools
              </Badge>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Enable learning tools, assessment engines, communication modules, and report tabs for this course.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetRecommended}
              className="h-9 text-xs font-semibold text-slate-700"
              leftIcon={<RotateCcw className="w-3.5 h-3.5 text-slate-500" />}
            >
              Reset Recommended
            </Button>

            <Button
              size="sm"
              onClick={handleSaveChanges}
              disabled={unsavedCount === 0}
              className={`h-9 font-extrabold text-xs px-5 shadow-xs transition-all ${
                unsavedCount > 0
                  ? 'bg-[#2563EB] text-white hover:bg-blue-700'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Save Changes {unsavedCount > 0 ? `(${unsavedCount})` : ''}
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. STICKY LIVE CREDIT SUMMARY BAR */}
      <FeatureCreditSummaryBar
        baseCredit={baseCredit}
        featureAddonsCost={featureAddonsCost}
        finalCreditsPerStudent={finalCreditsPerStudent}
        enabledFeaturesCount={enabledFeaturesCount}
        unsavedCount={unsavedCount}
      />

      {/* 3. SEARCH & CATEGORY CHIPS */}
      <div className="space-y-3 font-sans text-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="w-full sm:w-80">
            <Input
              placeholder="Search course features, modules, capabilities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
              size="sm"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {[
              { id: 'all', label: 'All Statuses' },
              { id: 'enabled', label: 'Enabled' },
              { id: 'disabled', label: 'Disabled' },
              { id: 'recommended', label: 'Recommended' },
              { id: 'premium', label: 'Premium' },
            ].map((st) => (
              <button
                key={st.id}
                type="button"
                onClick={() => setStatusFilter(st.id as any)}
                className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                  statusFilter === st.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fixed Order Category Tabs */}
        <div className="bg-white border border-slate-200/90 p-1.5 rounded-2xl shadow-2xs flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`px-3.5 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              activeCategory === 'All'
                ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            All Categories ({COURSE_FEATURE_DEFINITIONS.length})
          </button>

          {COURSE_FEATURE_CATEGORIES.map((cat) => {
            const isSelected = activeCategory === cat;
            const count = COURSE_FEATURE_DEFINITIONS.filter((f) => f.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-2 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-xs font-extrabold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. FEATURE CARDS GRID */}
      {filteredFeatures.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFeatures.map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              isEnabled={!!localFeatures[feature.id]}
              onToggle={handleToggle}
              onConfigure={(f) => setConfigFeature(f)}
            />
          ))}
        </div>
      ) : (
        <Card padding="lg" className="bg-white border border-slate-200 text-center py-14 space-y-2">
          <SlidersHorizontal className="w-8 h-8 text-slate-400 mx-auto" />
          <h3 className="text-sm font-extrabold text-slate-900">No Features Found</h3>
          <p className="text-xs text-slate-500">Try adjusting your search query or category filter chips.</p>
        </Card>
      )}

      {/* CONFIGURATION DRAWER */}
      <FeatureConfigDrawer
        isOpen={!!configFeature}
        onClose={() => setConfigFeature(null)}
        feature={configFeature}
        onSaveSettings={(fId, settings) => {
          setToastMessage(`Updated configuration settings for feature.`);
          setTimeout(() => setToastMessage(null), 3000);
        }}
      />

      {/* DEPENDENCY VALIDATION MODAL */}
      <DependencyConfirmModal
        isOpen={depModal.isOpen}
        onClose={() => setDepModal((prev) => ({ ...prev, isOpen: false }))}
        title={depModal.title}
        description={depModal.description}
        impactedFeatures={depModal.impactedFeatures}
        actionType={depModal.actionType}
        onConfirm={handleConfirmDepAction}
      />
    </div>
  );
};
