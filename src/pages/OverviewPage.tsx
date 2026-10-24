import React from 'react';
import {
  CheckCircle2,
  XCircle,
  FileCode2,
  Clock,
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  Play,
  Terminal,
  User,
} from 'lucide-react';
import { DashboardSummary, TestRun } from '../types/ci';
import { MetricCard } from '../components/MetricCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from 'recharts';

interface OverviewPageProps {
  summary: DashboardSummary | null;
  isLoading: boolean;
  onSelectRun: (runId: number) => void;
  onNavigateToPipeline: () => void;
}

export const OverviewPage: React.FC<OverviewPageProps> = ({
  summary,
  isLoading,
  onSelectRun,
  onNavigateToPipeline,
}) => {
  if (isLoading && !summary) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[400px] text-neutral-600">
        <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-mono font-medium">Fetching test metrics from Spring Boot backend...</p>
      </div>
    );
  }

  const isEmpty = !summary || summary.totalRuns === 0;

  // Monochrome chart data for categories
  const categoryData = summary
    ? Object.entries(summary.categoryDistribution).map(([category, count]) => ({
        category,
        count,
      }))
    : [];

  const categoryShades: Record<string, string> = {
    UNIT: '#171717', // Very Dark Neutral (Near Black)
    INTEGRATION: '#525252', // Dark Gray
    CONTRACT: '#737373', // Mid Gray
    E2E: '#a3a3a3', // Light Gray
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Student Attribution & Pipeline Status Banner */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs uppercase font-mono tracking-wider text-neutral-500 font-bold">
              Pipeline Health:
            </span>
            <StatusBadge status={summary?.latestStatus || 'NOT_CONFIGURED'} size="md" />
            <span className="text-neutral-300 hidden sm:inline">|</span>
            <div className="flex items-center gap-1.5 font-mono text-xs text-black bg-white border border-neutral-300 px-2.5 py-1 rounded shadow-xs">
              <User className="w-3.5 h-3.5 text-neutral-600" />
              <span className="font-bold">Rameshwor Chaudhary</span>
              <span className="text-neutral-400">·</span>
              <span className="text-neutral-700 font-semibold">24BAI71012</span>
            </div>
          </div>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            {isEmpty
              ? 'No CI pipeline executions recorded yet. Spring Boot database is waiting for the initial report.'
              : `Latest run ${summary.latestRun?.runIdentifier} verified on branch ${summary.latestRun?.branchName} with ${summary.latestRun?.coveragePercentage}% JaCoCo coverage.`}
          </p>
        </div>

        <div className="flex items-center gap-3 font-mono text-xs">
          <button
            onClick={onNavigateToPipeline}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-black hover:bg-neutral-800 text-white font-semibold transition-colors shadow-xs"
          >
            <span>View CI Pipeline</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Tests Executed"
          value={summary?.totalTestsExecuted ?? 0}
          subtitle={`Across ${summary?.totalRuns ?? 0} pipeline run${(summary?.totalRuns ?? 0) === 1 ? '' : 's'}`}
          icon={Layers}
        />

        <MetricCard
          label="Passed Tests"
          value={summary?.passedTests ?? 0}
          subtitle={
            summary?.totalTestsExecuted
              ? `${summary.overallSuccessRate}% success rate`
              : '0.0% success rate'
          }
          icon={CheckCircle2}
        />

        <MetricCard
          label="Failed Tests"
          value={summary?.failedTests ?? 0}
          subtitle={
            (summary?.skippedTests ?? 0) > 0
              ? `${summary?.skippedTests} tests skipped`
              : '0 tests skipped'
          }
          icon={XCircle}
        />

        <MetricCard
          label="Code Coverage (JaCoCo)"
          value={`${summary?.averageCoverage ?? 0}%`}
          subtitle="Instruction & line coverage"
          icon={ShieldCheck}
        />
      </div>

      {/* Empty State Banner if no runs yet */}
      {isEmpty && (
        <div className="border border-neutral-200 rounded-xl bg-white p-8 text-center space-y-4 shadow-xs">
          <div className="w-12 h-12 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto text-neutral-800">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-sm font-bold text-black">No Test Runs Recorded Yet</h3>
            <p className="text-xs text-neutral-600 leading-relaxed font-sans">
              The backend is running with a clean database. Test runs will appear here as soon as GitHub Actions or the local test script completes execution.
            </p>
          </div>
          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3 text-left max-w-lg mx-auto font-mono text-xs text-neutral-800 space-y-1">
            <p className="text-neutral-500 text-[11px] font-semibold">// Run tests and publish locally via terminal:</p>
            <p className="text-black font-bold">mvn -f backend/pom.xml test</p>
            <p className="text-neutral-700">python3 scripts/publish-ci-results.py</p>
          </div>
        </div>
      )}

      {/* Charts & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Test Category Distribution */}
        <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-black">Test Category Distribution</h3>
            <p className="text-xs text-neutral-500">Test cases grouped by testing layer</p>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <XAxis type="number" stroke="#737373" fontSize={11} allowDecimals={false} />
                <YAxis dataKey="category" type="category" stroke="#171717" fontSize={11} width={85} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    borderColor: '#e5e5e5',
                    borderRadius: '6px',
                    fontSize: '12px',
                    color: '#000000',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                  }}
                  itemStyle={{ color: '#000000' }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                  {categoryData.map((entry) => (
                    <Cell key={entry.category} fill={categoryShades[entry.category] || '#171717'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Monochrome legend (Zero-pill compliant) */}
          <div className="pt-2 border-t border-neutral-200 flex flex-wrap gap-x-4 gap-y-1 text-xs font-mono text-neutral-700 font-medium">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-900" />
              <span>Unit: {summary?.categoryDistribution?.UNIT ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
              <span>Integration: {summary?.categoryDistribution?.INTEGRATION ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-400" />
              <span>Contract: {summary?.categoryDistribution?.CONTRACT ?? 0}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-neutral-300" />
              <span>E2E: {summary?.categoryDistribution?.E2E ?? 0}</span>
            </div>
          </div>
        </div>

        {/* Recent Executions Table */}
        <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-black">Recent Pipeline Executions</h3>
              <p className="text-xs text-neutral-500">Real runs ingested from automated CI</p>
            </div>
          </div>

          {isEmpty ? (
            <div className="py-12 text-center text-xs text-neutral-500 font-mono">
              No recent executions available.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50 text-neutral-600 uppercase font-mono text-[11px]">
                    <th className="py-2.5 px-3">Run ID</th>
                    <th className="py-2.5 px-3">Commit</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3">Tests</th>
                    <th className="py-2.5 px-3">Coverage</th>
                    <th className="py-2.5 px-3">Duration</th>
                    <th className="py-2.5 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200 font-mono">
                  {summary.recentRuns.map((run) => (
                    <tr
                      key={run.id}
                      onClick={() => onSelectRun(run.id)}
                      className="hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-3 font-bold text-black">
                        {run.runIdentifier}
                      </td>
                      <td className="py-3 px-3 text-neutral-700">
                        {run.commitSha.substring(0, 8)}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={run.pipelineStatus} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-neutral-800">
                        <span className="text-black font-bold">{run.passedTests}</span> / {run.totalTests}
                      </td>
                      <td className="py-3 px-3 text-black font-bold">
                        {run.coveragePercentage}%
                      </td>
                      <td className="py-3 px-3 text-neutral-600">
                        {(run.durationMillis / 1000).toFixed(1)}s
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRun(run.id);
                          }}
                          className="text-black font-bold hover:underline transition-colors"
                        >
                          View Details &rarr;
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
    </div>
  );
};
