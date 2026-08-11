import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit3, MoreVertical, Trash2, Power, Copy, Check, Ticket } from 'lucide-react';
import { CouponEntity } from '../types/coupon.types';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { Modal } from '../../../components/ui/Modal';
import { useCouponStore } from '../store/coupon.store';
import { formatDiscount } from '../../../utils/currency';

interface CouponCardProps {
  coupon: CouponEntity;
  courseIdContext?: string;
  onToast?: (msg: string) => void;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, courseIdContext, onToast }) => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleCouponStatus = useCouponStore((state) => state.toggleCouponStatus);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const detailUrl = courseIdContext
    ? `/courses/${courseIdContext}/coupons/${coupon.id}`
    : `/coupons/${coupon.id}`;

  const editUrl = courseIdContext
    ? `/courses/${courseIdContext}/coupons/${coupon.id}/edit`
    : `/coupons/${coupon.id}/edit`;

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(coupon.code);
    setCopied(true);
    if (onToast) onToast(`Copied code "${coupon.code}" to clipboard!`);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleStatus = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(false);
    const updated = toggleCouponStatus(coupon.id);
    if (updated && onToast) {
      onToast(`Coupon "${coupon.code}" is now ${updated.status.toUpperCase()}`);
    }
  };

  const handleDeleteConfirm = () => {
    deleteCoupon(coupon.id);
    setIsDeleteModalOpen(false);
    if (onToast) onToast(`Coupon "${coupon.code}" deleted.`);
  };

  // Status Badge Logic
  const getBadgeVariant = () => {
    if (coupon.status === 'active') return 'success';
    if (coupon.status === 'inactive') return 'warning';
    return 'error';
  };

  const formattedDiscount = formatDiscount(coupon.discountType, coupon.discountValue, coupon.currency);

  const formattedUsage = coupon.usageLimit
    ? `${coupon.usageCount} / ${coupon.usageLimit}`
    : `${coupon.usageCount} / Unlimited`;

  const formattedExpiry = coupon.expiryDate
    ? new Date(coupon.expiryDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No Expiry';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col justify-between space-y-3 font-sans w-full max-w-full overflow-hidden">
      {/* Header: Coupon Code & Status */}
      <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-2 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <Ticket className="w-4 h-4" />
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="group flex items-center gap-1.5 font-mono text-base font-bold text-slate-900 tracking-wider hover:text-blue-600 transition-colors truncate cursor-pointer text-left"
            title="Click to copy code"
          >
            <span className="truncate">{coupon.code}</span>
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 transition-colors shrink-0" />
            )}
          </button>
        </div>

        <Badge variant={getBadgeVariant()} size="sm" dot>
          {coupon.status === 'active' ? 'Active' : coupon.status === 'inactive' ? 'Inactive' : 'Expired'}
        </Badge>
      </div>

      {/* Body: Discount Value & Applicable Course */}
      <div className="space-y-1">
        <div className="text-xl font-extrabold text-blue-600 tracking-tight">
          {formattedDiscount}
        </div>
        <div className="text-sm font-semibold text-slate-800 line-clamp-1 break-words">
          {coupon.courseTitle || (coupon.courseScope === 'all' ? 'All Courses (Global)' : 'Selected Course')}
        </div>
      </div>

      {/* Details: Usage & Expiry */}
      <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50/80 p-2.5 rounded-xl border border-slate-100/80">
        <div>
          <span className="text-slate-500 font-medium block">Used</span>
          <span className="font-bold text-slate-900">{formattedUsage}</span>
        </div>
        <div>
          <span className="text-slate-500 font-medium block">Expires</span>
          <span className="font-bold text-slate-900">{formattedExpiry}</span>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex items-center justify-between gap-2 pt-1">
        <Link
          to={detailUrl}
          className="flex-1 inline-flex items-center justify-center min-h-[44px] px-3 text-xs font-semibold text-blue-600 bg-blue-50/80 hover:bg-blue-100/80 rounded-xl transition-colors cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 mr-1.5 shrink-0" />
          View Details
        </Link>

        {/* ⋯ Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="w-11 h-[44px] flex items-center justify-center text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            aria-label="More actions"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 bottom-full mb-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs font-medium font-sans">
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(detailUrl);
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                View Details
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  navigate(editUrl);
                }}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-slate-400" />
                Edit Coupon
              </button>

              <button
                type="button"
                onClick={handleToggleStatus}
                className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
              >
                <Power className="w-3.5 h-3.5 text-amber-500" />
                {coupon.status === 'active' ? 'Disable Coupon' : 'Enable Coupon'}
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
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
