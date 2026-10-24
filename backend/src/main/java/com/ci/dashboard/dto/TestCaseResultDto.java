package com.ci.dashboard.dto;

import com.ci.dashboard.entity.TestCategory;
import com.ci.dashboard.entity.TestStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class TestCaseResultDto {

    private Long id;
    private Long testRunId;

    @NotBlank(message = "testName cannot be blank")
    private String testName;

    @NotNull(message = "testCategory is required (UNIT, INTEGRATION, CONTRACT, E2E)")
    private TestCategory testCategory;

    @NotNull(message = "testStatus is required (PASSED, FAILED, SKIPPED)")
    private TestStatus testStatus;

    private Long durationMillis = 0L;
    private String failureMessage;

    public TestCaseResultDto() {}

    public TestCaseResultDto(Long id, Long testRunId, String testName, TestCategory testCategory,
                             TestStatus testStatus, Long durationMillis, String failureMessage) {
        this.id = id;
        this.testRunId = testRunId;
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

    public Long getTestRunId() {
        return testRunId;
    }

    public void setTestRunId(Long testRunId) {
        this.testRunId = testRunId;
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
