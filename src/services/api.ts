import axios from 'axios';
import { DashboardSummary, HealthInfo, TestCaseResult, TestRun } from '../types/ci';

const apiClient = axios.create({
  baseURL: '',
  timeout: 10000,
  headers: {
    'Accept': 'application/json',
  },
});

export const api = {
  async getHealth(): Promise<HealthInfo> {
    const response = await apiClient.get<HealthInfo>('/api/health');
    return response.data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await apiClient.get<DashboardSummary>('/api/dashboard/summary');
    return response.data;
  },

  async getTestRuns(params?: { status?: string; category?: string; search?: string }): Promise<TestRun[]> {
    const response = await apiClient.get<TestRun[]>('/api/test-runs', { params });
    return response.data;
  },

  async getTestRunById(id: number): Promise<TestRun> {
    const response = await apiClient.get<TestRun>(`/api/test-runs/${id}`);
    return response.data;
  },

  async getTestCases(runId: number): Promise<TestCaseResult[]> {
    const response = await apiClient.get<TestCaseResult[]>(`/api/test-runs/${runId}/cases`);
    return response.data;
  },
};
