import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar, NavTab } from './components/Sidebar';
import { TopHeader } from './components/TopHeader';
import { OverviewPage } from './pages/OverviewPage';
import { TestRunsPage } from './pages/TestRunsPage';
import { TestRunDetailPage } from './pages/TestRunDetailPage';
import { CiPipelinePage } from './pages/CiPipelinePage';
import { TestingStrategyPage } from './pages/TestingStrategyPage';
import { LabDocsPage } from './pages/LabDocsPage';
import { DashboardSummary, HealthInfo } from './types/ci';
import { api } from './services/api';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('overview');
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [health, setHealth] = useState<HealthInfo | null>(null);
  const [backendOnline, setBackendOnline] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadData = useCallback(async () => {
    try {
      setIsRefreshing(true);
      const [healthData, summaryData] = await Promise.all([
        api.getHealth().catch(() => null),
        api.getDashboardSummary().catch(() => null),
      ]);

      if (healthData) {
        setHealth(healthData);
        setBackendOnline(true);
      } else {
        setBackendOnline(false);
      }

      if (summaryData) {
        setSummary(summaryData);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setBackendOnline(false);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    // Periodic refresh every 30 seconds
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleSelectRun = (runId: number) => {
    setSelectedRunId(runId);
  };

  const handleBackToList = () => {
    setSelectedRunId(null);
  };

  const handleTabChange = (tab: NavTab) => {
    setActiveTab(tab);
    setSelectedRunId(null);
  };

  const getPageTitle = () => {
    if (selectedRunId) return `Test Run #${selectedRunId}`;
    switch (activeTab) {
      case 'overview':
        return 'Overview Dashboard';
      case 'runs':
        return 'Recorded Test Runs';
      case 'pipeline':
        return 'CI Pipeline & GitHub Actions';
      case 'strategy':
        return 'Automated Testing Strategy';
      case 'experiment':
        return 'Laboratory Experiment Documentation';
      default:
        return 'CI Quality Dashboard';
    }
  };

  const getPageSubtitle = () => {
    if (selectedRunId) return 'Execution trace, individual test case assertions, and failure logs';
    switch (activeTab) {
      case 'overview':
        return 'Aggregate quality metrics, pipeline health, and test category breakdown';
      case 'runs':
        return 'Historical pipeline runs, commit telemetry, and verification results';
      case 'pipeline':
        return '9-stage continuous integration workflow executed by GitHub Actions';
      case 'strategy':
        return 'Unit, MockMvc, Pact JVM contracts, and Testcontainers database verification';
      case 'experiment':
        return 'Academic lab experiment report, objectives, verified test results, and conclusions';
      default:
        return undefined;
    }
  };

  return (
    <div className="min-h-screen bg-white text-neutral-900 flex">
      {/* Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        health={health}
        backendOnline={backendOnline}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          title={getPageTitle()}
          subtitle={getPageSubtitle()}
          onRefresh={loadData}
          isRefreshing={isRefreshing}
          lastUpdated={lastUpdated}
        />

        <main className="flex-1 pb-12 overflow-y-auto">
          {selectedRunId ? (
            <TestRunDetailPage runId={selectedRunId} onBack={handleBackToList} />
          ) : (
            <>
              {activeTab === 'overview' && (
                <OverviewPage
                  summary={summary}
                  isLoading={isLoading}
                  onSelectRun={handleSelectRun}
                  onNavigateToPipeline={() => handleTabChange('pipeline')}
                />
              )}

              {activeTab === 'runs' && <TestRunsPage onSelectRun={handleSelectRun} />}

              {activeTab === 'pipeline' && <CiPipelinePage />}

              {activeTab === 'strategy' && <TestingStrategyPage />}

              {activeTab === 'experiment' && <LabDocsPage />}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
