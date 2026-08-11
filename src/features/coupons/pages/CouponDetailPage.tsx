import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Edit3,
  Power,
  Trash2,
  Copy,
  Check,
  Layers,
  MoreVertical,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import { useCouponStore } from '../store/coupon.store';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { ErrorState } from '../../../components/ui/ErrorState';
import { formatDiscount } from '../../../utils/currency';

export const CouponDetailPage: React.FC = () => {
  const navigate = useNavigate();
  const { couponId, courseUuid, courseId } = useParams<{
    couponId?: string;
    courseUuid?: string;
    courseId?: string;
  }>();

  const activeCourseId = courseUuid || courseId;

  const getCouponById = useCouponStore((state) => state.getCouponById);
  const toggleCouponStatus = useCouponStore((state) => state.toggleCouponStatus);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);

  const coupon = couponId ? getCouponById(couponId) : undefined;

  const [copied, setCopied] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMoreMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const backUrl = activeCourseId
    ? `/courses/${activeCourseId}/coupons`
    : '/coupons';

  const editUrl = activeCourseId && couponId
    ? `/courses/${activeCourseId}/coupons/${couponId}/edit`
    : `/coupons/${couponId}/edit`;

  if (!coupon) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 font-sans">
        <ErrorState
          title="Coupon Code Not Found"
          message="The requested coupon code does not exist or may have been deleted."
          actionText="Back to Coupons"
          onRetry={() => navigate(backUrl)}
        />
      </div>
    );
  }

  const handleCopyCode = () => {
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    showToast(`Copied code "${coupon.code}" to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = () => {
    setIsMoreMenuOpen(false);
    const updated = toggleCouponStatus(coupon.id);
    if (updated) {
      showToast(`Coupon "${coupon.code}" is now ${updated.status.toUpperCase()}`);
    }
  };

  const handleDeleteConfirm = () => {
    deleteCoupon(coupon.id);
    setIsDeleteModalOpen(false);
    navigate(backUrl);
  };

  const getBadgeVariant = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'warning';
    return 'error';
  };

  const formattedDiscount = formatDiscount(coupon.discountType, coupon.discountValue, coupon.currency);

  const formattedUsage = coupon.usageLimit
    ? `${coupon.usageCount} / ${coupon.usageLimit}`
    : `${coupon.usageCount} / Unlimited`;

  const usagePercent = coupon.usageLimit
    ? Math.min(100, Math.round((coupon.usageCount / coupon.usageLimit) * 100))
    : null;

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'Not Specified';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTimestamp = (isoStr: string) => {
    return new Date(isoStr).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6 font-sans text-left pb-16 w-full max-w-4xl mx-auto px-4 sm:px-6">
      {/* Toast Alert */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Top Header & Navigation */}
      <div className="flex items-center justify-between gap-4 pt-2">
        <button
          type="button"
          onClick={() => navigate(backUrl)}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Coupons
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Edit3 className="w-4 h-4" />}
            onClick={() => navigate(editUrl)}
          >
            Edit Coupon
          </Button>

          <Button
            variant={coupon.status === 'active' ? 'secondary' : 'primary'}
            size="sm"
            leftIcon={<Power className="w-4 h-4" />}
            onClick={handleToggleStatus}
          >
            {coupon.status === 'active' ? 'Disable Coupon' : 'Enable Coupon'}
          </Button>

          {/* ⋯ Dropdown for Delete */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className="p-2 text-slate-500 hover:text-slate-900 bg-white border border-slate-200 rounded-xl transition-colors cursor-pointer"
              title="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs font-medium">
                <button
                  type="button"
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsDeleteModalOpen(true);
                  }}
                  className="w-full px-3 py-2 text-left text-rose-600 hover:bg-rose-50 flex items-center gap-2 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                  Delete Coupon
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Banner Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-wider">
                {coupon.code}
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5" />}
              </button>
              <Badge variant={getBadgeVariant(coupon.status)} size="md" dot>
                {coupon.status === 'active' ? 'Active' : coupon.status === 'inactive' ? 'Inactive' : 'Expired'}
              </Badge>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Created on {formatTimestamp(coupon.createdAt)}
            </p>
          </div>

          <div className="text-left sm:text-right">
            <span className="text-2xl sm:text-3xl font-black text-blue-600 tracking-tight block">
              {formattedDiscount}
            </span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {coupon.discountType} discount
            </span>
          </div>
        </div>

        {/* Quick Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          {/* Card 1: Usage Progress */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Usage
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">{formattedUsage}</div>
            {usagePercent !== null && (
              <div className="mt-2 space-y-1">
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
                <div className="text-[11px] font-medium text-slate-500 text-right">
                  {usagePercent}% utilized
                </div>
              </div>
            )}
          </div>

          {/* Card 2: Validity */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Validity
            </div>
            <div className="text-sm font-bold text-slate-900 mt-1">
              Expires: {formatDate(coupon.expiryDate)}
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Valid From: {formatDate(coupon.validFrom)}
            </div>
          </div>

          {/* Card 3: Per-Student Limit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Per-Student Limit
            </div>
            <div className="text-lg font-bold text-slate-900 mt-1">
              {coupon.perStudentLimit || 1} use per student
            </div>
            <div className="text-xs text-slate-500 mt-1">
              Prevents duplicate code abuse
            </div>
          </div>
        </div>
      </div>

      {/* Detail Specifications Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-2xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">
          Coupon Specifications & Scope
        </h2>

        <div className="divide-y divide-slate-100 text-sm font-sans">
          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Coupon Code</span>
            <span className="font-mono font-bold text-slate-900">{coupon.code}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Discount Type</span>
            <span className="font-semibold text-slate-900 capitalize">{coupon.discountType}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Discount Value</span>
            <span className="font-bold text-blue-600">{formattedDiscount}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Applicable Course / Scope</span>
            <span className="font-semibold text-slate-900">
              {coupon.courseScope === 'all' ? (
                <span className="inline-flex items-center gap-1.5 text-blue-600">
                  <Layers className="w-4 h-4" /> All Courses (Global Platform)
                </span>
              ) : (
                <Link
                  to={`/courses/${coupon.courseScope}/overview`}
                  className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                >
                  {coupon.courseTitle || 'View Course'}
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              )}
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Valid From</span>
            <span className="font-semibold text-slate-800">{formatDate(coupon.validFrom)}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Expiry Date</span>
            <span className="font-semibold text-slate-800">{formatDate(coupon.expiryDate)}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Total Usage Limit</span>
            <span className="font-semibold text-slate-900">
              {coupon.usageLimit ? `${coupon.usageLimit} redemptions` : 'Unlimited'}
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Per-Student Usage Limit</span>
            <span className="font-semibold text-slate-900">
              {coupon.perStudentLimit || 1} redemption
            </span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Total Usage Count</span>
            <span className="font-bold text-slate-900">{coupon.usageCount} times redeemed</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Status</span>
            <Badge variant={getBadgeVariant(coupon.status)} size="sm" dot>
              {coupon.status === 'active' ? 'Active' : coupon.status === 'inactive' ? 'Inactive' : 'Expired'}
            </Badge>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Created At</span>
            <span className="text-slate-700">{formatTimestamp(coupon.createdAt)}</span>
          </div>

          <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
            <span className="text-slate-500 font-medium">Last Updated At</span>
            <span className="text-slate-700">{formatTimestamp(coupon.updatedAt)}</span>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Coupon Code"
        description={`Are you sure you want to delete coupon code "${coupon.code}"? This action cannot be undone.`}
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={() => setIsDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" size="md" onClick={handleDeleteConfirm}>
            Delete Coupon
          </Button>
        </div>
      </Modal>
    </div>
  );
};
