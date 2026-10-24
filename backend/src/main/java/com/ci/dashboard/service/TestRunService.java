package com.ci.dashboard.service;

import com.ci.dashboard.dto.TestCaseResultDto;
import com.ci.dashboard.dto.TestRunRequest;
import com.ci.dashboard.dto.TestRunResponse;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestCaseResult;
import com.ci.dashboard.entity.TestCategory;
import com.ci.dashboard.entity.TestRun;
import com.ci.dashboard.entity.TestStatus;
import com.ci.dashboard.exception.ResourceNotFoundException;
import com.ci.dashboard.repository.TestCaseResultRepository;
import com.ci.dashboard.repository.TestRunRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class TestRunService {

    private final TestRunRepository testRunRepository;
    private final TestCaseResultRepository testCaseResultRepository;

    public TestRunService(TestRunRepository testRunRepository, TestCaseResultRepository testCaseResultRepository) {
        this.testRunRepository = testRunRepository;
        this.testCaseResultRepository = testCaseResultRepository;
    }

    public TestRunResponse createTestRun(TestRunRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("TestRunRequest cannot be null");
        }
        if (request.getCommitSha() == null || request.getCommitSha().trim().isEmpty()) {
            throw new IllegalArgumentException("commitSha cannot be blank");
        }
        if (request.getBranchName() == null || request.getBranchName().trim().isEmpty()) {
            throw new IllegalArgumentException("branchName cannot be blank");
        }

        TestRun run = new TestRun();
        String runId = request.getRunIdentifier();
        if (runId == null || runId.trim().isEmpty()) {
            runId = "RUN-" + System.currentTimeMillis();
        }
        run.setRunIdentifier(runId);
        run.setCommitSha(request.getCommitSha().trim());
        run.setBranchName(request.getBranchName().trim());

        // Process test cases if provided
        List<TestCaseResultDto> caseDtos = request.getTestCases() != null ? request.getTestCases() : new ArrayList<>();
        
        int total = request.getTotalTests() != null ? request.getTotalTests() : 0;
        int passed = request.getPassedTests() != null ? request.getPassedTests() : 0;
        int failed = request.getFailedTests() != null ? request.getFailedTests() : 0;
        int skipped = request.getSkippedTests() != null ? request.getSkippedTests() : 0;

        if (!caseDtos.isEmpty() && total == 0) {
            total = caseDtos.size();
            passed = (int) caseDtos.stream().filter(c -> c.getTestStatus() == TestStatus.PASSED).count();
            failed = (int) caseDtos.stream().filter(c -> c.getTestStatus() == TestStatus.FAILED).count();
            skipped = (int) caseDtos.stream().filter(c -> c.getTestStatus() == TestStatus.SKIPPED).count();
        }

        run.setTotalTests(total);
        run.setPassedTests(passed);
        run.setFailedTests(failed);
        run.setSkippedTests(skipped);

        // Derive pipeline status if not explicitly given
        if (request.getPipelineStatus() != null) {
            run.setPipelineStatus(request.getPipelineStatus());
        } else {
            if (failed > 0) {
                run.setPipelineStatus(PipelineStatus.FAILED);
            } else if (total > 0 && passed > 0) {
                run.setPipelineStatus(PipelineStatus.SUCCESS);
            } else {
                run.setPipelineStatus(PipelineStatus.RUNNING);
            }
        }

        double coverage = request.getCoveragePercentage() != null ? request.getCoveragePercentage() : 0.0;
        run.setCoveragePercentage(Math.max(0.0, Math.min(100.0, coverage)));

        long duration = request.getDurationMillis() != null ? request.getDurationMillis() : 0L;
        run.setDurationMillis(Math.max(0L, duration));

        run.setStartedAt(request.getStartedAt() != null ? request.getStartedAt() : Instant.now());
        run.setCompletedAt(request.getCompletedAt() != null ? request.getCompletedAt() : Instant.now());

        // Attach test case results
        for (TestCaseResultDto cDto : caseDtos) {
            TestCaseResult result = new TestCaseResult(
                    run,
                    cDto.getTestName(),
                    cDto.getTestCategory(),
                    cDto.getTestStatus(),
                    cDto.getDurationMillis(),
                    cDto.getFailureMessage()
            );
            run.addTestCaseResult(result);
        }

        TestRun saved = testRunRepository.save(run);
        return mapToResponse(saved, true);
    }

    @Transactional(readOnly = true)
    public List<TestRunResponse> getTestRuns(String status, String category, String search) {
        List<TestRun> runs;

        if (status != null && !status.trim().isEmpty()) {
            try {
                PipelineStatus pipelineStatus = PipelineStatus.valueOf(status.trim().toUpperCase());
                runs = testRunRepository.findByPipelineStatusOrderByStartedAtDesc(pipelineStatus);
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid status filter: " + status);
            }
        } else if (search != null && !search.trim().isEmpty()) {
            runs = testRunRepository.findByCommitShaContainingIgnoreCaseOrRunIdentifierContainingIgnoreCaseOrderByStartedAtDesc(
                    search.trim(), search.trim());
        } else {
            runs = testRunRepository.findAllByOrderByStartedAtDesc();
        }

        // Category filtering if specified
        if (category != null && !category.trim().isEmpty()) {
            TestCategory testCat;
            try {
                testCat = TestCategory.valueOf(category.trim().toUpperCase());
            } catch (IllegalArgumentException e) {
                throw new IllegalArgumentException("Invalid category filter: " + category);
            }

            runs = runs.stream().filter(run -> {
                List<TestCaseResult> cases = testCaseResultRepository.findByTestRunIdAndTestCategory(run.getId(), testCat);
                return !cases.isEmpty();
            }).collect(Collectors.toList());
        }

        return runs.stream().map(r -> mapToResponse(r, false)).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public TestRunResponse getTestRunById(Long id) {
        TestRun run = testRunRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Test run not found with ID: " + id));
        return mapToResponse(run, true);
    }

    @Transactional(readOnly = true)
    public List<TestCaseResultDto> getTestCasesByRunId(Long runId) {
        if (!testRunRepository.existsById(runId)) {
            throw new ResourceNotFoundException("Test run not found with ID: " + runId);
        }
        return testCaseResultRepository.findByTestRunId(runId)
                .stream()
                .map(this::mapCaseToDto)
                .collect(Collectors.toList());
    }

    public TestRunResponse mapToResponse(TestRun run, boolean includeCases) {
        TestRunResponse resp = new TestRunResponse();
        resp.setId(run.getId());
        resp.setRunIdentifier(run.getRunIdentifier());
        resp.setCommitSha(run.getCommitSha());
        resp.setBranchName(run.getBranchName());
        resp.setPipelineStatus(run.getPipelineStatus());
        resp.setTotalTests(run.getTotalTests());
        resp.setPassedTests(run.getPassedTests());
        resp.setFailedTests(run.getFailedTests());
        resp.setSkippedTests(run.getSkippedTests());
        resp.setCoveragePercentage(run.getCoveragePercentage());
        resp.setDurationMillis(run.getDurationMillis());
        resp.setStartedAt(run.getStartedAt());
        resp.setCompletedAt(run.getCompletedAt());

        // Calculate success rate safely
        if (run.getTotalTests() != null && run.getTotalTests() > 0 && run.getPassedTests() != null) {
            double rate = (run.getPassedTests() * 100.0) / run.getTotalTests();
            resp.setSuccessRate(Math.round(rate * 10.0) / 10.0);
        } else {
            resp.setSuccessRate(0.0);
        }

        if (includeCases && run.getTestCaseResults() != null) {
            resp.setTestCases(run.getTestCaseResults().stream().map(this::mapCaseToDto).collect(Collectors.toList()));
        }

        return resp;
    }

    public TestCaseResultDto mapCaseToDto(TestCaseResult c) {
        TestCaseResultDto dto = new TestCaseResultDto();
        dto.setId(c.getId());
        dto.setTestRunId(c.getTestRun() != null ? c.getTestRun().getId() : null);
        dto.setTestName(c.getTestName());
        dto.setTestCategory(c.getTestCategory());
        dto.setTestStatus(c.getTestStatus());
        dto.setDurationMillis(c.getDurationMillis());
        dto.setFailureMessage(c.getFailureMessage());
        return dto;
    }
}
