package com.ci.dashboard.controller;

import com.ci.dashboard.dto.DashboardSummaryDto;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.service.DashboardService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/dashboard/summary should return JSON summary with 200 OK")
    void getSummary_ShouldReturnSummaryDto() throws Exception {
        DashboardSummaryDto dto = new DashboardSummaryDto();
        dto.setTotalRuns(5L);
        dto.setLatestStatus(PipelineStatus.SUCCESS);
        dto.setTotalTestsExecuted(120L);
        dto.setPassedTests(115L);
        dto.setFailedTests(3L);
        dto.setSkippedTests(2L);
        dto.setOverallSuccessRate(95.8);
        dto.setAverageCoverage(89.2);

        when(dashboardService.getSummary()).thenReturn(dto);

        mockMvc.perform(get("/api/dashboard/summary")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.totalRuns").value(5))
                .andExpect(jsonPath("$.latestStatus").value("SUCCESS"))
                .andExpect(jsonPath("$.totalTestsExecuted").value(120))
                .andExpect(jsonPath("$.passedTests").value(115))
                .andExpect(jsonPath("$.overallSuccessRate").value(95.8))
                .andExpect(jsonPath("$.averageCoverage").value(89.2));
    }
}
