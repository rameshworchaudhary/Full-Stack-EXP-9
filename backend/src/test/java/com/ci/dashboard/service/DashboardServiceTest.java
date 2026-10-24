package com.ci.dashboard.service;

import com.ci.dashboard.dto.DashboardSummaryDto;
import com.ci.dashboard.dto.TestRunResponse;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestCategory;
import com.ci.dashboard.entity.TestRun;
import com.ci.dashboard.repository.TestCaseResultRepository;
import com.ci.dashboard.repository.TestRunRepository;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private TestRunRepository testRunRepository;

    @Mock
    private TestCaseResultRepository testCaseResultRepository;

    @Mock
    private TestRunService testRunService;

    @InjectMocks
    private DashboardService dashboardService;

    @Test
    @DisplayName("Should return NOT_CONFIGURED and zeros when no test runs exist in database")
    void getSummary_NoRuns_ReturnsEmptyState() {
        when(testRunRepository.count()).thenReturn(0L);

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertNotNull(summary);
        assertEquals(0, summary.getTotalRuns());
        assertEquals(PipelineStatus.NOT_CONFIGURED, summary.getLatestStatus());
        assertEquals(0, summary.getTotalTestsExecuted());
        assertEquals(0, summary.getPassedTests());
        assertEquals(0, summary.getFailedTests());
        assertEquals(0.0, summary.getOverallSuccessRate());
        assertEquals(0.0, summary.getAverageCoverage());
        assertNull(summary.getLatestRun());
        verify(testRunRepository, never()).findFirstByOrderByStartedAtDesc();
    }

    @Test
    @DisplayName("Should accurately aggregate test metrics, success rate, and category distribution from database")
    void getSummary_WithExistingRuns_ComputesAccurateMetrics() {
        TestRun run1 = new TestRun("RUN-1", "sha1", "main", PipelineStatus.SUCCESS,
                20, 18, 2, 0, 85.0, 5000L, Instant.now(), Instant.now());
        run1.setId(1L);

        when(testRunRepository.count()).thenReturn(2L);
        when(testRunRepository.findFirstByOrderByStartedAtDesc()).thenReturn(Optional.of(run1));
        when(testRunRepository.sumTotalTests()).thenReturn(50L);
        when(testRunRepository.sumPassedTests()).thenReturn(45L);
        when(testRunRepository.sumFailedTests()).thenReturn(4L);
        when(testRunRepository.sumSkippedTests()).thenReturn(1L);
        when(testRunRepository.averageCoverage()).thenReturn(87.45);

        List<Object[]> categoryCounts = new ArrayList<>();
        categoryCounts.add(new Object[]{TestCategory.UNIT, 30L});
        categoryCounts.add(new Object[]{TestCategory.INTEGRATION, 15L});
        categoryCounts.add(new Object[]{TestCategory.CONTRACT, 5L});
        when(testCaseResultRepository.countGroupedByCategory()).thenReturn(categoryCounts);

        TestRunResponse mockResponse = new TestRunResponse();
        mockResponse.setId(1L);
        mockResponse.setRunIdentifier("RUN-1");
        mockResponse.setPipelineStatus(PipelineStatus.SUCCESS);
        when(testRunService.mapToResponse(any(TestRun.class), eq(false))).thenReturn(mockResponse);

        when(testRunRepository.findAllByOrderByStartedAtDesc()).thenReturn(Collections.singletonList(run1));

        DashboardSummaryDto summary = dashboardService.getSummary();

        assertNotNull(summary);
        assertEquals(2, summary.getTotalRuns());
        assertEquals(PipelineStatus.SUCCESS, summary.getLatestStatus());
        assertEquals(50L, summary.getTotalTestsExecuted());
        assertEquals(45L, summary.getPassedTests());
        assertEquals(4L, summary.getFailedTests());
        assertEquals(1L, summary.getSkippedTests());
        assertEquals(90.0, summary.getOverallSuccessRate(), "45 / 50 * 100 = 90.0%");
        assertEquals(87.5, summary.getAverageCoverage());
        assertEquals(30L, summary.getCategoryDistribution().get("UNIT"));
        assertEquals(15L, summary.getCategoryDistribution().get("INTEGRATION"));
        assertEquals(5L, summary.getCategoryDistribution().get("CONTRACT"));
        assertEquals(0L, summary.getCategoryDistribution().get("E2E"));
        assertEquals(1, summary.getRecentRuns().size());
    }
}
