import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '../../../services/courses.service';
import { certificatesService } from '../../../services/certificates.service';
import { fetchCertificateFonts } from '../utils/fontRegistry';
import { useAuthStore } from '../../../store/auth.store';

export const certificateKeys = {
  all: ['certificates'] as const,
  courses: (academyId?: string | null) => [...certificateKeys.all, 'courses', academyId ?? 'current-academy'] as const,
  fonts: (academyId?: string | null) => [...certificateKeys.all, 'fonts', academyId ?? 'current-academy'] as const,
  bindings: (courseId?: string) => [...certificateKeys.all, 'bindings', courseId || 'all'] as const,
  templates: (academyId?: string | null) => [...certificateKeys.all, 'templates', academyId ?? 'current-academy'] as const,
  template: (id: string) => [...certificateKeys.templates(), id] as const,
  templateBySlug: (slug: string) => [...certificateKeys.templates(), 'by-slug', slug] as const,
  summary: (academyId?: string | null) => [...certificateKeys.all, 'summary', academyId ?? 'current-academy'] as const,
  list: (filters: Record<string, any>) => [...certificateKeys.all, 'list', filters] as const,
};

function useReactiveAuth() {
  const { isAuthenticated, authStatus, isInitializing, academy } = useAuthStore();
  const academyId = (academy as any)?.id ?? (academy as any)?.uuid ?? null;
  const canFetch =
    isAuthenticated === true &&
    authStatus === 'authenticated' &&
    isInitializing === false;

  return { isAuthenticated, authStatus, isInitializing, academy, academyId, canFetch };
}

export function useCertificateCourses() {
  const { academyId, canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.courses(academyId),
    queryFn: async () => {
      let allCourses: any[] = [];
      let page = 1;
      let hasMore = true;
      while (hasMore) {
        const res = await coursesService.listCourses({ page, page_size: 100 });
        if (Array.isArray(res)) {
          allCourses = [...allCourses, ...res];
          hasMore = false;
        } else if (res && Array.isArray(res.results)) {
          allCourses = [...allCourses, ...res.results];
          if (res.next && res.results.length > 0) {
            page += 1;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
        }
      }
      return allCourses;
    },
    enabled: canFetch,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateFonts() {
  const { academyId, canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.fonts(academyId),
    queryFn: () => fetchCertificateFonts(),
    enabled: canFetch,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateBindings(courseId?: string) {
  const { canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.bindings(courseId),
    queryFn: () => certificatesService.getTemplateBindings(courseId),
    enabled: canFetch && Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateTemplates() {
  const { academyId, canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.templates(academyId),
    queryFn: () => certificatesService.listTemplates(),
    enabled: canFetch,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateTemplateDetail(id?: string) {
  const { canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.template(id || ''),
    queryFn: () => certificatesService.getTemplate(id!),
    enabled: canFetch && Boolean(id),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateTemplateBySlug(slug?: string) {
  const { canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.templateBySlug(slug || ''),
    queryFn: () => certificatesService.getTemplateBySlug(slug!),
    enabled: canFetch && Boolean(slug),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateSummary() {
  const { academyId, canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.summary(academyId),
    queryFn: () => certificatesService.getSummary(),
    enabled: canFetch,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateList(filters: Record<string, any>) {
  const { canFetch } = useReactiveAuth();

  return useQuery({
    queryKey: certificateKeys.list(filters),
    queryFn: () => certificatesService.listCertificates(filters),
    enabled: canFetch,
    staleTime: 1 * 60 * 1000,
  });
}

export function useDeleteCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => certificatesService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.all });
    },
  });
}
