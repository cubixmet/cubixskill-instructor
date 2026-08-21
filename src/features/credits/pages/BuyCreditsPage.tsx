import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  Lock,
  RefreshCw,
} from 'lucide-react';
import { creditService, CreditPackageItem } from '../../../services/credit.service';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { parseApiError } from '../../../api/errors';

export const BuyCreditsPage: React.FC = () => {
  const navigate = useNavigate();

  const [packages, setPackages] = useState<CreditPackageItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Per-package coupon state maps
  const [couponInputs, setCouponInputs] = useState<Record<string, string>>({});
  const [couponPreviews, setCouponPreviews] = useState<Record<string, any>>({});
  const [couponErrors, setCouponErrors] = useState<Record<string, string | null>>({});
  const [couponLoading, setCouponLoading] = useState<Record<string, boolean>>({});

  // Payment loading state per package ID
  const [paymentLoading, setPaymentLoading] = useState<Record<string, boolean>>({});

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadPackages = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const pkgs = await creditService.getPackages();
      setPackages(pkgs);
    } catch (err: any) {
      console.error('Failed to load packages:', err);
      setErrorMsg('Unable to load Credit packages. Please retry.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPackages();
  }, [loadPackages]);

  const handleApplyCoupon = async (packageId: string) => {
    const code = (couponInputs[packageId] || '').trim();
    if (!code) return;

    setCouponLoading((prev) => ({ ...prev, [packageId]: true }));
    setCouponErrors((prev) => ({ ...prev, [packageId]: null }));

    try {
      const preview = await creditService.previewPurchase(packageId, code);
      setCouponPreviews((prev) => ({ ...prev, [packageId]: preview }));
      showToast(`Coupon "${code}" applied to package!`);
    } catch (err: any) {
      const parsed = parseApiError(err);
      setCouponErrors((prev) => ({ ...prev, [packageId]: parsed.message || 'Invalid or expired coupon code.' }));
      setCouponPreviews((prev) => ({ ...prev, [packageId]: null }));
    } finally {
      setCouponLoading((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  const handleRemoveCoupon = (packageId: string) => {
    setCouponInputs((prev) => ({ ...prev, [packageId]: '' }));
    setCouponPreviews((prev) => ({ ...prev, [packageId]: null }));
    setCouponErrors((prev) => ({ ...prev, [packageId]: null }));
  };

  const handlePayWithStripe = async (packageId: string) => {
    if (paymentLoading[packageId]) return;

    setPaymentLoading((prev) => ({ ...prev, [packageId]: true }));
    const couponCode = couponPreviews[packageId]?.coupon_code || couponInputs[packageId] || '';

    try {
      const purchaseRes = await creditService.createPurchase(packageId, couponCode);
      const checkoutUrl = purchaseRes.checkout_url;

      if (checkoutUrl) {
        showToast('Redirecting to official Stripe Checkout...');
        window.location.href = checkoutUrl;
      } else {
        throw new Error('No Stripe Checkout URL returned by server.');
      }
    } catch (err: any) {
      const parsed = parseApiError(err);
      showToast(parsed.message || 'Failed to initialize Stripe Checkout Session.');
      setPaymentLoading((prev) => ({ ...prev, [packageId]: false }));
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 font-sans text-left pb-24 sm:pb-16 px-2.5 sm:px-6 max-w-7xl mx-auto w-full max-w-full overflow-x-hidden min-w-0 font-normal">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 bg-slate-900 text-white text-xs font-normal rounded-xl shadow-xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header Card */}
      <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] shadow-2xs w-full max-w-full min-w-0 rounded-2xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
          <div className="min-w-0 flex-1 space-y-1">
            <Button
              type="button"
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
              Choose the credit package that fits your Academy. All transactions process securely via official Stripe Checkout.
            </p>
          </div>
        </div>
      </Card>

      {/* Package List Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <Card key={n} padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] rounded-2xl p-5 space-y-4 animate-pulse">
              <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
              <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded w-3/4"></div>
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-full"></div>
            </Card>
          ))}
        </div>
      ) : errorMsg ? (
        <Card padding="md" className="bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800/50 text-center py-8 space-y-3">
          <AlertTriangle className="w-6 h-6 text-rose-600 mx-auto" />
          <p className="text-xs text-rose-700 dark:text-rose-300 font-medium">{errorMsg}</p>
          <Button size="sm" onClick={loadPackages} className="h-8 text-xs bg-rose-600 text-white hover:bg-rose-700">
            Retry Loading Packages
          </Button>
        </Card>
      ) : packages.length === 0 ? (
        <Card padding="md" className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#263244] text-center py-10 text-xs text-slate-500">
          No Credit packages are currently available. Please check back later or contact support.
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pack) => {
            const preview = couponPreviews[pack.id];
            const isCouponLoading = Boolean(couponLoading[pack.id]);
            const isPaying = Boolean(paymentLoading[pack.id]);

            const baseCreditsNum = Math.floor(Number(pack.credits));
            const pkgBonusNum = Math.floor(Number(pack.bonus_credits));
            const origPriceNum = Math.floor(Number(pack.price));

            const finalPriceNum = preview ? Math.floor(Number(preview.final_price)) : origPriceNum;
            const discountAmtNum = preview ? Math.floor(Number(preview.discount_amount)) : 0;
            const totalCreditsNum = preview ? Math.floor(Number(preview.total_credits)) : baseCreditsNum + pkgBonusNum;

            return (
              <Card
                key={pack.id}
                padding="md"
                className={`bg-white dark:bg-[#111827] border rounded-2xl p-5 space-y-4 flex flex-col justify-between relative transition-all shadow-2xs ${
                  pack.popular
                    ? 'border-[#2563EB] ring-1 ring-blue-500/20'
                    : 'border-slate-200 dark:border-[#263244]'
                }`}
              >
                {pack.popular && (
                  <Badge variant="success" size="sm" className="absolute -top-2.5 right-4 bg-[#2563EB] text-white border-none font-normal text-[10px] px-2.5">
                    Most Popular
                  </Badge>
                )}

                <div className="space-y-3">
                  {/* Package Title & Description */}
                  <div>
                    <h3 className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white">{pack.name}</h3>
                    {pack.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-normal mt-0.5 leading-relaxed">
                        {pack.description}
                      </p>
                    )}
                  </div>

                  {/* Credits & Bonus Badge */}
                  <div className="space-y-1">
                    <span className="text-2xl font-bold text-[#2563EB] dark:text-[#60A5FA] block">
                      {totalCreditsNum.toLocaleString()} Credits
                    </span>
                    {(pkgBonusNum > 0 || (preview && Number(preview.bonus_credits) > pkgBonusNum)) && (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 rounded-xl text-emerald-900 dark:text-emerald-300 text-[11px] font-medium">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Included Bonus Credits</span>
                      </div>
                    )}
                  </div>

                  {/* Price Section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#263244] space-y-0.5">
                    {preview && discountAmtNum > 0 ? (
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-400 line-through">
                            ₹{origPriceNum.toLocaleString()}
                          </span>
                          <span className="text-xs font-medium text-emerald-600">
                            Save ₹{discountAmtNum.toLocaleString()}
                          </span>
                        </div>
                        <span className="text-xl font-bold text-slate-900 dark:text-white block">
                          ₹{finalPriceNum.toLocaleString()} {pack.currency}
                        </span>
                      </div>
                    ) : (
                      <span className="text-xl font-bold text-slate-900 dark:text-white block">
                        ₹{origPriceNum.toLocaleString()} {pack.currency}
                      </span>
                    )}
                  </div>

                  {/* Per-Package Coupon Code Input */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#263244] space-y-1.5">
                    <label className="block text-[11px] font-medium text-slate-700 dark:text-slate-300">
                      Coupon Code
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="text"
                        value={couponInputs[pack.id] || ''}
                        onChange={(e) => setCouponInputs((prev) => ({ ...prev, [pack.id]: e.target.value }))}
                        placeholder="e.g. CUBIX20"
                        className="flex-1 h-8 px-2.5 border border-slate-200 dark:border-[#334155] bg-slate-50 dark:bg-[#0F172A] rounded-xl text-xs font-mono uppercase focus:outline-none focus:border-[#2563EB] text-slate-900 dark:text-white"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isCouponLoading || !(couponInputs[pack.id] || '').trim()}
                        onClick={() => handleApplyCoupon(pack.id)}
                        className="h-8 px-3 bg-slate-900 dark:bg-slate-800 text-white text-[11px] font-normal rounded-xl"
                      >
                        {isCouponLoading ? 'Applying...' : 'Apply'}
                      </Button>
                    </div>

                    {preview && (
                      <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200/80 rounded-xl text-emerald-900 dark:text-emerald-300 text-[11px] font-normal flex items-center justify-between">
                        <span>✓ Coupon "{preview.coupon_code}" applied</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCoupon(pack.id)}
                          className="text-rose-600 hover:underline text-[10px] ml-2 font-medium"
                        >
                          Remove
                        </button>
                      </div>
                    )}

                    {couponErrors[pack.id] && (
                      <p className="text-[11px] text-rose-600 font-normal">{couponErrors[pack.id]}</p>
                    )}
                  </div>
                </div>

                {/* Pay with Stripe Button */}
                <div className="pt-4 border-t border-slate-100 dark:border-[#263244]">
                  <Button
                    type="button"
                    disabled={isPaying}
                    onClick={() => handlePayWithStripe(pack.id)}
                    leftIcon={isPaying ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                    className="w-full h-10 text-xs font-medium bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl shadow-2xs inline-flex items-center justify-center gap-2"
                  >
                    {isPaying ? 'Opening Stripe Checkout...' : `Pay ₹${finalPriceNum.toLocaleString()} with Stripe`}
                  </Button>
                  <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-normal mt-1.5 flex items-center justify-center gap-1">
                    <Lock className="w-3 h-3 shrink-0" />
                    <span>Official Stripe Hosted Payment</span>
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
