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
import org.junit.jupiter.api.BeforeEach;
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
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class TestRunServiceTest {

    @Mock
    private TestRunRepository testRunRepository;

    @Mock
    private TestCaseResultRepository testCaseResultRepository;

    @InjectMocks
    private TestRunService testRunService;

    private TestRun sampleRun;

    @BeforeEach
    void setUp() {
        sampleRun = new TestRun(
                "RUN-1001",
                "a1b2c3d4e5",
                "main",
                PipelineStatus.SUCCESS,
                10,
                10,
                0,
                0,
                92.5,
                4200L,
                Instant.now(),
                Instant.now()
        );
        sampleRun.setId(1L);
    }

    @Test
    @DisplayName("Should create test run successfully and compute status from test cases")
    void createTestRun_WithCases_ShouldDeriveStatusAndCounts() {
        TestRunRequest request = new TestRunRequest();
        request.setRunIdentifier("RUN-AUTO-01");
        request.setCommitSha("f9e8d7c");
        request.setBranchName("feature/login");
        request.setCoveragePercentage(88.0);
        request.setDurationMillis(3500L);

        List<TestCaseResultDto> cases = new ArrayList<>();
        cases.add(new TestCaseResultDto(null, null, "testAuthSuccess", TestCategory.UNIT, TestStatus.PASSED, 120L, null));
        cases.add(new TestCaseResultDto(null, null, "testAuthFailure", TestCategory.UNIT, TestStatus.PASSED, 95L, null));
        cases.add(new TestCaseResultDto(null, null, "testDbSync", TestCategory.INTEGRATION, TestStatus.FAILED, 500L, "Timeout connecting to DB"));
        request.setTestCases(cases);

        when(testRunRepository.save(any(TestRun.class))).thenAnswer(invocation -> {
            TestRun saved = invocation.getArgument(0);
            saved.setId(99L);
            return saved;
        });

        TestRunResponse response = testRunService.createTestRun(request);

        assertNotNull(response);
        assertEquals(99L, response.getId());
        assertEquals("RUN-AUTO-01", response.getRunIdentifier());
        assertEquals(PipelineStatus.FAILED, response.getPipelineStatus(), "Pipeline status should be FAILED due to 1 failed test");
        assertEquals(3, response.getTotalTests());
        assertEquals(2, response.getPassedTests());
        assertEquals(1, response.getFailedTests());
        assertEquals(66.7, response.getSuccessRate());
        verify(testRunRepository, times(1)).save(any(TestRun.class));
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when commitSha is blank")
    void createTestRun_BlankCommitSha_ThrowsException() {
        TestRunRequest request = new TestRunRequest();
        request.setCommitSha("   ");
        request.setBranchName("main");

        IllegalArgumentException ex = assertThrows(IllegalArgumentException.class, () -> testRunService.createTestRun(request));
        assertTrue(ex.getMessage().contains("commitSha cannot be blank"));
        verifyNoInteractions(testRunRepository);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException when request is null")
    void createTestRun_NullRequest_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> testRunService.createTestRun(null));
    }

    @Test
    @DisplayName("Should retrieve test run by id when exists")
    void getTestRunById_ExistingId_ReturnsResponse() {
        when(testRunRepository.findById(1L)).thenReturn(Optional.of(sampleRun));

        TestRunResponse response = testRunService.getTestRunById(1L);

        assertNotNull(response);
        assertEquals(1L, response.getId());
        assertEquals("RUN-1001", response.getRunIdentifier());
        assertEquals(100.0, response.getSuccessRate());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when test run id does not exist")
    void getTestRunById_NonExistingId_ThrowsResourceNotFoundException() {
        when(testRunRepository.findById(999L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> testRunService.getTestRunById(999L));
    }

    @Test
    @DisplayName("Should filter test runs by status correctly")
    void getTestRuns_WithStatusFilter_ReturnsFilteredList() {
        when(testRunRepository.findByPipelineStatusOrderByStartedAtDesc(PipelineStatus.SUCCESS))
                .thenReturn(Collections.singletonList(sampleRun));

        List<TestRunResponse> results = testRunService.getTestRuns("SUCCESS", null, null);

        assertEquals(1, results.size());
        assertEquals(PipelineStatus.SUCCESS, results.get(0).getPipelineStatus());
        verify(testRunRepository).findByPipelineStatusOrderByStartedAtDesc(PipelineStatus.SUCCESS);
    }

    @Test
    @DisplayName("Should throw IllegalArgumentException for invalid status filter")
    void getTestRuns_InvalidStatusFilter_ThrowsException() {
        assertThrows(IllegalArgumentException.class, () -> testRunService.getTestRuns("INVALID_STATUS", null, null));
    }
}
