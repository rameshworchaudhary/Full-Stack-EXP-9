package com.ci.dashboard.controller;

import com.ci.dashboard.dto.TestCaseResultDto;
import com.ci.dashboard.dto.TestRunRequest;
import com.ci.dashboard.dto.TestRunResponse;
import com.ci.dashboard.service.TestRunService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/test-runs")
public class TestRunController {

    private final TestRunService testRunService;

    public TestRunController(TestRunService testRunService) {
        this.testRunService = testRunService;
    }

    @GetMapping
    public ResponseEntity<List<TestRunResponse>> getTestRuns(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search) {
        List<TestRunResponse> runs = testRunService.getTestRuns(status, category, search);
        return ResponseEntity.ok(runs);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TestRunResponse> getTestRunById(@PathVariable Long id) {
        TestRunResponse run = testRunService.getTestRunById(id);
        return ResponseEntity.ok(run);
    }

    @PostMapping
    public ResponseEntity<TestRunResponse> createTestRun(@Valid @RequestBody TestRunRequest request) {
        TestRunResponse created = testRunService.createTestRun(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @GetMapping("/{id}/cases")
    public ResponseEntity<List<TestCaseResultDto>> getTestCasesByRunId(@PathVariable Long id) {
        List<TestCaseResultDto> cases = testRunService.getTestCasesByRunId(id);
        return ResponseEntity.ok(cases);
    }
}
