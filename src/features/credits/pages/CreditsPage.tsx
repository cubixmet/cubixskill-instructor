import React, { useState, useMemo } from 'react';
import {
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  CreditCard,
  Download,
  Plus,
  Search,
  Sparkles,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { exportToCsv, type CsvColumn } from '../../../utils/export-csv';

interface CreditTransactionRecord {
  id: string;
  date: string;
  referenceId: string;
  type: 'purchase' | 'usage' | 'refund' | 'bonus' | 'expired';
  credits: number;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
  description: string;
  paymentMethod?: string;
  couponCode?: string;
  taxAmount?: number;
}

const SEED_TRANSACTIONS: CreditTransactionRecord[] = [
  {
    id: 'tx-101',
    date: '2026-08-01 10:30',
    referenceId: 'REF-2026-9912',
    type: 'purchase',
    credits: 5000,
    amount: 7999,
    status: 'completed',
    description: 'Purchased Pro Growth Credit Bundle',
    paymentMethod: 'UPI / Razorpay',
    couponCode: 'CUBIX20',
    taxAmount: 1439,
  },
  {
    id: 'tx-102',
    date: '2026-08-02 14:15',
    referenceId: 'REF-2026-9913',
    type: 'usage',
    credits: -340,
    amount: 0,
    status: 'completed',
    description: 'Enrolled 20 students in React 19 Masterclass',
  },
  {
    id: 'tx-103',
    date: '2026-08-03 09:45',
    referenceId: 'REF-2026-9914',
    type: 'usage',
    credits: -120,
    amount: 0,
    status: 'completed',
    description: 'Video Upload Processing (500MB HD)',
  },
  {
    id: 'tx-104',
    date: '2026-08-04 11:20',
    referenceId: 'REF-2026-9915',
    type: 'bonus',
    credits: 500,
    amount: 0,
    status: 'completed',
    description: 'Pro Growth Bonus Credits Added',
  },
  {
    id: 'tx-105',
    date: '2026-08-05 08:10',
    referenceId: 'REF-2026-9916',
    type: 'usage',
    credits: -32,
    amount: 0,
    status: 'completed',
    description: 'Generated 32 Certificate PDFs',
  },
];

const VALID_COUPONS: Record<string, { type: 'percent' | 'flat'; value: number; label: string }> = {
  CUBIX20: { type: 'percent', value: 20, label: '20% Off Season Discount' },
  WELCOME10: { type: 'percent', value: 10, label: '10% New Instructor Bonus' },
  FESTIVE500: { type: 'flat', value: 500, label: '₹500 Flat Savings' },
};

export const CreditsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'buy' | 'history'>('overview');
  const [availableBalance, setAvailableBalance] = useState<number>(12450);
  const [transactions, setTransactions] = useState<CreditTransactionRecord[]>(SEED_TRANSACTIONS);

  // Buy Credits State
  const [selectedPackId, setSelectedPackId] = useState<string>('pkg-2');
  const [couponCodeInput, setCouponCodeInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; label: string; type: 'percent' | 'flat'; value: number } | null>({
    code: 'CUBIX20',
    label: '20% Off Season Discount',
    type: 'percent',
    value: 20,
  });
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');

  // History State
  const [historyFilter, setHistoryFilter] = useState<'all' | 'purchase' | 'usage' | 'refund' | 'bonus'>('all');
  const [historySearch, setHistorySearch] = useState('');
  const [selectedTx, setSelectedTx] = useState<CreditTransactionRecord | null>(null);
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  const packs = [
    { id: 'pkg-1', name: 'Starter Pack', credits: 1000, bonusCredits: 0, price: 1999 },
    { id: 'pkg-2', name: 'Pro Growth', credits: 5000, bonusCredits: 500, price: 7999, popular: true },
    { id: 'pkg-3', name: 'Business Scale', credits: 15000, bonusCredits: 2500, price: 19999 },
    { id: 'pkg-4', name: 'Enterprise Unlimited', credits: 50000, bonusCredits: 10000, price: 49999 },
  ];

  const selectedPack = packs.find((p) => p.id === selectedPackId) || packs[1];

  // Pricing Math
  const rawPrice = selectedPack.price;
  let discountAmount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percent') {
      discountAmount = Math.round((rawPrice * appliedCoupon.value) / 100);
    } else {
      discountAmount = appliedCoupon.value;
    }
  }
  const subtotalAfterDiscount = Math.max(rawPrice - discountAmount, 0);
  const gstTax = Math.round(subtotalAfterDiscount * 0.18);
  const grandTotal = subtotalAfterDiscount + gstTax;
  const totalCreditsEarned = selectedPack.credits + selectedPack.bonusCredits;

  const handleApplyCoupon = () => {
    const code = couponCodeInput.trim().toUpperCase();
    if (!code) return;

    if (VALID_COUPONS[code]) {
      setAppliedCoupon({ code, ...VALID_COUPONS[code] });
      setCouponError(null);
    } else {
      setCouponError('Invalid or expired coupon code');
    }
  };

  const handleExecutePayment = () => {
    const uuid = crypto.randomUUID();
    const ref = `REF-2026-${uuid.slice(-4).toUpperCase()}`;
    const newTx: CreditTransactionRecord = {
      id: `tx-${uuid}`,
      date: new Date().toLocaleString(),
      referenceId: ref,
      type: 'purchase',
      credits: totalCreditsEarned,
      amount: grandTotal,
      status: 'completed',
      description: `Purchased ${selectedPack.name} Bundle`,
      paymentMethod: paymentMethod === 'upi' ? 'UPI / QR Code' : paymentMethod === 'card' ? 'Credit/Debit Card' : 'Net Banking',
      couponCode: appliedCoupon?.code,
      taxAmount: gstTax,
    };

    setTransactions([newTx, ...transactions]);
    setAvailableBalance((prev) => prev + totalCreditsEarned);
    setIsPaymentModalOpen(false);
    setActiveTab('history');
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter = historyFilter === 'all' ? true : tx.type === historyFilter;
      const matchesSearch =
        tx.description.toLowerCase().includes(historySearch.toLowerCase()) ||
        tx.referenceId.toLowerCase().includes(historySearch.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [transactions, historyFilter, historySearch]);

  const handleDownloadStatement = () => {
    const columns: CsvColumn<CreditTransactionRecord>[] = [
      { header: 'Reference ID', value: (t) => t.referenceId },
      { header: 'Date', value: (t) => t.date },
      { header: 'Type', value: (t) => t.type },
      { header: 'Credits', value: (t) => t.credits },
      { header: 'Amount (₹)', value: (t) => t.amount },
      { header: 'Status', value: (t) => t.status },
      { header: 'Description', value: (t) => t.description },
    ];
    exportToCsv(`credit-statement-${Date.now()}.csv`, filteredTransactions, columns);
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0">
      {/* 1. PAGE HEADER */}
      <Card padding="md" className="bg-white border border-slate-200/90 shadow-2xs w-full max-w-full min-w-0">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <h1 className="text-base sm:text-xl font-medium text-slate-900 tracking-tight">
              Credits
            </h1>
            <p className="text-xs text-slate-500 font-normal leading-relaxed">
              Manage your credit balance and usage.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full sm:w-auto shrink-0 pt-1 sm:pt-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleDownloadStatement}
              leftIcon={<Download className="w-3.5 h-3.5 text-[#2563EB]" />}
              className="h-[38px] min-h-[38px] text-[11.5px] sm:text-xs font-medium text-slate-700 rounded-xl w-full sm:w-auto px-2.5 sm:px-3.5 inline-flex items-center justify-center gap-1.5"
            >
              Statement
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={() => setActiveTab('buy')}
              leftIcon={<Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />}
              className="h-[38px] min-h-[38px] bg-[#2563EB] text-white font-medium text-[11.5px] sm:text-xs px-2.5 sm:px-4 rounded-xl hover:bg-blue-700 w-full sm:w-auto inline-flex items-center justify-center gap-1.5"
            >
              Add Credits
            </Button>
          </div>
        </div>
      </Card>

      {/* 2. TAB NAVIGATION STRIP */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 pb-1 overflow-x-auto no-scrollbar touch-pan-x w-full">
        {[
          { id: 'overview', label: 'Credit Overview' },
          { id: 'buy', label: 'Buy Credits' },
          { id: 'history', label: 'Transaction History' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'overview' | 'buy' | 'history')}
            className={`px-3.5 py-2 text-xs font-medium rounded-xl transition-all cursor-pointer whitespace-nowrap shrink-0 ${
              activeTab === tab.id
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CREDIT OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Summary Metric Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card padding="sm" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-3 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10.5px] font-normal">
                <span>Available Credits</span>
                <Wallet className="w-4 h-4 text-[#2563EB]" />
              </div>
              <span className="text-base sm:text-xl font-medium text-slate-900 block">{availableBalance.toLocaleString()}</span>
              <span className="text-[10px] text-emerald-600 font-normal block truncate">
                ~{Math.floor(availableBalance / 17)} students
              </span>
            </Card>

            <Card padding="sm" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-3 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10.5px] font-normal">
                <span>Used This Month</span>
                <ArrowDownRight className="w-4 h-4 text-rose-600" />
              </div>
              <span className="text-base sm:text-xl font-medium text-rose-600 block">833</span>
              <span className="text-[10px] text-slate-500 font-normal block truncate">Across 4 courses</span>
            </Card>

            <Card padding="sm" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-3 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10.5px] font-normal">
                <span>Purchased</span>
                <ArrowUpRight className="w-4 h-4 text-emerald-600" />
              </div>
              <span className="text-base sm:text-xl font-medium text-slate-900 block">5,500</span>
              <span className="text-[10px] text-slate-500 font-normal block truncate">Last order Aug 01</span>
            </Card>

            <Card padding="sm" className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs p-3 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-[10.5px] font-normal">
                <span>Reserved</span>
                <CreditCard className="w-4 h-4 text-amber-600" />
              </div>
              <span className="text-base sm:text-xl font-medium text-slate-900 block">300</span>
              <span className="text-[10px] text-slate-500 font-normal block truncate">Evaluations pending</span>
            </Card>
          </div>

          {/* CREDIT USAGE BREAKDOWN */}
          <Card padding="md" className="bg-white border border-slate-200/90 rounded-2xl space-y-3 shadow-2xs p-4">
            <h3 className="text-xs sm:text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">
              Credit Usage Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">Video Processing</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">340 Credits</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">Assignment Storage</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">210 Credits</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">Certificate PDF</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">32 Credits</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">Enrollment</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">180 Credits</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">Media Storage</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">55 Credits</span>
              </div>
              <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                <span className="text-slate-500 text-[11px] block font-normal">AI Features</span>
                <span className="text-slate-900 font-medium text-xs sm:text-sm block">16 Credits</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: BUY CREDITS */}
      {activeTab === 'buy' && (
        <div className="space-y-4 sm:space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1 py-1">
            <h2 className="text-sm sm:text-base font-medium text-slate-900">Choose a Credit Package</h2>
            <p className="text-xs text-slate-500 font-normal">
              Purchase credits to enroll students, host video lessons, evaluate assignments, and generate certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#2563EB] shadow-xs'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pack.popular && (
                    <Badge variant="success" size="sm" className="absolute -top-2.5 right-3 bg-[#2563EB] text-white border-none font-medium text-[10px]">
                      Most Popular
                    </Badge>
                  )}

                  <div className="space-y-2">
                    <h3 className="font-medium text-sm text-slate-900">{pack.name}</h3>
                    <div className="space-y-0.5">
                      <span className="text-xl sm:text-2xl font-medium text-[#2563EB] block">
                        {pack.credits.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 font-normal block">Base Credits</span>
                    </div>

                    {pack.bonusCredits > 0 && (
                      <div className="p-1.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 text-[11px] font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>+{pack.bonusCredits.toLocaleString()} Bonus Credits</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-3 border-t border-slate-100 mt-3 space-y-2">
                    <span className="text-base sm:text-lg font-medium text-slate-900 block">₹{pack.price.toLocaleString()}</span>
                    <Button
                      type="button"
                      size="sm"
                      className={`w-full h-9 text-xs font-medium rounded-xl ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-900 hover:bg-blue-50 hover:text-[#2563EB]'
                      }`}
                    >
                      {isSelected ? 'Selected' : 'Select Pack'}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* COUPON CODE & PAYMENT SUMMARY PANEL */}
          <Card padding="lg" className="bg-white border border-slate-200/90 rounded-2xl max-w-2xl mx-auto space-y-4 shadow-2xs p-4 sm:p-6 text-left">
            <h3 className="text-xs sm:text-sm font-medium text-slate-900 border-b border-slate-100 pb-2">Order &amp; Payment Summary</h3>

            {/* Coupon Code Section */}
            <div className="space-y-2 text-xs">
              <label className="block font-medium text-slate-900">Have a Coupon Code?</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  placeholder="Try CUBIX20, WELCOME10, FESTIVE500"
                  className="flex-1 h-10 px-3 border border-slate-200 rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#2563EB] font-normal"
                />
                <Button type="button" onClick={handleApplyCoupon} className="h-10 px-4 bg-slate-900 text-white text-xs font-medium rounded-xl">
                  Apply
                </Button>
              </div>

              {appliedCoupon && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200/80 rounded-xl text-emerald-900 font-medium flex items-center justify-between text-xs">
                  <span>✓ Coupon "{appliedCoupon.code}" ({appliedCoupon.label})</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="text-rose-600 hover:underline ml-2">
                    Remove
                  </button>
                </div>
              )}

              {couponError && <p className="text-xs text-rose-600 font-normal">{couponError}</p>}
            </div>

            {/* Cost Breakdown */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-xs text-slate-900">
              <div className="flex justify-between font-normal">
                <span>Selected ({selectedPack.name}):</span>
                <span className="font-medium">₹{rawPrice.toLocaleString()}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-500 font-normal">
                <span>GST Tax (18%):</span>
                <span>+₹{gstTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 text-xs sm:text-sm font-medium text-slate-900">
                <span>Grand Total:</span>
                <span className="text-[#2563EB]">₹{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-slate-500 font-normal">
                <span>Credits Added to Wallet:</span>
                <span className="text-emerald-600 font-medium">+{totalCreditsEarned.toLocaleString()} Credits</span>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full h-10 text-xs font-medium bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-xs"
            >
              Proceed to Secure Payment (₹{grandTotal.toLocaleString()})
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 3: TRANSACTION HISTORY & STATEMENT DOWNLOAD */}
      {activeTab === 'history' && (
        <div className="space-y-3">
          {/* Mobile Filter & Search Bar */}
          <div className="md:hidden space-y-3 bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full h-10 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal focus:outline-none"
              />
            </div>

            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 w-full">
              {(['all', 'purchase', 'usage', 'refund', 'bonus'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize shrink-0 transition-colors ${
                    historyFilter === filter ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-slate-200 bg-slate-50 text-slate-700 font-medium text-xs shrink-0 transition-colors ml-auto cursor-pointer"
              >
                <SlidersHorizontal className="w-3.5 h-3.5 text-blue-600" />
                <span>Filter</span>
              </button>
            </div>
          </div>

          {/* Desktop Filter Bar */}
          <div className="hidden md:flex flex-row items-center justify-between gap-3 bg-white p-3.5 border border-slate-200/90 rounded-2xl shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              {(['all', 'purchase', 'usage', 'refund', 'bonus'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer ${
                    historyFilter === filter ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full h-8.5 pl-9 pr-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-normal"
              />
            </div>
          </div>

          {/* Mobile Stacked Cards (< md) */}
          <div className="md:hidden space-y-2.5 w-full min-w-0">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((tx) => (
                <Card
                  key={tx.id}
                  padding="sm"
                  className="bg-white border border-slate-200/90 p-3 rounded-2xl shadow-2xs space-y-2 text-xs font-sans min-w-0 w-full"
                >
                  <div className="flex items-start justify-between gap-2 min-w-0">
                    <div className="space-y-0.5 min-w-0 flex-1">
                      <span className="font-mono font-medium text-[#2563EB] text-[11px] block">{tx.referenceId}</span>
                      <h4 className="font-medium text-slate-900 text-xs leading-snug break-words">{tx.description}</h4>
                    </div>
                    <span className={`font-medium text-xs shrink-0 ${tx.credits > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.credits > 0 ? `+${tx.credits}` : tx.credits}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[10.5px] font-normal text-slate-500">
                    <span>{tx.date}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTx(tx)}
                      className="text-blue-600 hover:underline font-medium cursor-pointer"
                    >
                      Details
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <Card padding="lg" className="bg-white border border-slate-200 text-center py-12 space-y-2 rounded-2xl">
                <p className="text-xs text-slate-500 font-normal">No credit activity found matching filters.</p>
              </Card>
            )}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block bg-white border border-slate-200/90 rounded-2xl overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-medium">
                  <tr>
                    <th className="py-3 px-4">Ref ID</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4">Credits</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-medium text-[#2563EB]">{tx.referenceId}</td>
                      <td className="py-3 px-4 text-slate-500 font-normal">{tx.date}</td>
                      <td className="py-3 px-4 uppercase text-[10px] font-medium text-slate-600">
                        <Badge variant={tx.credits > 0 ? 'success' : 'secondary'} size="sm" className="font-medium">
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-slate-900 font-medium">{tx.description}</td>
                      <td className={`py-3 px-4 font-medium ${tx.credits > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.credits > 0 ? `+${tx.credits}` : tx.credits}
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-900">
                        {tx.amount > 0 ? `₹${tx.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="h-7 text-[10px] px-2.5 font-medium"
                        >
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MOBILE FILTER BOTTOM SHEET */}
      {isFilterSheetOpen && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end md:hidden bg-slate-900/50 backdrop-blur-xs">
          <div className="fixed inset-0" onClick={() => setIsFilterSheetOpen(false)} />
          <div className="relative bg-white rounded-t-2xl p-4 space-y-4 max-h-[85vh] overflow-y-auto z-10 shadow-2xl animate-in slide-in-from-bottom duration-200 text-left font-sans text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-medium text-slate-900 text-sm">Filter Activity</h3>
              <button
                type="button"
                onClick={() => setIsFilterSheetOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Transaction Type</label>
              <select
                value={historyFilter}
                onChange={(e) => setHistoryFilter(e.target.value as 'all' | 'purchase' | 'usage' | 'refund' | 'bonus')}
                className="w-full h-10 rounded-xl border border-slate-200 px-3 bg-white text-slate-900 font-medium text-xs"
              >
                <option value="all">All Transactions</option>
                <option value="purchase">Purchase</option>
                <option value="usage">Usage</option>
                <option value="refund">Refund</option>
                <option value="bonus">Bonus</option>
              </select>
            </div>

            <Button
              onClick={() => setIsFilterSheetOpen(false)}
              className="w-full h-10 text-xs font-medium bg-[#2563EB] text-white rounded-xl mt-2"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      )}

      {/* PAYMENT GATEWAY MODAL */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Secure Payment Gateway"
        subtitle={`Completing purchase for ${selectedPack.name} (₹${grandTotal.toLocaleString()})`}
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex justify-between font-normal text-slate-700">
              <span>Credits Added:</span>
              <span className="text-[#2563EB] font-medium">+{totalCreditsEarned.toLocaleString()} Credits</span>
            </div>
            <div className="flex justify-between font-medium text-xs sm:text-sm text-slate-900 pt-1 border-t border-slate-200">
              <span>Total Payable:</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-medium text-slate-900">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['upi', 'card', 'netbanking'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-2.5 rounded-xl border text-center font-medium uppercase text-[10px] sm:text-[11px] cursor-pointer ${
                    paymentMethod === method ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]' : 'bg-white border-slate-200'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="h-9 text-xs font-medium">
              Cancel
            </Button>
            <Button onClick={handleExecutePayment} className="h-9 bg-[#2563EB] text-white text-xs font-medium px-4">
              Pay &amp; Add Credits
            </Button>
          </div>
        </div>
      </Modal>

      {/* TRANSACTION DETAILS MODAL */}
      <Modal
        isOpen={Boolean(selectedTx)}
        onClose={() => setSelectedTx(null)}
        title="Transaction Details"
        subtitle={`Reference ID: ${selectedTx?.referenceId}`}
        maxWidth="md"
      >
        {selectedTx && (
          <div className="space-y-4 font-sans text-xs text-left">
            <div className="p-3.5 bg-slate-50 border rounded-xl space-y-1.5">
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Description:</span>
                <span className="text-slate-900 font-medium">{selectedTx.description}</span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Credits Transacted:</span>
                <span className={`font-medium ${selectedTx.credits > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {selectedTx.credits > 0 ? `+${selectedTx.credits}` : selectedTx.credits}
                </span>
              </div>
              <div className="flex justify-between text-slate-500 font-normal">
                <span>Amount Paid:</span>
                <span className="text-slate-900 font-medium">₹{selectedTx.amount.toLocaleString()}</span>
              </div>
              {selectedTx.paymentMethod && (
                <div className="flex justify-between text-slate-500 font-normal">
                  <span>Payment Gateway:</span>
                  <span className="text-slate-900 font-medium">{selectedTx.paymentMethod}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-slate-100">
              <Button onClick={() => setSelectedTx(null)} className="h-9 bg-[#2563EB] text-white text-xs font-medium px-4">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

