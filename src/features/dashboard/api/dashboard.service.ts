import { api } from '../../../lib/api';

export const dashboardService = {
  async getDashboardSummary() {
    const response = await api.get('/analytics/dashboard/');
    return response.data?.data || response.data;
  },
};
