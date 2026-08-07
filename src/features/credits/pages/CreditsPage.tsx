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
} from 'lucide-react';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { CreditCalculator } from '../../../components/common/CreditCalculator';
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
  const [activeTab, setActiveTab] = useState<'overview' | 'calculator' | 'buy' | 'history'>('overview');
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
    <div className="space-y-6 font-sans text-left bg-[#F8FAFC]">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 border border-[#E2E8F0] rounded-[16px] shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-[#0F172A] tracking-tight">
            Credit Wallet &amp; Billing
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-0.5 font-normal">
            Manage your pay-per-student credits, live calculators, billing packages, and transaction history.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDownloadStatement}
            leftIcon={<Download className="w-4 h-4 text-[#2563EB]" />}
            className="h-11 px-4 text-xs font-semibold"
          >
            Download Statement
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setActiveTab('buy')}
            leftIcon={<Plus className="w-4 h-4 text-white stroke-[3]" />}
            className="h-11 px-5 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold rounded-[12px]"
          >
            Buy Credits
          </Button>
        </div>
      </div>

      {/* 2. TAB NAVIGATION (STRICT 4 TABS - PAYMENT REMOVED) */}
      <div className="bg-white border border-[#E2E8F0] rounded-[16px] p-2 flex items-center gap-2 overflow-x-auto no-scrollbar shadow-2xs">
        {[
          { id: 'overview', label: 'Credit Overview' },
          { id: 'calculator', label: 'Credit Calculator' },
          { id: 'buy', label: 'Buy Credits' },
          { id: 'history', label: 'Transaction History' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as 'overview' | 'calculator' | 'buy' | 'history')}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-[#2563EB] text-white shadow-2xs'
                : 'text-[#64748B] hover:bg-slate-100 hover:text-[#0F172A]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: CREDIT OVERVIEW DASHBOARD */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-medium">Available Balance</span>
                <Wallet className="w-4.5 h-4.5 text-[#2563EB]" />
              </div>
              <strong className="text-2xl font-bold text-[#0F172A]">{availableBalance.toLocaleString()} Credits</strong>
              <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
                Sufficient for ~{Math.floor(availableBalance / 17)} students
              </span>
            </Card>

            <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-medium">Used (This Month)</span>
                <ArrowDownRight className="w-4.5 h-4.5 text-rose-600" />
              </div>
              <strong className="text-2xl font-bold text-rose-600">833 Credits</strong>
              <span className="text-[11px] text-[#64748B] mt-1 block">Across 4 active courses</span>
            </Card>

            <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-medium">Total Purchased</span>
                <ArrowUpRight className="w-4.5 h-4.5 text-emerald-600" />
              </div>
              <strong className="text-2xl font-bold text-[#0F172A]">5,500 Credits</strong>
              <span className="text-[11px] text-[#64748B] mt-1 block">Last order on Aug 01</span>
            </Card>

            <Card padding="md" className="bg-white border border-[#E2E8F0] rounded-[16px] shadow-2xs">
              <div className="flex items-center justify-between text-[#64748B] mb-2">
                <span className="text-xs font-medium">Reserved Credits</span>
                <CreditCard className="w-4.5 h-4.5 text-amber-600" />
              </div>
              <strong className="text-2xl font-bold text-[#0F172A]">300 Credits</strong>
              <span className="text-[11px] text-[#64748B] mt-1 block">Pending assignment evaluations</span>
            </Card>
          </div>

          {/* CREDIT USAGE BREAKDOWN */}
          <Card padding="lg" className="bg-white border border-[#E2E8F0] rounded-[16px] space-y-4 shadow-2xs">
            <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">Credit Usage Breakdown</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">Video Upload:</span>
                <strong className="text-[#0F172A] font-bold text-sm">340 Credits</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">Assignment Storage:</span>
                <strong className="text-[#0F172A] font-bold text-sm">210 Credits</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">Certificate PDF:</span>
                <strong className="text-[#0F172A] font-bold text-sm">32 Credits</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">Student Enrollment:</span>
                <strong className="text-[#0F172A] font-bold text-sm">180 Credits</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">Media Upload:</span>
                <strong className="text-[#0F172A] font-bold text-sm">55 Credits</strong>
              </div>
              <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl">
                <span className="text-[#64748B] block">AI Features:</span>
                <strong className="text-[#0F172A] font-bold text-sm">16 Credits</strong>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* TAB 2: LIVE CREDIT CALCULATOR (USES SHARED APPROVED FEATURES LIST) */}
      {activeTab === 'calculator' && (
        <div>
          <CreditCalculator
            initialEnrolledCount={50}
            availableBalance={availableBalance}
            onSelectPackage={() => setActiveTab('buy')}
          />
        </div>
      )}

      {/* TAB 3: BUY CREDITS & COUPON CODE + PAYMENT GATEWAY */}
      {activeTab === 'buy' && (
        <div className="space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1 py-2">
            <h2 className="text-xl font-semibold text-[#0F172A]">Choose a Credit Package</h2>
            <p className="text-xs text-[#64748B]">
              Purchase credits to enroll students, host video lessons, evaluate assignments, and generate certificates.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {packs.map((pack) => {
              const isSelected = selectedPackId === pack.id;

              return (
                <div
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-5 rounded-[20px] border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                    isSelected
                      ? 'bg-blue-50/70 border-[#2563EB] shadow-md ring-2 ring-blue-100'
                      : 'bg-white border-[#E2E8F0] hover:bg-slate-50'
                  }`}
                >
                  {pack.popular && (
                    <Badge variant="success" size="sm" className="absolute -top-3 right-4 bg-[#2563EB] text-white border-none">
                      Most Popular
                    </Badge>
                  )}

                  <div className="space-y-3">
                    <h3 className="font-semibold text-base text-[#0F172A]">{pack.name}</h3>
                    <div className="space-y-0.5">
                      <strong className="text-3xl font-bold text-[#2563EB]">
                        {pack.credits.toLocaleString()}
                      </strong>
                      <span className="text-xs text-[#64748B] block">Base Credits</span>
                    </div>

                    {pack.bonusCredits > 0 && (
                      <div className="p-2 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>+{pack.bonusCredits.toLocaleString()} Bonus Credits</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-[#E2E8F0] mt-4 space-y-3">
                    <strong className="text-xl font-bold text-[#0F172A] block">₹{pack.price.toLocaleString()}</strong>
                    <Button
                      type="button"
                      size="sm"
                      className={`w-full h-10 text-xs font-semibold ${
                        isSelected ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#0F172A] hover:bg-blue-50 hover:text-[#2563EB]'
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
          <Card padding="lg" className="bg-white border border-[#E2E8F0] rounded-[20px] max-w-2xl mx-auto space-y-5 shadow-2xs">
            <h3 className="text-base font-semibold text-[#0F172A] border-b pb-2">Order &amp; Payment Summary</h3>

            {/* Coupon Code Section */}
            <div className="space-y-2 text-xs">
              <label className="block font-semibold text-[#0F172A]">Have a Coupon Code?</label>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={couponCodeInput}
                  onChange={(e) => setCouponCodeInput(e.target.value)}
                  placeholder="Try CUBIX20, WELCOME10, FESTIVE500"
                  className="flex-1 h-11 px-4 border border-[#E2E8F0] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#2563EB]"
                />
                <Button type="button" onClick={handleApplyCoupon} className="h-11 px-5 bg-[#0F172A] text-white text-xs font-semibold">
                  Apply Coupon
                </Button>
              </div>

              {appliedCoupon && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 font-semibold flex items-center justify-between">
                  <span>✓ Coupon "{appliedCoupon.code}" Applied ({appliedCoupon.label})</span>
                  <button type="button" onClick={() => setAppliedCoupon(null)} className="text-rose-600 hover:underline">
                    Remove
                  </button>
                </div>
              )}

              {couponError && <p className="text-xs text-rose-600 font-semibold">{couponError}</p>}
            </div>

            {/* Cost Breakdown */}
            <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl space-y-2 text-xs text-[#0F172A]">
              <div className="flex justify-between">
                <span>Selected Package ({selectedPack.name}):</span>
                <strong>₹{rawPrice.toLocaleString()}</strong>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount ({appliedCoupon?.code}):</span>
                  <span>-₹{discountAmount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-[#64748B]">
                <span>GST Tax (18%):</span>
                <span>+₹{gstTax.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-2 border-t text-sm font-bold text-[#0F172A]">
                <span>Grand Total:</span>
                <span className="text-[#2563EB] text-lg">₹{grandTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between pt-1 text-[11px] text-[#64748B]">
                <span>Credits Added to Wallet:</span>
                <strong className="text-emerald-600 font-bold">+{totalCreditsEarned.toLocaleString()} Credits</strong>
              </div>
            </div>

            <Button
              type="button"
              onClick={() => setIsPaymentModalOpen(true)}
              className="w-full h-12 bg-[#2563EB] hover:bg-[#1D4ED8] text-white font-semibold text-sm rounded-xl shadow-xs"
            >
              Proceed to Secure Payment (₹{grandTotal.toLocaleString()})
            </Button>
          </Card>
        </div>
      )}

      {/* TAB 4: TRANSACTION HISTORY & STATEMENT DOWNLOAD */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 border border-[#E2E8F0] rounded-xl">
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar w-full sm:w-auto">
              {(['all', 'purchase', 'usage', 'refund', 'bonus'] as const).map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setHistoryFilter(filter)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer ${
                    historyFilter === filter ? 'bg-[#2563EB] text-white' : 'bg-slate-100 text-[#64748B]'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Search transactions..."
                className="w-full h-9 pl-9 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-normal"
              />
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[16px] overflow-hidden shadow-2xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-sans">
                <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-semibold">
                  <tr>
                    <th className="py-3.5 px-4">Ref ID</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Type</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4">Credits</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {filteredTransactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-[#2563EB]">{tx.referenceId}</td>
                      <td className="py-4 px-4 text-[#64748B]">{tx.date}</td>
                      <td className="py-4 px-4 uppercase text-[10px] font-bold text-[#64748B]">
                        <Badge variant={tx.credits > 0 ? 'success' : 'secondary'} size="sm">
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="py-4 px-4 text-[#0F172A] font-medium">{tx.description}</td>
                      <td className={`py-4 px-4 font-bold ${tx.credits > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {tx.credits > 0 ? `+${tx.credits}` : tx.credits}
                      </td>
                      <td className="py-4 px-4 font-bold text-[#0F172A]">
                        {tx.amount > 0 ? `₹${tx.amount.toLocaleString()}` : '-'}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedTx(tx)}
                          className="h-7 text-[10px] px-2.5"
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

      {/* PAYMENT GATEWAY MODAL (BUY CREDITS WORKFLOW) */}
      <Modal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        title="Secure Payment Gateway"
        subtitle={`Completing purchase for ${selectedPack.name} (₹${grandTotal.toLocaleString()})`}
        maxWidth="md"
      >
        <div className="space-y-4 font-sans text-xs text-left">
          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
            <div className="flex justify-between font-semibold text-[#0F172A]">
              <span>Credits Added:</span>
              <span className="text-[#2563EB]">+{totalCreditsEarned.toLocaleString()} Credits</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-[#0F172A]">
              <span>Total Payable:</span>
              <span>₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block font-semibold text-[#0F172A]">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['upi', 'card', 'netbanking'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-center font-semibold uppercase text-[11px] cursor-pointer ${
                    paymentMethod === method ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]' : 'bg-white border-[#E2E8F0]'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#E2E8F0]">
            <Button variant="outline" onClick={() => setIsPaymentModalOpen(false)} className="h-10 text-xs font-semibold">
              Cancel
            </Button>
            <Button onClick={handleExecutePayment} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
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
            <div className="p-4 bg-[#F8FAFC] border rounded-xl space-y-2">
              <div className="flex justify-between text-[#64748B]">
                <span>Description:</span>
                <strong className="text-[#0F172A]">{selectedTx.description}</strong>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Credits Transacted:</span>
                <strong className={selectedTx.credits > 0 ? 'text-emerald-600' : 'text-rose-600'}>
                  {selectedTx.credits > 0 ? `+${selectedTx.credits}` : selectedTx.credits}
                </strong>
              </div>
              <div className="flex justify-between text-[#64748B]">
                <span>Amount Paid:</span>
                <strong className="text-[#0F172A]">₹{selectedTx.amount.toLocaleString()}</strong>
              </div>
              {selectedTx.paymentMethod && (
                <div className="flex justify-between text-[#64748B]">
                  <span>Payment Gateway:</span>
                  <strong className="text-[#0F172A]">{selectedTx.paymentMethod}</strong>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end pt-3 border-t border-[#E2E8F0]">
              <Button onClick={() => setSelectedTx(null)} className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6">
                Close
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
