package com.ci.dashboard.controller;

import com.ci.dashboard.dto.TestCaseResultDto;
import com.ci.dashboard.dto.TestRunRequest;
import com.ci.dashboard.dto.TestRunResponse;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestCategory;
import com.ci.dashboard.entity.TestStatus;
import com.ci.dashboard.exception.ResourceNotFoundException;
import com.ci.dashboard.service.TestRunService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class TestRunControllerMockMvcTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TestRunService testRunService;

    @Test
    @DisplayName("GET /api/test-runs should return list of test runs")
    void getTestRuns_ReturnsList() throws Exception {
        TestRunResponse resp = new TestRunResponse();
        resp.setId(1L);
        resp.setRunIdentifier("RUN-001");
        resp.setCommitSha("c0ffee");
        resp.setBranchName("main");
        resp.setPipelineStatus(PipelineStatus.SUCCESS);

        when(testRunService.getTestRuns(null, null, null)).thenReturn(Collections.singletonList(resp));

        mockMvc.perform(get("/api/test-runs")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].runIdentifier").value("RUN-001"))
                .andExpect(jsonPath("$[0].pipelineStatus").value("SUCCESS"));
    }

    @Test
    @DisplayName("GET /api/test-runs/{id} should return single test run")
    void getTestRunById_Found_Returns200() throws Exception {
        TestRunResponse resp = new TestRunResponse();
        resp.setId(42L);
        resp.setRunIdentifier("RUN-042");
        resp.setCommitSha("abcdef1");
        resp.setBranchName("main");
        resp.setPipelineStatus(PipelineStatus.SUCCESS);

        when(testRunService.getTestRunById(42L)).thenReturn(resp);

        mockMvc.perform(get("/api/test-runs/42")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(42))
                .andExpect(jsonPath("$.runIdentifier").value("RUN-042"));
    }

    @Test
    @DisplayName("GET /api/test-runs/{id} should return 404 when not found")
    void getTestRunById_NotFound_Returns404() throws Exception {
        when(testRunService.getTestRunById(999L))
                .thenThrow(new ResourceNotFoundException("Test run not found with ID: 999"));

        mockMvc.perform(get("/api/test-runs/999")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    @DisplayName("POST /api/test-runs with valid token and payload should return 201 Created")
    void createTestRun_ValidAuthAndPayload_Returns201() throws Exception {
        TestRunRequest request = new TestRunRequest();
        request.setRunIdentifier("RUN-CI-100");
        request.setCommitSha("1a2b3c4d");
        request.setBranchName("main");
        request.setTotalTests(10);
        request.setPassedTests(10);
        request.setFailedTests(0);
        request.setSkippedTests(0);
        request.setCoveragePercentage(94.2);
        request.setDurationMillis(2400L);
        request.setStartedAt(Instant.now());

        TestRunResponse response = new TestRunResponse();
        response.setId(100L);
        response.setRunIdentifier("RUN-CI-100");
        response.setCommitSha("1a2b3c4d");
        response.setBranchName("main");
        response.setPipelineStatus(PipelineStatus.SUCCESS);
        response.setTotalTests(10);
        response.setPassedTests(10);
        response.setCoveragePercentage(94.2);

        when(testRunService.createTestRun(any(TestRunRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/test-runs")
                        .header("X-CI-Token", "test-ci-token-12345")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(100))
                .andExpect(jsonPath("$.runIdentifier").value("RUN-CI-100"))
                .andExpect(jsonPath("$.pipelineStatus").value("SUCCESS"));
    }

    @Test
    @DisplayName("POST /api/test-runs with invalid token should return 401 Unauthorized")
    void createTestRun_InvalidToken_Returns401() throws Exception {
        TestRunRequest request = new TestRunRequest();
        request.setCommitSha("1a2b3c4d");
        request.setBranchName("main");

        mockMvc.perform(post("/api/test-runs")
                        .header("X-CI-Token", "wrong-secret-token")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("POST /api/test-runs without auth token should return 401 Unauthorized")
    void createTestRun_MissingToken_Returns401() throws Exception {
        TestRunRequest request = new TestRunRequest();
        request.setCommitSha("1a2b3c4d");
        request.setBranchName("main");

        mockMvc.perform(post("/api/test-runs")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error").value("Unauthorized"));
    }

    @Test
    @DisplayName("POST /api/test-runs with blank commitSha should return 400 Bad Request")
    void createTestRun_InvalidBody_Returns400() throws Exception {
        TestRunRequest invalidRequest = new TestRunRequest();
        invalidRequest.setCommitSha(""); // Blank is rejected by @NotBlank
        invalidRequest.setBranchName("main");

        mockMvc.perform(post("/api/test-runs")
                        .header("X-CI-Token", "test-ci-token-12345")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(invalidRequest)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("Validation Failed"));
    }

    @Test
    @DisplayName("GET /api/test-runs/{id}/cases should return list of test cases")
    void getTestCasesByRunId_ReturnsList() throws Exception {
        TestCaseResultDto caseDto = new TestCaseResultDto(1L, 10L, "testSample", TestCategory.UNIT, TestStatus.PASSED, 50L, null);

        when(testRunService.getTestCasesByRunId(10L)).thenReturn(Collections.singletonList(caseDto));

        mockMvc.perform(get("/api/test-runs/10/cases")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].testName").value("testSample"))
                .andExpect(jsonPath("$[0].testStatus").value("PASSED"));
    }
}
