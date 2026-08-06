import React, { useState, useMemo } from 'react';
import type { FeatureCategoryName, CalculationResult, CreditCalculatorProps } from './credit-calculator/types';
import { ALL_FEATURES, CATEGORIES, getSortedFeatures } from './credit-calculator/featureData';
import { CreditCalculatorHeader } from './credit-calculator/CreditCalculatorHeader';
import { BaseCreditCard } from './credit-calculator/BaseCreditCard';
import { FeatureSearchFilters } from './credit-calculator/FeatureSearchFilters';
import { FeatureCategory } from './credit-calculator/FeatureCategory';
import { EnrollmentCountSelector } from './credit-calculator/EnrollmentCountSelector';
import { CreditSummaryCard } from './credit-calculator/CreditSummaryCard';
import { CreditBreakdownModal } from './credit-calculator/CreditBreakdownModal';
import { EnrollmentConfirmationDialog } from './credit-calculator/EnrollmentConfirmationDialog';
import { Check, Info, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CreditCalculator: React.FC<CreditCalculatorProps> = ({
  initialEnrolledCount = 50,
  availableBalance: initialAvailableBalance = 12450,
  courseTitle = 'Fullstack React 19 & TypeScript Masterclass',
  onSelectPackage,
  onConfirmEnrollment,
}) => {
  // 1. Core State
  const [studentCount, setStudentCount] = useState<number>(initialEnrolledCount);
  const [availableBalance, setAvailableBalance] = useState<number>(initialAvailableBalance);

  // Default selected features
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<Set<string>>(() => {
    const recommendedIds = ALL_FEATURES.filter((f) => f.recommended).map((f) => f.id);
    return new Set(recommendedIds);
  });

  // Search and Filtering State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<FeatureCategoryName | 'All'>('All');
  const [showSelectedOnly, setShowSelectedOnly] = useState(false);

  // Modals & Feedback State
  const [isBreakdownOpen, setIsBreakdownOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Helper Toast Alert
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // 2. Feature Toggle Actions
  const handleToggleFeature = (id: string) => {
    setSelectedFeatureIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleSelectRecommended = () => {
    const recommendedIds = ALL_FEATURES.filter((f) => f.recommended).map((f) => f.id);
    setSelectedFeatureIds(new Set(recommendedIds));
    showToast('Recommended feature stack selected!');
  };

  const handleClearOptional = () => {
    setSelectedFeatureIds(new Set());
    showToast('Optional features cleared. Base student credit remains mandatory.');
  };

  // Reset Filters ONLY resets search/category/selected-only filters, NOT selected features!
  const handleResetFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
    setShowSelectedOnly(false);
    showToast('Filters reset. All features displayed.');
  };

  // Reset Calculator Defaults resets features to defaults & student count
  const handleResetCalculatorDefaults = () => {
    const recommendedIds = ALL_FEATURES.filter((f) => f.recommended).map((f) => f.id);
    setSelectedFeatureIds(new Set(recommendedIds));
    setStudentCount(initialEnrolledCount);
    setSearchQuery('');
    setActiveCategory('All');
    setShowSelectedOnly(false);
    showToast('Calculator reset to default configuration.');
  };

  // 3. Dynamic Calculation Engine
  const calculation: CalculationResult = useMemo(() => {
    const baseCreditPerStudent = 10;

    let selectedFeaturesCreditPerStudent = 0;
    const breakdownList: CalculationResult['breakdownList'] = [];

    // Ensure sorted feature processing
    const sortedAllFeatures = getSortedFeatures(ALL_FEATURES);

    sortedAllFeatures.forEach((feature) => {
      if (selectedFeatureIds.has(feature.id)) {
        selectedFeaturesCreditPerStudent += feature.creditCost;
        breakdownList.push({
          featureId: feature.id,
          name: feature.name,
          category: feature.category,
          costPerStudent: feature.creditCost,
          totalCostForStudents: feature.creditCost * studentCount,
        });
      }
    });

    const totalCreditPerStudent = baseCreditPerStudent + selectedFeaturesCreditPerStudent;
    const totalRequiredCredits = totalCreditPerStudent * studentCount;
    const remainingBalance = availableBalance - totalRequiredCredits;
    const shortageCredits = remainingBalance < 0 ? Math.abs(remainingBalance) : 0;

    let status: CalculationResult['status'] = 'healthy';
    if (remainingBalance < 0) {
      status = 'insufficient';
    } else if (remainingBalance < 500) {
      status = 'low';
    }

    return {
      baseCreditPerStudent,
      selectedFeaturesCreditPerStudent,
      totalCreditPerStudent,
      studentCount,
      totalRequiredCredits,
      availableBalance,
      remainingBalance,
      shortageCredits,
      status,
      breakdownList,
    };
  }, [selectedFeatureIds, studentCount, availableBalance]);

  // 4. Filtered & Fixed-Ordered Features Grouping
  const filteredCategoryGroups = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    const sortedFeatures = getSortedFeatures(ALL_FEATURES);

    return CATEGORIES.map((catName) => {
      let catFeatures = sortedFeatures.filter((f) => f.category === catName);

      if (activeCategory !== 'All' && activeCategory !== catName) {
        return { categoryName: catName, features: [] };
      }

      if (q) {
        catFeatures = catFeatures.filter(
          (f) =>
            f.name.toLowerCase().includes(q) ||
            f.description.toLowerCase().includes(q) ||
            f.category.toLowerCase().includes(q)
        );
      }

      if (showSelectedOnly) {
        catFeatures = catFeatures.filter((f) => selectedFeatureIds.has(f.id));
      }

      return {
        categoryName: catName,
        features: catFeatures,
      };
    }).filter((g) => g.features.length > 0);
  }, [searchQuery, activeCategory, showSelectedOnly, selectedFeatureIds]);

  // Check if filtering active
  const isFilterActive = Boolean(searchQuery || activeCategory !== 'All' || showSelectedOnly);

  // 5. Enrollment Deduction Success Callback
  const handleConfirmSuccess = (details: {
    studentCount: number;
    totalCredits: number;
    remainingBalance: number;
  }) => {
    setAvailableBalance(details.remainingBalance);
    onConfirmEnrollment?.(details);
    showToast(`Deducted ${details.totalCredits.toLocaleString()} credits for ${details.studentCount} students.`);
  };

  return (
    <div className="bg-white border border-slate-200/80 rounded-3xl p-4 sm:p-6 shadow-sm space-y-6 text-left max-w-7xl mx-auto relative overflow-hidden">
      {/* Toast Notification Alert */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-4 right-4 z-50 px-4 py-2.5 bg-slate-900 text-white text-xs font-bold rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Section */}
      <CreditCalculatorHeader />

      {/* Two-Column Responsive Desktop Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-6 items-start">
        {/* Left Column: Feature Selection Configurator (Width ~65%) */}
        <div className="space-y-6 min-w-0">
          {/* Base Credit Card */}
          <BaseCreditCard />

          {/* Student Enrollment Count Estimator */}
          <EnrollmentCountSelector
            studentCount={studentCount}
            onStudentCountChange={setStudentCount}
          />

          {/* Search, Filter & Quick Actions Bar */}
          <FeatureSearchFilters
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            showSelectedOnly={showSelectedOnly}
            onToggleShowSelectedOnly={() => setShowSelectedOnly((prev) => !prev)}
            totalSelectedCount={selectedFeatureIds.size}
            totalFeaturesCount={ALL_FEATURES.length}
            onSelectRecommended={handleSelectRecommended}
            onClearOptional={handleClearOptional}
          />

          {/* Feature Categories Accordions */}
          {filteredCategoryGroups.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-slate-500 text-xs space-y-2">
              <Info className="w-6 h-6 text-slate-400 mx-auto" />
              <p className="font-bold text-slate-700">No matching features found</p>
              <p>
                {searchQuery
                  ? `No features match "${searchQuery}".`
                  : showSelectedOnly
                  ? 'No optional features selected.'
                  : 'No features found in this category.'}
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="mt-2 px-3.5 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredCategoryGroups.map((group) => (
                <FeatureCategory
                  key={group.categoryName}
                  categoryName={group.categoryName}
                  features={group.features}
                  selectedFeatureIds={selectedFeatureIds}
                  onToggleFeature={handleToggleFeature}
                />
              ))}
            </div>
          )}

          {/* Bottom Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-100 text-xs text-slate-500">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={!isFilterActive}
                className="font-bold text-blue-600 hover:underline transition-colors cursor-pointer disabled:opacity-40 disabled:no-underline"
              >
                Reset Filters
              </button>
              <span className="text-slate-300">|</span>
              <button
                type="button"
                onClick={handleResetCalculatorDefaults}
                className="flex items-center gap-1.5 font-bold text-slate-600 hover:text-rose-600 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Calculator Defaults</span>
              </button>
            </div>

            <span>
              Configured for {selectedFeatureIds.size + 1} features ({calculation.totalCreditPerStudent} credits / student)
            </span>
          </div>
        </div>

        {/* Right Column: Sticky Summary Card (Width ~35% - 380px on 1024px, 420px on 1440px+) */}
        <div>
          <CreditSummaryCard
            calculation={calculation}
            onOpenBreakdown={() => setIsBreakdownOpen(true)}
            onConfirmEnrollment={() => setIsConfirmDialogOpen(true)}
            onSaveConfig={() => showToast('Feature configuration saved successfully!')}
            onBuyCredits={(needed) => {
              if (onSelectPackage) {
                onSelectPackage(needed);
              } else {
                showToast(`Redirecting to credit purchase for ${needed} credits...`);
              }
            }}
          />
        </div>
      </div>

      {/* Full Cost Breakdown Modal */}
      <CreditBreakdownModal
        isOpen={isBreakdownOpen}
        onClose={() => setIsBreakdownOpen(false)}
        calculation={calculation}
      />

      {/* Enrollment Confirmation Dialog */}
      <EnrollmentConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        calculation={calculation}
        courseTitle={courseTitle}
        onConfirmSuccess={handleConfirmSuccess}
      />
    </div>
  );
};
