import React, { useState, useEffect } from 'react';
import { Search, Filter, GitCommit, GitBranch, Clock, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { PipelineStatus, TestRun } from '../types/ci';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

interface TestRunsPageProps {
  onSelectRun: (runId: number) => void;
}

export const TestRunsPage: React.FC<TestRunsPageProps> = ({ onSelectRun }) => {
  const [runs, setRuns] = useState<TestRun[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  const fetchRuns = async () => {
    try {
      setIsLoading(true);
      const params: { status?: string; category?: string; search?: string } = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (categoryFilter !== 'ALL') params.category = categoryFilter;
      if (search.trim()) params.search = search.trim();

      const data = await api.getTestRuns(params);
      setRuns(data);
    } catch (err) {
      console.error('Failed to fetch runs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRuns();
  }, [statusFilter, categoryFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchRuns();
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Search & Filter Bar */}
      <div className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 shadow-xs">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Commit SHA or Run ID..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-9 pr-4 py-2 text-xs font-mono text-black placeholder:text-neutral-500 focus:outline-none focus:border-black"
          />
        </form>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Status Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 border border-neutral-200 rounded-lg font-mono text-xs">
            {['ALL', 'SUCCESS', 'FAILED', 'RUNNING'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-md transition-colors ${
                  statusFilter === status
                    ? 'bg-black text-white font-bold shadow-xs'
                    : 'text-neutral-600 hover:text-black'
                }`}
              >
                {status === 'ALL' ? 'All' : status}
              </button>
            ))}
          </div>

          {/* Category Dropdown */}
          <div className="flex items-center gap-2">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-white border border-neutral-300 rounded-lg px-3 py-1.5 text-xs font-mono text-black focus:outline-none focus:border-black"
            >
              <option value="ALL">All Categories</option>
              <option value="UNIT">Unit Tests</option>
              <option value="INTEGRATION">Integration Tests</option>
              <option value="CONTRACT">Contract Tests</option>
              <option value="E2E">E2E Tests</option>
            </select>
          </div>

          <button
            onClick={fetchRuns}
            className="p-2 rounded-lg bg-black hover:bg-neutral-800 text-white transition-colors shadow-xs"
            title="Refresh List"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Test Runs List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-12 text-center text-neutral-600 font-mono text-xs">
            <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Loading recorded executions...
          </div>
        ) : runs.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-neutral-500 mx-auto" />
            <h4 className="text-sm font-bold text-black">No Matching Test Runs</h4>
            <p className="text-xs text-neutral-500 font-mono max-w-sm mx-auto">
              No executions match the active search criteria or filters. Reset filters to view all runs.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 uppercase text-[11px] font-bold">
                  <th className="py-3 px-4">Run Identifier</th>
                  <th className="py-3 px-4">Commit</th>
                  <th className="py-3 px-4">Branch</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Tests (P/F/S/Total)</th>
                  <th className="py-3 px-4">Coverage</th>
                  <th className="py-3 px-4">Duration</th>
                  <th className="py-3 px-4">Timestamp</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {runs.map((run) => (
                  <tr
                    key={run.id}
                    onClick={() => onSelectRun(run.id)}
                    className="hover:bg-neutral-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-black">
                      {run.runIdentifier}
                    </td>
                    <td className="py-3.5 px-4 text-neutral-800 flex items-center gap-1 font-semibold">
                      <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                      <span>{run.commitSha.substring(0, 7)}</span>
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      <span className="flex items-center gap-1">
                        <GitBranch className="w-3 h-3 text-neutral-400" />
                        {run.branchName}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge status={run.pipelineStatus} size="sm" />
                    </td>
                    <td className="py-3.5 px-4 text-neutral-800">
                      <span className="text-black font-bold">{run.passedTests}</span>
                      {' / '}
                      <span className={run.failedTests > 0 ? 'text-black underline font-bold' : 'text-neutral-400'}>
                        {run.failedTests}
                      </span>
                      {' / '}
                      <span className="text-neutral-500">{run.skippedTests}</span>
                      {' / '}
                      <span className="text-black font-semibold">{run.totalTests}</span>
                    </td>
                    <td className="py-3.5 px-4 text-black font-bold">
                      {run.coveragePercentage}%
                    </td>
                    <td className="py-3.5 px-4 text-neutral-600">
                      {(run.durationMillis / 1000).toFixed(1)}s
                    </td>
                    <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectRun(run.id);
                        }}
                        className="text-black hover:underline inline-flex items-center gap-1 font-bold"
                      >
                        Inspect
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
