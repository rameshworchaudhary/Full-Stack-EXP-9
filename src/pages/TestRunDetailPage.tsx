import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Clock,
  GitCommit,
  GitBranch,
  ShieldCheck,
  Search,
  AlertTriangle,
  Code2,
} from 'lucide-react';
import { TestCaseResult, TestRun, TestStatus } from '../types/ci';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';

interface TestRunDetailPageProps {
  runId: number;
  onBack: () => void;
}

export const TestRunDetailPage: React.FC<TestRunDetailPageProps> = ({ runId, onBack }) => {
  const [run, setRun] = useState<TestRun | null>(null);
  const [cases, setCases] = useState<TestCaseResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCase, setSelectedCase] = useState<TestCaseResult | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        const [runData, casesData] = await Promise.all([
          api.getTestRunById(runId),
          api.getTestCases(runId),
        ]);
        setRun(runData);
        setCases(casesData);
      } catch (err) {
        console.error('Failed to load test run details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [runId]);

  if (isLoading && !run) {
    return (
      <div className="p-8 text-center text-neutral-600 font-mono text-xs">
        <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        Loading run execution telemetry...
      </div>
    );
  }

  if (!run) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-sm font-semibold text-neutral-800">Test Run #{runId} could not be found.</p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-black text-white rounded-lg text-xs font-mono font-bold shadow-xs"
        >
          &larr; Back to Test Runs
        </button>
      </div>
    );
  }

  const filteredCases = cases.filter((c) => {
    const matchesStatus = statusFilter === 'ALL' || c.testStatus === statusFilter;
    const matchesSearch =
      !searchTerm || c.testName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Top Bar with Back Button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-xs font-mono font-semibold text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Test Runs</span>
        </button>
      </div>

      {/* Run Header Overview */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-200 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold font-mono text-black">{run.runIdentifier}</h2>
              <StatusBadge status={run.pipelineStatus} size="md" />
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-neutral-600">
              <span className="flex items-center gap-1 font-semibold text-black">
                <GitCommit className="w-3.5 h-3.5 text-neutral-500" />
                {run.commitSha}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <GitBranch className="w-3.5 h-3.5 text-neutral-400" />
                {run.branchName}
              </span>
              <span aria-hidden="true">·</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-neutral-400" />
                {(run.durationMillis / 1000).toFixed(1)}s duration
              </span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-xs">
            <div className="text-right">
              <span className="text-neutral-500 block text-[11px] uppercase font-bold">Success Rate</span>
              <span className="text-xl font-bold text-black">{run.successRate}%</span>
            </div>
            <div className="text-right">
              <span className="text-neutral-500 block text-[11px] uppercase font-bold">Coverage</span>
              <span className="text-xl font-bold text-black">{run.coveragePercentage}%</span>
            </div>
          </div>
        </div>

        {/* Counter strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="text-neutral-500 text-[11px] font-semibold">Total Tests</span>
            <p className="text-base font-bold text-black mt-0.5">{run.totalTests}</p>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="text-neutral-500 text-[11px] font-semibold">Passed</span>
            <p className="text-base font-bold text-black mt-0.5">{run.passedTests}</p>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="text-neutral-500 text-[11px] font-semibold">Failed</span>
            <p className="text-base font-bold text-black mt-0.5">{run.failedTests}</p>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
            <span className="text-neutral-500 text-[11px] font-semibold">Skipped</span>
            <p className="text-base font-bold text-neutral-500 mt-0.5">{run.skippedTests}</p>
          </div>
        </div>
      </div>

      {/* Test Cases Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Status filter buttons */}
        <div className="flex items-center gap-1 p-1 bg-neutral-100 border border-neutral-200 rounded-lg font-mono text-xs">
          {['ALL', 'PASSED', 'FAILED', 'SKIPPED'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-black text-white font-bold shadow-xs'
                  : 'text-neutral-600 hover:text-black'
              }`}
            >
              {st === 'ALL' ? 'All Cases' : st}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search test case name..."
            className="w-full bg-white border border-neutral-300 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-black placeholder:text-neutral-400 focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Test Cases List */}
      <div className="bg-white border border-neutral-200 rounded-xl overflow-hidden shadow-xs">
        {filteredCases.length === 0 ? (
          <div className="p-8 text-center text-xs font-mono text-neutral-500">
            No test cases found matching filter.
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 font-mono text-xs">
            {filteredCases.map((tc) => (
              <div
                key={tc.id}
                onClick={() => setSelectedCase(tc === selectedCase ? null : tc)}
                className="p-3.5 hover:bg-neutral-50 cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={tc.testStatus} size="sm" />
                      <span className="text-neutral-300">·</span>
                      <span className="text-neutral-600 text-[11px] font-semibold uppercase">{tc.testCategory}</span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-neutral-500 text-[11px]">{tc.durationMillis}ms</span>
                    </div>
                    <p className="font-bold text-neutral-900 break-all">{tc.testName}</p>
                  </div>

                  {tc.failureMessage && (
                    <span className="text-black font-bold text-xs shrink-0 underline">
                      {selectedCase?.id === tc.id ? 'Hide Error' : 'View Error'}
                    </span>
                  )}
                </div>

                {/* Expanded Failure Diagnostics */}
                {selectedCase?.id === tc.id && tc.failureMessage && (
                  <div className="mt-3 p-3.5 bg-neutral-50 border border-neutral-300 rounded-lg text-black text-[11px] space-y-1.5 font-mono shadow-xs">
                    <p className="text-black font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Failure Diagnostics:
                    </p>
                    <pre className="overflow-x-auto whitespace-pre-wrap leading-relaxed text-neutral-800 bg-white p-2.5 rounded border border-neutral-200">
                      {tc.failureMessage}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
