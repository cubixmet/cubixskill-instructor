import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { coursesService } from '../../../services/courses.service';
import { certificatesService, CertificateTemplateData } from '../../../services/certificates.service';
import { fetchCertificateFonts } from '../utils/fontRegistry';
import { authStore } from '../../../store/auth.store';

export const certificateKeys = {
  all: ['certificates'] as const,
  courses: () => [...certificateKeys.all, 'courses'] as const,
  fonts: () => [...certificateKeys.all, 'fonts'] as const,
  bindings: (courseId?: string) => [...certificateKeys.all, 'bindings', courseId || 'all'] as const,
  templates: () => [...certificateKeys.all, 'templates'] as const,
  template: (id: string) => [...certificateKeys.templates(), id] as const,
  summary: () => [...certificateKeys.all, 'summary'] as const,
  list: (filters: Record<string, any>) => [...certificateKeys.all, 'list', filters] as const,
};

export function useCertificateCourses() {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.courses(),
    queryFn: async () => {
      const res = await coursesService.listCourses({ page_size: 100 });
      return Array.isArray(res) ? res : res?.results || [];
    },
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateFonts() {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.fonts(),
    queryFn: () => fetchCertificateFonts(),
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateBindings(courseId?: string) {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.bindings(courseId),
    queryFn: () => certificatesService.getTemplateBindings(courseId),
    enabled: isAuthenticated && Boolean(courseId),
    staleTime: 5 * 60 * 1000,
  });
}

export function useCertificateTemplates() {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.templates(),
    queryFn: () => certificatesService.listTemplates(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateTemplateDetail(id?: string) {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.template(id || ''),
    queryFn: () => certificatesService.getTemplate(id!),
    enabled: isAuthenticated && Boolean(id),
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateSummary() {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.summary(),
    queryFn: () => certificatesService.getSummary(),
    enabled: isAuthenticated,
    staleTime: 2 * 60 * 1000,
  });
}

export function useCertificateList(filters: Record<string, any>) {
  const authState = authStore.getState();
  const isAuthenticated = Boolean(authState.accessToken);

  return useQuery({
    queryKey: certificateKeys.list(filters),
    queryFn: () => certificatesService.listCertificates(filters),
    enabled: isAuthenticated,
    staleTime: 1 * 60 * 1000,
  });
}

export function useDeleteCertificateTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (templateId: string) => certificatesService.deleteTemplate(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.templates() });
      queryClient.invalidateQueries({ queryKey: certificateKeys.summary() });
    },
  });
}
