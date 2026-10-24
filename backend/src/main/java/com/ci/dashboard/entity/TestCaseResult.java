package com.ci.dashboard.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Entity
@Table(name = "test_case_results", indexes = {
    @Index(name = "idx_case_category", columnList = "testCategory"),
    @Index(name = "idx_case_status", columnList = "testStatus")
})
public class TestCaseResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "test_run_id", nullable = false)
    private TestRun testRun;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String testName;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TestCategory testCategory;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private TestStatus testStatus;

    @Column(nullable = false)
    private Long durationMillis = 0L;

    @Column(columnDefinition = "TEXT")
    private String failureMessage;

    public TestCaseResult() {}

    public TestCaseResult(TestRun testRun, String testName, TestCategory testCategory,
                          TestStatus testStatus, Long durationMillis, String failureMessage) {
        this.testRun = testRun;
        this.testName = testName;
        this.testCategory = testCategory;
        this.testStatus = testStatus;
        this.durationMillis = durationMillis != null ? durationMillis : 0L;
        this.failureMessage = failureMessage;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public TestRun getTestRun() {
        return testRun;
    }

    public void setTestRun(TestRun testRun) {
        this.testRun = testRun;
    }

    public Long getTestRunId() {
        return testRun != null ? testRun.getId() : null;
    }

    public String getTestName() {
        return testName;
    }

    public void setTestName(String testName) {
        this.testName = testName;
    }

    public TestCategory getTestCategory() {
        return testCategory;
    }

    public void setTestCategory(TestCategory testCategory) {
        this.testCategory = testCategory;
    }

    public TestStatus getTestStatus() {
        return testStatus;
    }

    public void setTestStatus(TestStatus testStatus) {
        this.testStatus = testStatus;
    }

    public Long getDurationMillis() {
        return durationMillis;
    }

    public void setDurationMillis(Long durationMillis) {
        this.durationMillis = durationMillis;
    }

    public String getFailureMessage() {
        return failureMessage;
    }

    public void setFailureMessage(String failureMessage) {
        this.failureMessage = failureMessage;
    }
}
