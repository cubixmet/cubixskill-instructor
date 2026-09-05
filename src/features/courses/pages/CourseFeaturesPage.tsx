import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import {
  SlidersHorizontal,
  Search,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Video,
  HelpCircle,
  FileText,
  MessageSquare,
  Bell,
  Award,
  Tag,
  Wallet,
  Download,
  BarChart2,
  Lock,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { courseFeaturesService, CourseFeatureItem } from '../../../services/courseFeatures.service';
import { Button } from '../../../components/ui/Button';
import { EmptyState } from '../../../components/ui/EmptyState';
import { parseApiError } from '../../../api/errors';
import { normalizeCourseId } from '../../../utils/courseValidation.utils';
import { CreditUsageConfirmationModal } from '../../../components/credits/CreditUsageConfirmationModal';

export const CourseFeaturesPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { courseUuid, courseId } = useParams<{ courseUuid?: string; courseId?: string }>();
  const activeCourseId = normalizeCourseId(courseUuid || courseId);

  // Detect if this is the initial post-creation setup step
  const isInitialSetup = Boolean(location.state?.isInitialSetup || location.search.includes('setup=true'));

  const [features, setFeatures] = useState<CourseFeatureItem[]>([]);
  const [localSelections, setLocalSelections] = useState<Record<string, boolean>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadFeatures = useCallback(async () => {
    if (!activeCourseId) {
      setError('Course ID is missing.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const data = await courseFeaturesService.list(activeCourseId);
      setFeatures(data);
      const initialMap: Record<string, boolean> = {};
      data.forEach((f) => {
        initialMap[f.code] = f.effective_enabled;
      });
      setLocalSelections(initialMap);
    } catch (err: any) {
      console.error('Failed to load course features:', err);
      const parsed = parseApiError(err);
      setError(parsed.message || 'Failed to load course feature settings.');
    } finally {
      setIsLoading(false);
    }
  }, [activeCourseId]);

  useEffect(() => {
    loadFeatures();
  }, [loadFeatures]);

  const handleToggleLocal = (feature: CourseFeatureItem) => {
    if (!feature.can_configure || !feature.academy_enabled) {
      showToast('This feature is not included in your Academy plan.');
      return;
    }
    setLocalSelections((prev) => ({
      ...prev,
      [feature.code]: !prev[feature.code],
    }));
  };

  const [isCreditConfirmOpen, setIsCreditConfirmOpen] = useState<boolean>(false);

  const handleOpenCreditConfirm = () => {
    if (!activeCourseId || isSaving) return;
    setIsCreditConfirmOpen(true);
  };

  const handleConfirmSave = async () => {
    if (!activeCourseId || isSaving) return;
    setIsSaving(true);
    try {
      await courseFeaturesService.saveBulk(activeCourseId, localSelections);
      showToast('Course features saved successfully.');
      setIsCreditConfirmOpen(false);
      navigate(`/courses/${activeCourseId}/overview`);
    } catch (err: any) {
      console.error('Failed to bulk save course features:', err);
      const parsed = parseApiError(err);
      showToast(parsed.message || 'Failed to save course feature configuration.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSkip = () => {
    if (!activeCourseId) return;
    navigate(`/courses/${activeCourseId}/overview`);
  };

  const categories = useMemo(() => {
    const set = new Set<string>();
    features.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [features]);

  const filteredFeatures = useMemo(() => {
    let list = features;
    if (activeCategory !== 'All') {
      list = list.filter((f) => f.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          f.code.toLowerCase().includes(q) ||
          f.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [features, activeCategory, searchQuery]);

  const baseCreditsPerStudent = 1;
  const activeFeatureCreditsSum = useMemo(() => {
    return features.reduce((sum, f) => {
      if (localSelections[f.code]) {
        return sum + (f.credit_cost ?? f.pricing?.credit_cost ?? 0);
      }
      return sum;
    }, 0);
  }, [features, localSelections]);

  const totalCourseCreditsPerStudent = baseCreditsPerStudent + activeFeatureCreditsSum;

  const getFeatureIcon = (code: string) => {
    switch (code) {
      case 'LESSONS': return <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
      case 'FEE_COLLECTION': return <Wallet className="w-4 h-4 text-teal-600" />;
      case 'COURSE_ANNOUNCEMENT': return <Bell className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
      case 'LIVE_CLASS': return <Video className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'EMAIL_DELIVERY': return <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
      case 'COMPLETION_CERTIFICATE': return <Award className="w-4 h-4 text-amber-500" />;
      case 'COURSE_DISCUSSION': return <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />;
      case 'ONE_TO_ONE_SESSION': return <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      default: return <SlidersHorizontal className="w-4 h-4 text-slate-500" />;
    }
  };

  if (isLoading && features.length === 0) {
    return (
      <div className="space-y-4 p-4 font-sans text-xs text-left max-w-4xl mx-auto">
        <div className="h-12 bg-slate-100 dark:bg-[#111827] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
          <div className="h-32 bg-slate-100 dark:bg-[#111827] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (error && features.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#111827] rounded-2xl border border-rose-200 text-center space-y-3 font-normal max-w-md mx-auto my-8">
        <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">Unable to Load Course Features</h3>
        <p className="text-xs text-slate-500">{error}</p>
        <Button size="sm" onClick={loadFeatures} leftIcon={<RefreshCw className="w-3.5 h-3.5" />}>
          Retry Loading
        </Button>
      </div>
    );
  }

  const selectedCount = Object.values(localSelections).filter(Boolean).length;

  return (
    <div className="space-y-5 font-sans text-xs text-slate-900 dark:text-slate-100 text-left pb-28 max-w-4xl mx-auto font-normal">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-normal px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Post-Create Wizard Banner */}
      {isInitialSetup && (
        <div className="p-4 bg-blue-50 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800/60 flex items-center justify-between gap-3 font-normal">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 text-white rounded-xl">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-semibold text-sm text-slate-900 dark:text-white">
                Course Created Successfully!
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300">
                Step 1 of 4: Select the optional capabilities you want to enable for this course.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block px-3 py-1 bg-white dark:bg-[#111827] rounded-xl text-xs font-medium text-blue-600 border border-blue-200">
            Step 1 / 4
          </span>
        </div>
      )}

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-blue-50 dark:bg-blue-950/40 text-blue-600 rounded-xl">
              <SlidersHorizontal className="w-4 h-4" />
            </div>
            <h1 className="text-base font-semibold text-slate-900 dark:text-white">
              Course Capability Configuration
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-normal bg-blue-50 text-blue-700 border border-blue-200">
              {selectedCount} Selected
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
            Choose features to enable for this course. Configure pricing rates centrally in Super Admin Control Panel.
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <Button
            size="sm"
            onClick={loadFeatures}
            variant="outline"
            className="h-9 font-normal border-slate-200 dark:border-[#334155]"
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh
          </Button>
        </div>
      </div>

      {/* PER STUDENT PRICING CALCULATOR BANNER */}
      <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-blue-200 dark:border-blue-900/50 shadow-2xs space-y-3 font-normal">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-[#263244] pb-3">
          <div>
            <h2 className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Course Credit Pricing Calculator
            </h2>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
              Platform usage is charged per enrolled student (Base Student Access + Enabled Features).
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-3.5 py-1.5 rounded-xl shrink-0 text-right">
            <span className="text-[10px] text-blue-600 dark:text-blue-400 block font-normal">Per Student Credit Rate</span>
            <span className="text-sm font-bold text-blue-700 dark:text-blue-300">
              {totalCourseCreditsPerStudent} Credits / Student
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-normal">
          <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
            <span className="text-slate-500 block text-[10px]">Base Student Access</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{baseCreditsPerStudent} Cr / Student</strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
            <span className="text-slate-500 block text-[10px]">Active Features Sum</span>
            <strong className="text-slate-900 dark:text-white font-semibold">+{activeFeatureCreditsSum} Cr / Student</strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
            <span className="text-slate-500 block text-[10px]">10 Enrolled Students</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{totalCourseCreditsPerStudent * 10} Credits Total</strong>
          </div>
          <div className="bg-slate-50 dark:bg-[#0F172A] p-2.5 rounded-xl border border-slate-200 dark:border-[#263244]">
            <span className="text-slate-500 block text-[10px]">100 Enrolled Students</span>
            <strong className="text-slate-900 dark:text-white font-semibold">{totalCourseCreditsPerStudent * 100} Credits Total</strong>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200 dark:border-[#263244] shadow-2xs">
        <div className="flex-1 max-w-md relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search course capabilities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-[#334155] bg-white dark:bg-[#0F172A] text-xs font-normal text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => setActiveCategory('All')}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-normal transition-all cursor-pointer whitespace-nowrap ${
              activeCategory === 'All'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            All Features ({features.length})
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-[11px] font-normal transition-all cursor-pointer whitespace-nowrap ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Feature Cards Grid */}
      {filteredFeatures.length === 0 ? (
        <EmptyState
          title="No feature settings found"
          description="No course capabilities match your search query."
          icon={SlidersHorizontal}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredFeatures.map((feat) => {
            const isSelected = Boolean(localSelections[feat.code]);
            const isAcademyDisabled = !feat.academy_enabled;

            return (
              <div
                key={feat.code}
                onClick={() => handleToggleLocal(feat)}
                className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 font-normal cursor-pointer ${
                  isSelected
                    ? 'bg-white dark:bg-[#111827] border-blue-200 dark:border-blue-900/50 shadow-2xs ring-1 ring-blue-500/10'
                    : 'bg-slate-50/70 dark:bg-[#0F172A]/50 border-slate-200 dark:border-[#263244]'
                }`}
              >
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  <div className="p-2 bg-slate-100 dark:bg-[#0F172A] rounded-xl border border-slate-200 dark:border-[#334155] shrink-0 mt-0.5">
                    {getFeatureIcon(feat.code)}
                  </div>
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-xs text-slate-900 dark:text-white">
                        {feat.name}
                      </h3>
                      {isAcademyDisabled && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-normal bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" /> Plan Restricted
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
                      {feat.description}
                    </p>

                    {/* REAL BACKEND PRICING BADGE */}
                    <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                      {feat.pricing && feat.pricing.is_active === false ? (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                          Currently Unavailable
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                          {feat.display_text || feat.pricing?.display_text || `${(feat.credit_cost ?? feat.pricing?.credit_cost ?? 0) > 0 ? '+' : ''}${feat.credit_cost ?? feat.pricing?.credit_cost ?? 0} Credits / ${feat.billing_unit || feat.pricing?.billing_unit}`}
                        </span>
                      )}
                    </div>

                    {isAcademyDisabled && (
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-normal pt-0.5">
                        Not available for your Academy subscription plan.
                      </p>
                    )}
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2 pt-0.5" onClick={(e) => e.stopPropagation()}>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isAcademyDisabled}
                      onChange={() => handleToggleLocal(feat)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600 peer-disabled:opacity-40" />
                  </label>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border-t border-slate-200 dark:border-[#263244] p-3 shadow-lg">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleSkip}
            className="h-10 font-normal border-slate-200 dark:border-[#334155] px-4"
          >
            Skip for Now
          </Button>

          <Button
            size="sm"
            disabled={isSaving}
            onClick={handleOpenCreditConfirm}
            className="h-10 font-normal bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-6 flex-1 sm:flex-initial justify-center shadow-xs"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {isSaving ? 'Saving & Continuing...' : 'Save & Continue'}
          </Button>
        </div>
      </div>

      {/* Credit Usage Confirmation Modal */}
      <CreditUsageConfirmationModal
        isOpen={isCreditConfirmOpen}
        onClose={() => setIsCreditConfirmOpen(false)}
        onConfirm={handleConfirmSave}
        resourceType="COURSE_FEATURE"
        resourceId="LIVE_CLASS"
        courseId={activeCourseId || undefined}
        dailyCost={totalCourseCreditsPerStudent}
        isSubmitting={isSaving}
        title="Daily Credit Usage"
        description="Course features and storage consumption are billed daily based on active Academy usage."
      />
    </div>
  );
};
