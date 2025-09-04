export type { APIResponse, PaginatedResponse } from '@/types';
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  timeout: 15000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export { api };

export interface GetAssetsParams {
  page?: number;
  pageSize?: number;
  type?: string;
  department?: string;
  owner?: string;
  tags?: string[];
  qualityScore?: { min?: number; max?: number };
  createTime?: { start?: string; end?: string };
  keyword?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const endpoints = {
  assets: '/assets',
  assetDetail: (id: string) => `/assets/${id}`,
  assetFields: (id: string) => `/assets/${id}/fields`,
  assetLineage: (id: string) => `/assets/${id}/lineage`,
  assetQuality: (id: string) => `/assets/${id}/quality`,
  assetImpact: (id: string) => `/assets/${id}/impact-analysis`,
  search: '/assets/search',
  searchSuggestions: '/assets/search/suggestions',
  dashboardStatistics: '/dashboard/statistics',
  charts: (chartType: string) => `/charts/${chartType}`,
  users: '/users',
  userProfile: (id: string) => `/users/${id}`,
  userActivities: (id: string) => `/users/${id}/activities`,
};

// Assets
export const getAssets = (params?: GetAssetsParams) => api.get(endpoints.assets, { params });
export const getAssetDetail = (id: string) => api.get(endpoints.assetDetail(id));
export const getAssetFields = (id: string) => api.get(endpoints.assetFields(id));
export const getAssetLineage = (id: string, params?: { direction?: 'upstream' | 'downstream' | 'both'; depth?: number; includeFields?: boolean }) =>
  api.get(endpoints.assetLineage(id), { params });
export const getAssetQuality = (id: string) => api.get(endpoints.assetQuality(id));
export const runQualityCheck = (id: string, body?: { rules?: string[]; async?: boolean }) => api.post(endpoints.assetQuality(id) + '/check', body);
export const getImpactAnalysis = (id: string) => api.get(endpoints.assetImpact(id));

// Search (mock阶段建议 GET /assets?q=)
export const searchAssets = (body: { keyword: string; filters?: Record<string, any>; highlight?: boolean; page?: number; pageSize?: number }) =>
  api.post(endpoints.search, body);
export const getSearchSuggestions = (q: string) => api.get(endpoints.searchSuggestions, { params: { q } });

// Dashboard / charts
export const getDashboardStatistics = () => api.get(endpoints.dashboardStatistics);
export const getChartData = (chartType: string) => api.get(endpoints.charts(chartType));

// Users
export const getUserProfile = (id: string) => api.get(endpoints.userProfile(id));
export const getUserActivities = (id: string, params?: { page?: number; pageSize?: number; action?: string; dateRange?: { start?: string; end?: string } }) =>
  api.get(endpoints.userActivities(id), { params });
