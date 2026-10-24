package com.ci.dashboard.integration;

import com.ci.dashboard.dto.DashboardSummaryDto;
import com.ci.dashboard.entity.*;
import com.ci.dashboard.repository.TestCaseResultRepository;
import com.ci.dashboard.repository.TestRunRepository;
import com.ci.dashboard.service.DashboardService;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Testcontainers
@DisplayName("PostgreSQL Database Integration Tests via Testcontainers")
public class PostgreSqlTestcontainersTest {

    @Container
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:15-alpine")
            .withDatabaseName("testdb")
            .withUsername("testuser")
            .withPassword("testpass");

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", postgres::getJdbcUrl);
        registry.add("spring.datasource.username", postgres::getUsername);
        registry.add("spring.datasource.password", postgres::getPassword);
        registry.add("spring.datasource.driverClassName", () -> "org.postgresql.Driver");
        registry.add("spring.jpa.database-platform", () -> "org.hibernate.dialect.PostgreSQLDialect");
        registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
    }

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private TestCaseResultRepository testCaseResultRepository;

    @Autowired
    private DashboardService dashboardService;

    @BeforeEach
    void cleanUp() {
        testCaseResultRepository.deleteAll();
        testRunRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully connect to PostgreSQL container and verify container is running")
    void testContainerRunning() {
        assertTrue(postgres.isRunning(), "PostgreSQL test container should be running");
    }

    @Test
    @DisplayName("Should persist TestRun and associated TestCaseResults in PostgreSQL and verify relationships")
    void testPersistAndRetrieveTestRun() {
        TestRun run = new TestRun(
                "RUN-CONTAINER-001",
                "c3f7b2a",
                "feature/postgres-integration",
                PipelineStatus.SUCCESS,
                3,
                3,
                0,
                0,
                95.0,
                1500L,
                Instant.now(),
                Instant.now()
        );

        TestCaseResult case1 = new TestCaseResult(run, "testUserRegistration", TestCategory.UNIT, TestStatus.PASSED, 150L, null);
        TestCaseResult case2 = new TestCaseResult(run, "testOrderCheckoutApi", TestCategory.INTEGRATION, TestStatus.PASSED, 450L, null);
        TestCaseResult case3 = new TestCaseResult(run, "testContractVerification", TestCategory.CONTRACT, TestStatus.PASSED, 300L, null);

        run.addTestCaseResult(case1);
        run.addTestCaseResult(case2);
        run.addTestCaseResult(case3);

        TestRun saved = testRunRepository.save(run);
        assertNotNull(saved.getId(), "Generated ID should not be null in PostgreSQL");

        Optional<TestRun> fetched = testRunRepository.findById(saved.getId());
        assertTrue(fetched.isPresent());
        assertEquals("RUN-CONTAINER-001", fetched.get().getRunIdentifier());

        List<TestCaseResult> savedCases = testCaseResultRepository.findByTestRunId(saved.getId());
        assertEquals(3, savedCases.size());
    }

    @Test
    @DisplayName("Should compute dashboard summary aggregates from real PostgreSQL records")
    void testDashboardSummaryOnPostgres() {
        TestRun run1 = new TestRun(
                "RUN-PG-1", "sha111", "main", PipelineStatus.SUCCESS,
                10, 10, 0, 0, 90.0, 2000L, Instant.now(), Instant.now()
        );
        TestRun run2 = new TestRun(
                "RUN-PG-2", "sha222", "main", PipelineStatus.FAILED,
                10, 8, 2, 0, 80.0, 2500L, Instant.now(), Instant.now()
        );

        testRunRepository.save(run1);
        testRunRepository.save(run2);

        DashboardSummaryDto summary = dashboardService.getSummary();
        assertNotNull(summary);
        assertEquals(2, summary.getTotalRuns());
        assertEquals(20, summary.getTotalTestsExecuted());
        assertEquals(18, summary.getPassedTests());
        assertEquals(2, summary.getFailedTests());
        assertEquals(90.0, summary.getOverallSuccessRate(), "18 / 20 * 100 = 90.0%");
        assertEquals(85.0, summary.getAverageCoverage(), "Average of 90.0 and 80.0 is 85.0%");
    }
}
