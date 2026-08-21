import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CreditCard,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { creditService, CreditPurchaseRateItem } from '../../../services/credit.service';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { parseApiError } from '../../../api/errors';
import { useAuth } from '../../auth/hooks/useAuth';
import { normalizeIndianPhone } from '../../../utils/phone.utils';

export const BuyCreditsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, academy } = useAuth();

  const [rates, setRates] = useState<CreditPurchaseRateItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Per-card coupon state maps keyed by rate.id
  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [couponPreviews, setCouponPreviews] = useState<Record<string, any>>({});
  const [couponErrors, setCouponErrors] = useState<Record<string, string | null>>({});
  const [couponLoading, setCouponLoading] = useState<Record<string, boolean>>({});

  // Payment loading state per rate ID
  const [paymentLoading, setPaymentLoading] = useState<Record<string, boolean>>({});

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadPurchaseRates = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const activeRates = await creditService.getPurchaseRates();
      setRates(activeRates);
    } catch (err: any) {
      console.error('Failed to load Credit purchase rates:', err);
      setErrorMsg('Unable to load Credit purchase options. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchaseRates();
  }, [loadPurchaseRates]);

  const handleApplyCoupon = async (rateId: string) => {
    const code = (couponInputs[rateId] || '').trim();
    if (!code) return;

    setCouponLoading((prev) => ({ ...prev, [rateId]: true }));
    setCouponErrors((prev) => ({ ...prev, [rateId]: null }));

    try {
      const preview = await creditService.previewPurchase(rateId, code);
      setCouponPreviews((prev) => ({ ...prev, [rateId]: preview }));
      showToast(`Coupon "${code}" applied!`);
    } catch (err: any) {
      const parsed = parseApiError(err);
      setCouponErrors((prev) => ({ ...prev, [rateId]: parsed.message || 'Invalid or expired coupon code.' }));
      setCouponPreviews((prev) => ({ ...prev, [rateId]: null }));
    } finally {
      setCouponLoading((prev) => ({ ...prev, [rateId]: false }));
    }
  };

  const handleRemoveCoupon = (rateId: string) => {
    setCouponInputs((prev) => ({ ...prev, [rateId]: '' }));
    setCouponPreviews((prev) => ({ ...prev, [rateId]: null }));
    setCouponErrors((prev) => ({ ...prev, [rateId]: null }));
  };

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && (window as any).Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayWithRazorpay = async (rateId: string) => {
    if (paymentLoading[rateId]) return;

    setPaymentLoading((prev) => ({ ...prev, [rateId]: true }));
    const couponCode = couponPreviews[rateId]?.coupon_code || (couponInputs[rateId] || '').trim();

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        showToast('Unable to load Razorpay checkout script. Please check your internet connection.');
        setPaymentLoading((prev) => ({ ...prev, [rateId]: false }));
        return;
      }

      const purchaseRes = await creditService.createPurchase(rateId, couponCode);
      const razorpayOrderId = purchaseRes.razorpay_order_id || purchaseRes.payment_order_id;
      const keyId = purchaseRes.key_id;

      const prefillName = purchaseRes.customer?.name || user?.full_name || '';
      const prefillEmail = purchaseRes.customer?.email || user?.email || '';
      const prefillContact = normalizeIndianPhone(
        purchaseRes.customer?.contact || user?.phone || academy?.phone || ''
      );

      const options = {
        key: keyId,
        amount: Math.floor(Number(purchaseRes.final_price) * 100),
        currency: purchaseRes.currency || 'INR',
        name: 'CubixSkill',
        description: `Credit Rate Purchase: ${purchaseRes.rate_name || purchaseRes.package_name || 'Credits'}`,
        order_id: razorpayOrderId,
        prefill: {
          name: prefillName,
          email: prefillEmail,
          contact: prefillContact,
        },
        config: {
          display: {
            blocks: {
              preferred: {
                name: 'Preferred Payment Methods',
                instruments: [
                  { method: 'upi' },
                  { method: 'card' },
                  { method: 'netbanking' },
                  { method: 'wallet' },
                ],
              },
            },
            sequence: ['block.preferred'],
            preferences: {
              show_default_blocks: true,
            },
          },
        },
        handler: async (response: any) => {
          try {
            showToast('Verifying payment signature...');
            await creditService.verifyPurchase(purchaseRes.id, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            showToast('Payment successful! Credits added to your account.');
            // Refetch summary so wallet balance in header updates from authoritative backend data
            creditService.getSummary().catch(() => {});
            setTimeout(() => navigate('/credits'), 1500);
          } catch (vErr: any) {
            const parsed = parseApiError(vErr);
            showToast(parsed.message || 'Payment verification could not be completed. If money was deducted, your payment will be reconciled automatically.');
          } finally {
            setPaymentLoading((prev) => ({ ...prev, [rateId]: false }));
          }
        },
        modal: {
          ondismiss: () => {
            showToast('Payment cancelled by user.');
            setPaymentLoading((prev) => ({ ...prev, [rateId]: false }));
          },
        },
        theme: {
          color: '#2563EB',
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      const parsed = parseApiError(err);
      showToast(parsed.message || 'Failed to initialize Razorpay Checkout Order.');
      setPaymentLoading((prev) => ({ ...prev, [rateId]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0 font-normal">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-5 right-5 z-50 px-4 py-2.5 bg-slate-900 text-white dark:bg-white dark:text-slate-900 rounded-xl text-xs font-medium shadow-lg animate-fade-in flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-yellow-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 min-w-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="min-w-0">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/credits')}
              leftIcon={<ArrowLeft className="w-3.5 h-3.5" />}
              className="h-8 text-xs font-normal text-slate-600 dark:text-slate-300 rounded-xl mb-1 border-slate-200 dark:border-[#334155]"
            >
              Back to Credits
            </Button>
            <h1 className="text-base sm:text-xl font-semibold text-slate-900 dark:text-white tracking-tight">
              Buy Credits
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
              Choose a Credit option. All rates are configured live by Super Admin.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i} padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] animate-pulse h-64" />
          ))}
        </div>
      ) : errorMsg ? (
        <Card padding="md" className="bg-rose-500/10 border border-rose-500/30 text-center py-8 space-y-3">
          <p className="text-xs text-rose-600 dark:text-rose-400 font-medium">{errorMsg}</p>
          <Button size="sm" onClick={loadPurchaseRates} className="bg-rose-600 text-white text-xs font-medium rounded-xl">
            Retry Loading Options
          </Button>
        </Card>
      ) : rates.length === 0 ? (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] text-center py-10 text-xs text-slate-500">
          No Credit purchase options are currently available.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {rates.map((rateOption) => {
            const preview = couponPreviews[rateOption.id];
            const isCouponLoading = Boolean(couponLoading[rateOption.id]);
            const isPaying = Boolean(paymentLoading[rateOption.id]);

            const baseCreditsNum = Math.floor(Number(rateOption.credits) || Number(rateOption.credit_cost) || 100);
            const origPriceNum = Math.floor(Number(rateOption.price));

            const finalPriceNum = preview ? Math.floor(Number(preview.final_price)) : origPriceNum;
            const discountAmtNum = preview ? Math.floor(Number(preview.discount_amount)) : 0;
            const totalCreditsNum = preview ? Math.floor(Number(preview.total_credits)) : baseCreditsNum;

            return (
              <Card
                key={rateOption.id}
                padding="md"
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263B5A] rounded-2xl p-4 sm:p-5 space-y-4 flex flex-col justify-between relative transition-all shadow-[0_4px_14px_rgba(37,99,235,0.07)] text-[#0F172A] dark:text-[#F8FAFC] w-full max-w-full min-w-0 box-border"
              >
                <div className="space-y-4 min-w-0">
                  {/* Credits Display */}
                  <div className="space-y-1.5 min-w-0">
                    <span className="text-[24px] font-semibold text-[#2563EB] dark:text-[#60A5FA] block tracking-tight">
                      {totalCreditsNum.toLocaleString()} Credits
                    </span>
                  </div>

                  {/* Price & Title */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#334155] space-y-1 min-w-0">
                    {preview && discountAmtNum > 0 ? (
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-xs text-slate-400 dark:text-[#94A3B8] line-through">
                            ₹{origPriceNum.toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-emerald-600 dark:text-[#34D399]">
                            Save ₹{discountAmtNum.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-[22px] font-semibold text-slate-900 dark:text-[#F8FAFC] leading-[1.2] tracking-tight">
                          ₹{finalPriceNum.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-[#CBD5E1]">{rateOption.currency}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-[22px] font-semibold text-slate-900 dark:text-[#F8FAFC] leading-[1.2] tracking-tight">
                        ₹{origPriceNum.toLocaleString()} <span className="text-sm font-normal text-slate-500 dark:text-[#CBD5E1]">{rateOption.currency}</span>
                      </div>
                    )}
                    <h3 className="text-sm font-medium text-slate-700 dark:text-[#CBD5E1] leading-[1.4] break-words overflow-wrap-anywhere">
                      {rateOption.name}
                    </h3>
                    {rateOption.description && (
                      <p className="text-xs text-slate-500 dark:text-[#94A3B8] font-normal leading-relaxed mt-0.5 break-words overflow-wrap-anywhere">
                        {rateOption.description}
                      </p>
                    )}
                  </div>

                  {/* Per-Card Coupon Code Input */}
                  <div className="pt-3 border-t border-slate-200 dark:border-[#334155] space-y-2 min-w-0">
                    <label className="block text-xs font-medium text-slate-700 dark:text-[#CBD5E1]">
                      Coupon Code
                    </label>
                    <div className="flex w-full min-w-0 flex-col min-[360px]:flex-row gap-2">
                      <input
                        type="text"
                        value={couponInputs[rateOption.id] || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          setCouponInputs((prev) => ({ ...prev, [rateOption.id]: val }));
                          // Invalidate previous preview if coupon input is edited after apply
                          if (couponPreviews[rateOption.id] && couponPreviews[rateOption.id].coupon_code !== val.trim().toUpperCase()) {
                            setCouponPreviews((prev) => ({ ...prev, [rateOption.id]: null }));
                          }
                          setCouponErrors((prev) => ({ ...prev, [rateOption.id]: null }));
                        }}
                        placeholder="e.g. CUBIX20"
                        className="w-full min-w-0 flex-1 h-9 px-3 border border-slate-300 dark:border-[#334155] bg-white dark:bg-[#0F172A] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#2563EB] text-slate-900 dark:text-[#F8FAFC] placeholder-slate-400 dark:placeholder-[#64748B]"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCouponLoading || !(couponInputs[rateOption.id] || '').trim()}
                        onClick={() => handleApplyCoupon(rateOption.id)}
                        className="w-full min-[360px]:w-auto min-[360px]:shrink-0 min-h-[36px] px-4 bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-medium rounded-xl transition-colors"
                      >
                        {isCouponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>

                    {preview && (
                      <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-950/40 border border-emerald-500/30 rounded-xl text-emerald-800 dark:text-emerald-300 text-[11px] font-normal flex items-center justify-between min-w-0">
                        <span className="truncate">✓ Coupon "{preview.coupon_code}" applied</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(rateOption.id)}
                          className="text-rose-600 dark:text-rose-400 hover:underline text-[11px] ml-2 font-medium shrink-0"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {couponErrors[rateOption.id] && (
                      <p className="text-xs text-rose-600 dark:text-rose-400 font-normal leading-normal">{couponErrors[rateOption.id]}</p>
                    )}
                  </div>
                </div>

                {/* Pay with Razorpay Button */}
                <div className="pt-4 border-t border-slate-200 dark:border-[#334155] min-w-0">
                  <Button
                    type="button"
                    disabled={isPaying}
                    onClick={() => handlePayWithRazorpay(rateOption.id)}
                    leftIcon={isPaying ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
                    className="w-full min-h-[44px] text-xs sm:text-sm font-medium bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl shadow-xs inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    {isPaying ? 'Opening Razorpay Checkout...' : `Pay ₹${finalPriceNum.toLocaleString()} with Razorpay`}
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-[#94A3B8] text-center font-normal mt-2 flex items-center justify-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400 dark:text-[#64748B] shrink-0" />
                    <span>Official Razorpay Hosted Payment</span>
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
