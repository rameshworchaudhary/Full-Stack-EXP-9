package com.ci.dashboard.dto;

import com.ci.dashboard.entity.PipelineStatus;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class DashboardSummaryDto {

    private long totalRuns = 0;
    private PipelineStatus latestStatus = PipelineStatus.NOT_CONFIGURED;
    private long totalTestsExecuted = 0;
    private long passedTests = 0;
    private long failedTests = 0;
    private long skippedTests = 0;
    private double overallSuccessRate = 0.0;
    private double averageCoverage = 0.0;
    private TestRunResponse latestRun;
    private Map<String, Long> categoryDistribution = new HashMap<>();
    private List<TestRunResponse> recentRuns = new ArrayList<>();

    public DashboardSummaryDto() {
        categoryDistribution.put("UNIT", 0L);
        categoryDistribution.put("INTEGRATION", 0L);
        categoryDistribution.put("CONTRACT", 0L);
        categoryDistribution.put("E2E", 0L);
    }

    public long getTotalRuns() {
        return totalRuns;
    }

    public void setTotalRuns(long totalRuns) {
        this.totalRuns = totalRuns;
    }

    public PipelineStatus getLatestStatus() {
        return latestStatus;
    }

    public void setLatestStatus(PipelineStatus latestStatus) {
        this.latestStatus = latestStatus;
    }

    public long getTotalTestsExecuted() {
        return totalTestsExecuted;
    }

    public void setTotalTestsExecuted(long totalTestsExecuted) {
        this.totalTestsExecuted = totalTestsExecuted;
    }

    public long getPassedTests() {
        return passedTests;
    }

    public void setPassedTests(long passedTests) {
        this.passedTests = passedTests;
    }

    public long getFailedTests() {
        return failedTests;
    }

    public void setFailedTests(long failedTests) {
        this.failedTests = failedTests;
    }

    public long getSkippedTests() {
        return skippedTests;
    }

    public void setSkippedTests(long skippedTests) {
        this.skippedTests = skippedTests;
    }

    public double getOverallSuccessRate() {
        return overallSuccessRate;
    }

    public void setOverallSuccessRate(double overallSuccessRate) {
        this.overallSuccessRate = overallSuccessRate;
    }

    public double getAverageCoverage() {
        return averageCoverage;
    }

    public void setAverageCoverage(double averageCoverage) {
        this.averageCoverage = averageCoverage;
    }

    public TestRunResponse getLatestRun() {
        return latestRun;
    }

    public void setLatestRun(TestRunResponse latestRun) {
        this.latestRun = latestRun;
    }

    public Map<String, Long> getCategoryDistribution() {
        return categoryDistribution;
    }

    public void setCategoryDistribution(Map<String, Long> categoryDistribution) {
        this.categoryDistribution = categoryDistribution;
    }

    public List<TestRunResponse> getRecentRuns() {
        return recentRuns;
    }

    public void setRecentRuns(List<TestRunResponse> recentRuns) {
        this.recentRuns = recentRuns;
    }
}
