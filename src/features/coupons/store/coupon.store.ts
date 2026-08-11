import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CouponEntity, CouponFormData } from '../types/coupon.types';
import { DEFAULT_CURRENCY } from '../../../utils/currency';

const generateUuid = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'coup-' + Date.now().toString(16) + Math.random().toString(16).substring(2, 6);
};

const SEED_COUPONS: CouponEntity[] = [
  {
    id: 'coup-summer25',
    code: 'SUMMER25',
    discountType: 'percentage',
    discountValue: 25,
    currency: 'INR',
    courseScope: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
    validFrom: '2026-06-01',
    expiryDate: '2026-08-31',
    usageLimit: 100,
    perStudentLimit: 1,
    usageCount: 12,
    status: 'active',
    createdAt: '2026-06-01T10:00:00Z',
    updatedAt: '2026-08-01T12:00:00Z',
  },
  {
    id: 'coup-welcome100',
    code: 'WELCOME100',
    discountType: 'fixed',
    discountValue: 100,
    currency: 'INR',
    courseScope: 'all',
    courseTitle: 'All Courses (Global)',
    validFrom: '2026-01-01',
    expiryDate: '2026-12-31',
    usageLimit: null,
    perStudentLimit: 1,
    usageCount: 45,
    status: 'active',
    createdAt: '2026-01-01T08:00:00Z',
    updatedAt: '2026-08-02T09:30:00Z',
  },
  {
    id: 'coup-earlybird50',
    code: 'EARLYBIRD50',
    discountType: 'percentage',
    discountValue: 50,
    currency: 'INR',
    courseScope: '550e8400-e29b-41d4-a716-446655440001',
    courseTitle: 'Full-Stack TypeScript & Node.js Microservices',
    validFrom: '2026-05-01',
    expiryDate: '2026-07-31',
    usageLimit: 50,
    perStudentLimit: 1,
    usageCount: 50,
    status: 'inactive',
    createdAt: '2026-05-01T00:00:00Z',
    updatedAt: '2026-07-31T23:59:59Z',
  },
  {
    id: 'coup-flat500',
    code: 'FLAT500',
    discountType: 'fixed',
    discountValue: 500,
    currency: 'INR',
    courseScope: '550e8400-e29b-41d4-a716-446655440000',
    courseTitle: 'Fullstack React 19 & TypeScript Masterclass',
    validFrom: '2026-08-01',
    expiryDate: '2026-09-15',
    usageLimit: 20,
    perStudentLimit: 1,
    usageCount: 8,
    status: 'active',
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-08-05T14:20:00Z',
  },
];

interface CouponStoreState {
  coupons: CouponEntity[];
  getCouponById: (id: string) => CouponEntity | undefined;
  getCouponByCode: (code: string) => CouponEntity | undefined;
  getCouponsByCourse: (courseId?: string) => CouponEntity[];
  isCodeTaken: (code: string, excludeId?: string) => boolean;
  createCoupon: (formData: CouponFormData, courseTitleLookup?: (id: string) => string) => CouponEntity;
  updateCoupon: (id: string, formData: Partial<CouponFormData>, courseTitleLookup?: (id: string) => string) => CouponEntity | undefined;
  toggleCouponStatus: (id: string) => CouponEntity | undefined;
  deleteCoupon: (id: string) => boolean;
}

export const useCouponStore = create<CouponStoreState>()(
  persist(
    (set, get) => ({
      coupons: SEED_COUPONS,

      getCouponById: (id) => {
        return get().coupons.find((c) => c.id === id);
      },

      getCouponByCode: (code) => {
        const clean = code.trim().toUpperCase();
        return get().coupons.find((c) => c.code.toUpperCase() === clean);
      },

      getCouponsByCourse: (courseId) => {
        if (!courseId || courseId === 'all') {
          return get().coupons;
        }
        return get().coupons.filter(
          (c) => c.courseScope === 'all' || c.courseScope === courseId
        );
      },

      isCodeTaken: (code, excludeId) => {
        const cleanCode = code.trim().toUpperCase();
        if (!cleanCode) return false;
        return get().coupons.some(
          (c) => c.code.toUpperCase() === cleanCode && c.id !== excludeId
        );
      },

      createCoupon: (formData, courseTitleLookup) => {
        const newId = generateUuid();
        const now = new Date().toISOString();

        let courseTitle = 'All Courses (Global)';
        if (formData.courseScope !== 'all' && courseTitleLookup) {
          courseTitle = courseTitleLookup(formData.courseScope);
        }

        const newCoupon: CouponEntity = {
          id: newId,
          code: formData.code.trim().toUpperCase(),
          discountType: formData.discountType,
          discountValue: Number(formData.discountValue),
          currency: formData.currency || DEFAULT_CURRENCY,
          courseScope: formData.courseScope,
          courseTitle,
          validFrom: formData.validFrom || undefined,
          expiryDate: formData.expiryDate || undefined,
          usageLimit: formData.usageLimit === '' || formData.usageLimit === null ? null : Number(formData.usageLimit),
          perStudentLimit: formData.perStudentLimit === '' ? 1 : Number(formData.perStudentLimit),
          usageCount: 0,
          status: formData.status,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({ coupons: [newCoupon, ...state.coupons] }));
        return newCoupon;
      },

      updateCoupon: (id, formData, courseTitleLookup) => {
        const existing = get().getCouponById(id);
        if (!existing) return undefined;

        const now = new Date().toISOString();
        let courseTitle = existing.courseTitle;

        if (formData.courseScope !== undefined) {
          if (formData.courseScope === 'all') {
            courseTitle = 'All Courses (Global)';
          } else if (courseTitleLookup) {
            courseTitle = courseTitleLookup(formData.courseScope);
          }
        }

        const updated: CouponEntity = {
          ...existing,
          ...(formData.code !== undefined && { code: formData.code.trim().toUpperCase() }),
          ...(formData.discountType !== undefined && { discountType: formData.discountType }),
          ...(formData.discountValue !== undefined && { discountValue: Number(formData.discountValue) }),
          ...(formData.currency !== undefined && { currency: formData.currency }),
          ...(formData.courseScope !== undefined && { courseScope: formData.courseScope, courseTitle }),
          ...(formData.validFrom !== undefined && { validFrom: formData.validFrom || undefined }),
          ...(formData.expiryDate !== undefined && { expiryDate: formData.expiryDate || undefined }),
          ...(formData.usageLimit !== undefined && {
            usageLimit: formData.usageLimit === '' || formData.usageLimit === null ? null : Number(formData.usageLimit),
          }),
          ...(formData.perStudentLimit !== undefined && {
            perStudentLimit: formData.perStudentLimit === '' ? 1 : Number(formData.perStudentLimit),
          }),
          ...(formData.status !== undefined && { status: formData.status }),
          updatedAt: now,
        };

        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? updated : c)),
        }));

        return updated;
      },

      toggleCouponStatus: (id) => {
        const existing = get().getCouponById(id);
        if (!existing) return undefined;

        const nextStatus = existing.status === 'active' ? 'inactive' : 'active';
        const now = new Date().toISOString();

        const updated: CouponEntity = {
          ...existing,
          status: nextStatus,
          updatedAt: now,
        };

        set((state) => ({
          coupons: state.coupons.map((c) => (c.id === id ? updated : c)),
        }));

        return updated;
      },

      deleteCoupon: (id) => {
        const exists = get().coupons.some((c) => c.id === id);
        if (!exists) return false;

        set((state) => ({
          coupons: state.coupons.filter((c) => c.id !== id),
        }));
        return true;
      },
    }),
    {
      name: 'cubixskill-coupon-storage',
    }
  )
);
