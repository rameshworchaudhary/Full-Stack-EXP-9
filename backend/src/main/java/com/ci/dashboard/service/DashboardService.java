package com.ci.dashboard.service;

import com.ci.dashboard.dto.DashboardSummaryDto;
import com.ci.dashboard.dto.TestRunResponse;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestCategory;
import com.ci.dashboard.entity.TestRun;
import com.ci.dashboard.repository.TestCaseResultRepository;
import com.ci.dashboard.repository.TestRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class DashboardService {

    private final TestRunRepository testRunRepository;
    private final TestCaseResultRepository testCaseResultRepository;
    private final TestRunService testRunService;

    public DashboardService(TestRunRepository testRunRepository,
                            TestCaseResultRepository testCaseResultRepository,
                            TestRunService testRunService) {
        this.testRunRepository = testRunRepository;
        this.testCaseResultRepository = testCaseResultRepository;
        this.testRunService = testRunService;
    }

    public DashboardSummaryDto getSummary() {
        DashboardSummaryDto summary = new DashboardSummaryDto();

        long totalRuns = testRunRepository.count();
        summary.setTotalRuns(totalRuns);

        if (totalRuns == 0) {
            summary.setLatestStatus(PipelineStatus.NOT_CONFIGURED);
            summary.setTotalTestsExecuted(0);
            summary.setPassedTests(0);
            summary.setFailedTests(0);
            summary.setSkippedTests(0);
            summary.setOverallSuccessRate(0.0);
            summary.setAverageCoverage(0.0);
            summary.setLatestRun(null);
            return summary;
        }

        Optional<TestRun> latestOpt = testRunRepository.findFirstByOrderByStartedAtDesc();
        if (latestOpt.isPresent()) {
            TestRun latest = latestOpt.get();
            summary.setLatestStatus(latest.getPipelineStatus());
            summary.setLatestRun(testRunService.mapToResponse(latest, false));
        }

        long totalTests = testRunRepository.sumTotalTests();
        long passedTests = testRunRepository.sumPassedTests();
        long failedTests = testRunRepository.sumFailedTests();
        long skippedTests = testRunRepository.sumSkippedTests();
        Double avgCov = testRunRepository.averageCoverage();

        summary.setTotalTestsExecuted(totalTests);
        summary.setPassedTests(passedTests);
        summary.setFailedTests(failedTests);
        summary.setSkippedTests(skippedTests);

        if (totalTests > 0) {
            double rate = (passedTests * 100.0) / totalTests;
            summary.setOverallSuccessRate(Math.round(rate * 10.0) / 10.0);
        } else {
            summary.setOverallSuccessRate(0.0);
        }

        summary.setAverageCoverage(avgCov != null ? Math.round(avgCov * 10.0) / 10.0 : 0.0);

        // Category distribution
        Map<String, Long> categoryMap = new HashMap<>();
        for (TestCategory cat : TestCategory.values()) {
            categoryMap.put(cat.name(), 0L);
        }

        List<Object[]> counts = testCaseResultRepository.countGroupedByCategory();
        if (counts != null) {
            for (Object[] row : counts) {
                if (row.length >= 2 && row[0] != null && row[1] != null) {
                    TestCategory cat = (TestCategory) row[0];
                    Long cnt = ((Number) row[1]).longValue();
                    categoryMap.put(cat.name(), cnt);
                }
            }
        }
        summary.setCategoryDistribution(categoryMap);

        // Recent runs (up to 5)
        List<TestRun> allRecent = testRunRepository.findAllByOrderByStartedAtDesc();
        List<TestRunResponse> recentResponses = allRecent.stream()
                .limit(5)
                .map(r -> testRunService.mapToResponse(r, false))
                .collect(Collectors.toList());
        summary.setRecentRuns(recentResponses);

        return summary;
    }
}
