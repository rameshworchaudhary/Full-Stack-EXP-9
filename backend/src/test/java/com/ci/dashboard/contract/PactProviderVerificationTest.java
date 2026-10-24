package com.ci.dashboard.contract;

import au.com.dius.pact.provider.junit5.HttpTestTarget;
import au.com.dius.pact.provider.junit5.PactVerificationContext;
import au.com.dius.pact.provider.junit5.PactVerificationInvocationContextProvider;
import au.com.dius.pact.provider.junitsupport.Provider;
import au.com.dius.pact.provider.junitsupport.State;
import au.com.dius.pact.provider.junitsupport.loader.PactFolder;
import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestRun;
import com.ci.dashboard.repository.TestCaseResultRepository;
import com.ci.dashboard.repository.TestRunRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.TestTemplate;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.test.context.ActiveProfiles;

import java.time.Instant;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Provider("BackendProvider")
@PactFolder("src/test/resources/pacts")
@ActiveProfiles("test")
public class PactProviderVerificationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private TestRunRepository testRunRepository;

    @Autowired
    private TestCaseResultRepository testCaseResultRepository;

    @BeforeEach
    void setupContext(PactVerificationContext context) {
        if (context != null) {
            context.setTarget(new HttpTestTarget("localhost", port));
        }
    }

    @TestTemplate
    @ExtendWith(PactVerificationInvocationContextProvider.class)
    @DisplayName("Verify pact contract interactions against real Spring Boot provider")
    void pactVerificationTestTemplate(PactVerificationContext context) {
        if (context != null) {
            context.verifyInteraction();
        }
    }

    @State("dashboard summary data exists")
    public void toDashboardSummaryState() {
        testCaseResultRepository.deleteAll();
        testRunRepository.deleteAll();
        TestRun run = new TestRun(
                "RUN-CONTRACT-100",
                "e4d3c2b1",
                "main",
                PipelineStatus.SUCCESS,
                25,
                25,
                0,
                0,
                91.5,
                3000L,
                Instant.parse("2026-10-19T10:00:00Z"),
                Instant.parse("2026-10-19T10:00:05Z")
        );
        testRunRepository.saveAndFlush(run);
    }

    @State("test runs exist in system")
    public void toTestRunsState() {
        testCaseResultRepository.deleteAll();
        testRunRepository.deleteAll();
        TestRun run = new TestRun(
                "RUN-CONTRACT-100",
                "e4d3c2b1",
                "main",
                PipelineStatus.SUCCESS,
                25,
                25,
                0,
                0,
                91.5,
                3000L,
                Instant.parse("2026-10-19T10:00:00Z"),
                Instant.parse("2026-10-19T10:00:05Z")
        );
        testRunRepository.saveAndFlush(run);
    }
}
