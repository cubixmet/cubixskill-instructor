import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Zap, Check, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import { usePlatformStore } from '../../store/usePlatformStore';

export interface BuyCreditsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CREDIT_PACKAGES = [
  {
    id: 'starter',
    name: 'Starter Pack',
    credits: 500,
    bonus: 50,
    price: 999,
    popular: false,
    perCreditCost: '₹1.81/credit',
  },
  {
    id: 'growth',
    name: 'Growth Booster',
    credits: 2500,
    bonus: 400,
    price: 3999,
    popular: true,
    perCreditCost: '₹1.37/credit',
  },
  {
    id: 'enterprise',
    name: 'Scale Power',
    credits: 10000,
    bonus: 2500,
    price: 12999,
    popular: false,
    perCreditCost: '₹1.03/credit',
  },
];

export const BuyCreditsModal: React.FC<BuyCreditsModalProps> = ({ isOpen, onClose }) => {
  const [selectedPackId, setSelectedPackId] = useState<string>('growth');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const addCredits = usePlatformStore((state) => state.addCredits);

  const selectedPack = CREDIT_PACKAGES.find((p) => p.id === selectedPackId) || CREDIT_PACKAGES[1];
  const gstAmount = Math.round(selectedPack.price * 0.18);
  const grandTotal = selectedPack.price + gstAmount;
  const totalCreditsEarned = selectedPack.credits + selectedPack.bonus;

  const handleExecutePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      addCredits(
        totalCreditsEarned,
        `Purchased ${selectedPack.name} (+${selectedPack.bonus} Bonus) via ${paymentMethod.toUpperCase()}`
      );
      setIsProcessing(false);
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 1200);
    }, 800);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Buy Media & Engine Credits"
      subtitle="Top up your platform credits to host courses, process video/audio, and issue certificates."
      maxWidth="lg"
    >
      {isSuccess ? (
        <div className="py-8 text-center space-y-3">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Payment Successful!</h3>
          <p className="text-sm text-slate-600">
            Added <strong className="text-blue-600">+{totalCreditsEarned.toLocaleString()} Credits</strong> to your wallet balance.
          </p>
        </div>
      ) : (
        <div className="space-y-6 font-sans text-xs text-left">
          {/* Credit Package Options */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {CREDIT_PACKAGES.map((pkg) => {
              const isSelected = selectedPackId === pkg.id;
              return (
                <div
                  key={pkg.id}
                  onClick={() => setSelectedPackId(pkg.id)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'border-[#2563EB] bg-blue-50/50 shadow-sm ring-2 ring-blue-500/20'
                      : 'border-[#E2E8F0] bg-white hover:border-slate-300'
                  }`}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 right-3 bg-[#2563EB] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-xs">
                      MOST POPULAR
                    </span>
                  )}
                  <div className="space-y-2">
                    <h4 className="font-bold text-slate-900 text-sm">{pkg.name}</h4>
                    <div>
                      <span className="text-xl font-extrabold text-slate-900">
                        {pkg.credits.toLocaleString()}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium ml-1">Credits</span>
                    </div>
                    {pkg.bonus > 0 && (
                      <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                        <Sparkles className="w-3 h-3" />
                        <span>+{pkg.bonus} Bonus Credits</span>
                      </div>
                    )}
                    <div className="pt-2 border-t border-slate-100 flex items-baseline justify-between">
                      <span className="text-base font-bold text-slate-900">₹{pkg.price.toLocaleString()}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{pkg.perCreditCost}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Price Breakdown */}
          <div className="p-4 bg-slate-50 border border-[#E2E8F0] rounded-xl space-y-2">
            <div className="flex justify-between font-medium text-slate-600">
              <span>Selected Package ({selectedPack.name}):</span>
              <span>₹{selectedPack.price.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium text-slate-600">
              <span>GST (18%):</span>
              <span>₹{gstAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>Total Payable:</span>
              <span className="text-[#2563EB]">₹{grandTotal.toLocaleString()}</span>
            </div>
          </div>

          {/* Payment Method Selection */}
          <div className="space-y-2">
            <label className="block font-semibold text-slate-900">Select Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              {(['upi', 'card', 'netbanking'] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`p-3 rounded-xl border text-center font-semibold uppercase text-[11px] cursor-pointer transition-all ${
                    paymentMethod === method
                      ? 'bg-blue-50 border-[#2563EB] text-[#2563EB]'
                      : 'bg-white border-[#E2E8F0] text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-[#E2E8F0]">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>256-bit Encrypted Payment</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" onClick={onClose} className="h-10 text-xs font-semibold">
                Cancel
              </Button>
              <Button
                onClick={handleExecutePayment}
                disabled={isProcessing}
                className="h-10 bg-[#2563EB] text-white text-xs font-semibold px-6 hover:bg-blue-700"
              >
                {isProcessing ? 'Processing...' : `Pay ₹${grandTotal.toLocaleString()}`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
};
