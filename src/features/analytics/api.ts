import { ApiClient } from '@/lib/api';
import { Analytics } from '@/types';

export const analyticsFeatureApi = {
  getDailyKPIs: (date?: string) =>
    ApiClient.get<Analytics.Daily>('/analytics/daily/', date ? { date } : undefined),

  getWeeklyKPIs: (week_start?: string) =>
    ApiClient.get<Analytics.Weekly>('/analytics/weekly/', week_start ? { week_start } : undefined),

  getOccupancyRates: (params?: { start_date?: string; end_date?: string }) =>
    ApiClient.get<{ occupancy_rate: number; results: any[] }>('/analytics/occupancy-rates/', params),

  getRevenueStats: (params?: { start_date?: string; end_date?: string }) =>
    ApiClient.get<{ total_revenue: number; results: any[] }>('/analytics/revenue-statistics/', params),

  getSummary: () => ApiClient.get<Analytics.Summary>('/analytics/summary/'),

  exportDailyCSV: (date?: string) =>
    ApiClient.get('/analytics/export/daily-csv/', date ? { date } : undefined),

  exportWeeklyCSV: (week_start?: string) =>
    ApiClient.get('/analytics/export/weekly-csv/', week_start ? { week_start } : undefined),
};
