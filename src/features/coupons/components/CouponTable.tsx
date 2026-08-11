import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, Edit3, MoreVertical, Trash2, Power, Copy, Check, Ticket } from 'lucide-react';
import { CouponEntity } from '../types/coupon.types';
import { Badge } from '../../../components/ui/Badge';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { useCouponStore } from '../store/coupon.store';
import { formatDiscount } from '../../../utils/currency';

interface CouponTableProps {
  coupons: CouponEntity[];
  courseIdContext?: string;
  onToast?: (msg: string) => void;
}

export const CouponTable: React.FC<CouponTableProps> = ({ coupons, courseIdContext, onToast }) => {
  const navigate = useNavigate();
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<CouponEntity | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleCouponStatus = useCouponStore((state) => state.toggleCouponStatus);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyCode = (code: string, id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopiedId(id);
    if (onToast) onToast(`Copied code "${code}" to clipboard!`);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleToggleStatus = (id: string, code: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenuId(null);
    const updated = toggleCouponStatus(id);
    if (updated && onToast) {
      onToast(`Coupon "${code}" is now ${updated.status.toUpperCase()}`);
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteCoupon(deleteTarget.id);
    if (onToast) onToast(`Coupon "${deleteTarget.code}" deleted.`);
    setDeleteTarget(null);
  };

  const getBadgeVariant = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'inactive') return 'warning';
    return 'error';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden font-sans">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm text-slate-700">
          <thead className="bg-slate-50/90 text-slate-500 font-semibold border-b border-slate-200/80 uppercase text-[11px] tracking-wider">
            <tr>
              <th scope="col" className="py-3.5 px-4 sm:px-6">Coupon Code</th>
              <th scope="col" className="py-3.5 px-4">Discount</th>
              <th scope="col" className="py-3.5 px-4">Applicable Course</th>
              <th scope="col" className="py-3.5 px-4">Usage / Limit</th>
              <th scope="col" className="py-3.5 px-4">Valid From</th>
              <th scope="col" className="py-3.5 px-4">Expiry Date</th>
              <th scope="col" className="py-3.5 px-4">Status</th>
              <th scope="col" className="py-3.5 px-4 sm:px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium">
            {coupons.map((coupon) => {
              const detailUrl = courseIdContext
                ? `/courses/${courseIdContext}/coupons/${coupon.id}`
                : `/coupons/${coupon.id}`;

              const editUrl = courseIdContext
                ? `/courses/${courseIdContext}/coupons/${coupon.id}/edit`
                : `/coupons/${coupon.id}/edit`;

              const formattedDiscount = formatDiscount(coupon.discountType, coupon.discountValue, coupon.currency);

              const usageDisplay = coupon.usageLimit
                ? `${coupon.usageCount} / ${coupon.usageLimit}`
                : `${coupon.usageCount} / ∞`;

              return (
                <tr
                  key={coupon.id}
                  className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                  onClick={() => navigate(detailUrl)}
                >
                  {/* Coupon Code */}
                  <td className="py-4 px-4 sm:px-6 font-mono font-bold text-slate-900 tracking-wider">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                        <Ticket className="w-4 h-4" />
                      </div>
                      <span className="text-sm">{coupon.code}</span>
                      <button
                        type="button"
                        onClick={(e) => handleCopyCode(coupon.code, coupon.id, e)}
                        className="p-1 text-slate-400 hover:text-blue-600 transition-colors rounded-md hover:bg-blue-50 cursor-pointer"
                        title="Copy code"
                      >
                        {copiedId === coupon.id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </td>

                  {/* Discount */}
                  <td className="py-4 px-4 font-semibold text-blue-600 whitespace-nowrap">
                    {formattedDiscount}
                    <span className="block text-[11px] text-slate-400 font-normal capitalize">
                      {coupon.discountType}
                    </span>
                  </td>

                  {/* Applicable Course */}
                  <td className="py-4 px-4 font-semibold text-slate-900 max-w-[220px] truncate" title={coupon.courseTitle || 'All Courses (Global)'}>
                    {coupon.courseTitle || (coupon.courseScope === 'all' ? 'All Courses (Global)' : 'Selected Course')}
                  </td>

                  {/* Usage */}
                  <td className="py-4 px-4 whitespace-nowrap font-medium text-slate-700">
                    {usageDisplay}
                  </td>

                  {/* Valid From */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                    {formatDate(coupon.validFrom)}
                  </td>

                  {/* Expiry Date */}
                  <td className="py-4 px-4 whitespace-nowrap text-slate-600">
                    {formatDate(coupon.expiryDate)}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4 whitespace-nowrap">
                    <Badge variant={getBadgeVariant(coupon.status)} size="sm" dot>
                      {coupon.status === 'active' ? 'Active' : coupon.status === 'inactive' ? 'Inactive' : 'Expired'}
                    </Badge>
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        to={detailUrl}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>

                      <Link
                        to={editUrl}
                        className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                        title="Edit Coupon"
                      >
                        <Edit3 className="w-4 h-4" />
                      </Link>

                      {/* ⋯ Dropdown */}
                      <div className="relative" ref={activeMenuId === coupon.id ? menuRef : null}>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(activeMenuId === coupon.id ? null : coupon.id)}
                          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="More actions"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {activeMenuId === coupon.id && (
                          <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-slate-200 py-1.5 z-40 text-xs font-medium text-left">
                            <button
                              type="button"
                              onClick={(e) => handleToggleStatus(coupon.id, coupon.code, e)}
                              className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                            >
                              <Power className="w-3.5 h-3.5 text-amber-500" />
                              {coupon.status === 'active' ? 'Disable Coupon' : 'Enable Coupon'}
                            </button>

                            <div className="my-1 border-t border-slate-100" />

                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                setDeleteTarget(coupon);
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Coupon Code"
        description={`Are you sure you want to delete coupon code "${deleteTarget?.code}"? This action cannot be undone.`}
      >
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Button variant="ghost" size="md" onClick={() => setDeleteTarget(null)}>
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
