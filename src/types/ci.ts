export type PipelineStatus = 'SUCCESS' | 'FAILED' | 'RUNNING' | 'NOT_CONFIGURED';

export type TestCategory = 'UNIT' | 'INTEGRATION' | 'CONTRACT' | 'E2E';

export type TestStatus = 'PASSED' | 'FAILED' | 'SKIPPED';

export interface TestCaseResult {
  id: number;
  testRunId: number;
  testName: string;
  testCategory: TestCategory;
  testStatus: TestStatus;
  durationMillis: number;
  failureMessage?: string | null;
}

export interface TestRun {
  id: number;
  runIdentifier: string;
  commitSha: string;
  branchName: string;
  pipelineStatus: PipelineStatus;
  totalTests: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  coveragePercentage: number;
  durationMillis: number;
  startedAt: string;
  completedAt: string;
  successRate: number;
  testCases?: TestCaseResult[];
}

export interface DashboardSummary {
  totalRuns: number;
  latestStatus: PipelineStatus;
  totalTestsExecuted: number;
  passedTests: number;
  failedTests: number;
  skippedTests: number;
  overallSuccessRate: number;
  averageCoverage: number;
  latestRun: TestRun | null;
  categoryDistribution: Record<string, number>;
  recentRuns: TestRun[];
}

export interface HealthInfo {
  status: string;
  app: string;
  version: string;
  timestamp: string;
}
