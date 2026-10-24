package com.ci.dashboard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "test_runs", indexes = {
    @Index(name = "idx_test_run_commit", columnList = "commitSha"),
    @Index(name = "idx_test_run_status", columnList = "pipelineStatus")
})
public class TestRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true, length = 120)
    private String runIdentifier;

    @NotBlank
    @Column(nullable = false, length = 64)
    private String commitSha;

    @NotBlank
    @Column(nullable = false, length = 100)
    private String branchName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private PipelineStatus pipelineStatus;

    @Column(nullable = false)
    private Integer totalTests = 0;

    @Column(nullable = false)
    private Integer passedTests = 0;

    @Column(nullable = false)
    private Integer failedTests = 0;

    @Column(nullable = false)
    private Integer skippedTests = 0;

    @Column(nullable = false)
    private Double coveragePercentage = 0.0;

    @Column(nullable = false)
    private Long durationMillis = 0L;

    @NotNull
    @Column(nullable = false)
    private Instant startedAt;

    private Instant completedAt;

    @OneToMany(mappedBy = "testRun", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TestCaseResult> testCaseResults = new ArrayList<>();

    public TestRun() {}

    public TestRun(String runIdentifier, String commitSha, String branchName, PipelineStatus pipelineStatus,
                   Integer totalTests, Integer passedTests, Integer failedTests, Integer skippedTests,
                   Double coveragePercentage, Long durationMillis, Instant startedAt, Instant completedAt) {
        this.runIdentifier = runIdentifier;
        this.commitSha = commitSha;
        this.branchName = branchName;
        this.pipelineStatus = pipelineStatus;
        this.totalTests = totalTests != null ? totalTests : 0;
        this.passedTests = passedTests != null ? passedTests : 0;
        this.failedTests = failedTests != null ? failedTests : 0;
        this.skippedTests = skippedTests != null ? skippedTests : 0;
        this.coveragePercentage = coveragePercentage != null ? coveragePercentage : 0.0;
        this.durationMillis = durationMillis != null ? durationMillis : 0L;
        this.startedAt = startedAt != null ? startedAt : Instant.now();
        this.completedAt = completedAt;
    }

    public void addTestCaseResult(TestCaseResult caseResult) {
        testCaseResults.add(caseResult);
        caseResult.setTestRun(this);
    }

    public void removeTestCaseResult(TestCaseResult caseResult) {
        testCaseResults.remove(caseResult);
        caseResult.setTestRun(null);
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRunIdentifier() {
        return runIdentifier;
    }

    public void setRunIdentifier(String runIdentifier) {
        this.runIdentifier = runIdentifier;
    }

    public String getCommitSha() {
        return commitSha;
    }

    public void setCommitSha(String commitSha) {
        this.commitSha = commitSha;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public PipelineStatus getPipelineStatus() {
        return pipelineStatus;
    }

    public void setPipelineStatus(PipelineStatus pipelineStatus) {
        this.pipelineStatus = pipelineStatus;
    }

    public Integer getTotalTests() {
        return totalTests;
    }

    public void setTotalTests(Integer totalTests) {
        this.totalTests = totalTests;
    }

    public Integer getPassedTests() {
        return passedTests;
    }

    public void setPassedTests(Integer passedTests) {
        this.passedTests = passedTests;
    }

    public Integer getFailedTests() {
        return failedTests;
    }

    public void setFailedTests(Integer failedTests) {
        this.failedTests = failedTests;
    }

    public Integer getSkippedTests() {
        return skippedTests;
    }

    public void setSkippedTests(Integer skippedTests) {
        this.skippedTests = skippedTests;
    }

    public Double getCoveragePercentage() {
        return coveragePercentage;
    }

    public void setCoveragePercentage(Double coveragePercentage) {
        this.coveragePercentage = coveragePercentage;
    }

    public Long getDurationMillis() {
        return durationMillis;
    }

    public void setDurationMillis(Long durationMillis) {
        this.durationMillis = durationMillis;
    }

    public Instant getStartedAt() {
        return startedAt;
    }

    public void setStartedAt(Instant startedAt) {
        this.startedAt = startedAt;
    }

    public Instant getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(Instant completedAt) {
        this.completedAt = completedAt;
    }

    public List<TestCaseResult> getTestCaseResults() {
        return testCaseResults;
    }

    public void setTestCaseResults(List<TestCaseResult> testCaseResults) {
        this.testCaseResults = testCaseResults;
    }
}
