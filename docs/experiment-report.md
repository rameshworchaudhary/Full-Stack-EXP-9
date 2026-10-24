# College Laboratory Experiment Report

## Experiment Title: Continuous Integration Pipeline with Automated Testing

**Candidate Name:** Rameshwor Chaudhary  
**Student UID / Roll No:** 24BAI71012  
**Department:** Computer Science & Engineering / Artificial Intelligence  
**Laboratory:** DevOps & Automated Testing Lab

---

### 1. Aim
To design, implement, and validate an automated Continuous Integration (CI) pipeline featuring full-stack automated testing (Unit, REST API Integration, Consumer-Driven Contract, and Database Integration testing with Testcontainers) and automated reporting on GitHub Actions.

---

### 2. Objectives
1. Implement a layered Spring Boot 3.x REST backend with JPA, H2, and PostgreSQL support.
2. Develop a developer-grade React dashboard with TypeScript, Tailwind CSS, and Recharts.
3. Write unit tests using JUnit 5 and Mockito covering service calculations and validations.
4. Implement REST API integration tests using MockMvc with security token validation.
5. Implement consumer-driven contract testing using Pact JVM against the Spring Boot HTTP provider.
6. Implement database integration testing using Testcontainers with PostgreSQL 15.
7. Configure an automated GitHub Actions CI workflow to build, test, generate JaCoCo coverage, and publish artifacts.
8. Implement an authenticated reporting ingestion utility using Python and custom token verification (`X-CI-Token`).

---

### 3. Theory & Background
Continuous Integration (CI) is a software engineering practice where members of a development team integrate their work frequently. Each integration is verified by an automated build and automated testing to detect integration errors as quickly as possible.

Traditional CI pipelines suffer from two common pitfalls:
- Over-reliance on slow, brittle end-to-end tests that fail due to network timeouts.
- Neglect of contract compatibility between frontend consumer clients and backend API providers.

To address these challenges, this experiment implements a comprehensive testing pyramid:
- **Unit Tests:** Fast, isolated tests of business rules.
- **MockMvc Tests:** In-memory verification of the HTTP web layer and security filters.
- **Pact Contract Tests:** Consumer-driven contract verification that eliminates brittle end-to-end environments while guaranteeing API backward compatibility.
- **Testcontainers Integration:** Testing against actual containerized databases (PostgreSQL) rather than artificial mocks.

---

### 4. Software Requirements
- **JDK:** OpenJDK 17.0.20.1 (LTS)
- **Build Tool:** Apache Maven 3.8.7
- **Node.js:** Node.js 20.x with npm
- **Backend:** Spring Boot 3.3.4, Hibernate 6.5, HikariCP, H2 Database, PostgreSQL Driver
- **Frontend:** React 19, Vite 6, Tailwind CSS v4, Axios, Recharts, Lucide React
- **Testing Libraries:** JUnit 5.10.3, Mockito 5.11.0, Pact JVM 4.6.14, Testcontainers 1.20.2, JaCoCo 0.8.12
- **CI Platform:** GitHub Actions (`ubuntu-latest`)

---

### 5. Procedure & Workflow Stages
1. **Repository Setup:** Organize a clean monorepo structure separating `frontend/` and `backend/`.
2. **Backend Domain Implementation:** Create `TestRun` and `TestCaseResult` JPA entities with enumerated types (`PipelineStatus`, `TestCategory`, `TestStatus`).
3. **Service & Controller Development:** Create `TestRunService` and `DashboardService` with aggregate queries, validation, and `GlobalExceptionHandler`.
4. **Security Filter:** Implement `IngestionSecurityFilter` enforcing `X-CI-Token` verification on mutating endpoints.
5. **Unit & API Testing:** Write JUnit 5 / Mockito unit tests and MockMvc controller integration tests.
6. **Pact Contract Definition:** Create `FrontendConsumer-BackendProvider.json` and configure `PactProviderVerificationTest`.
7. **Testcontainers Setup:** Configure `PostgreSqlTestcontainersTest` using `@Testcontainers` and `@Container`.
8. **Frontend Dashboard:** Build Overview, Test Runs, Test Run Details, CI Pipeline, Testing Strategy, and Documentation views.
9. **CI Workflow Configuration:** Write `.github/workflows/ci.yml` defining the 9-stage build and test lifecycle.
10. **Ingestion Utility:** Write `scripts/publish-ci-results.py` to parse JUnit XML and JaCoCo coverage and submit to the backend.

---

### 6. Important Source Files

| File Path | Description |
|-----------|-------------|
| `backend/pom.xml` | Maven configuration for Spring Boot, Pact, Testcontainers, and JaCoCo |
| `backend/src/main/java/.../entity/TestRun.java` | Core JPA entity storing test run metadata and telemetry |
| `backend/src/main/java/.../service/TestRunService.java` | Business logic for processing test runs and status deduction |
| `backend/src/main/java/.../config/IngestionSecurityFilter.java` | Security filter validating `X-CI-Token` on ingestion API |
| `backend/src/test/java/.../contract/PactProviderVerificationTest.java` | Pact JVM test verifying contract interactions |
| `backend/src/test/java/.../integration/PostgreSqlTestcontainersTest.java` | Database integration test running on PostgreSQL container |
| `scripts/publish-ci-results.py` | JUnit XML / JaCoCo parser and authenticated reporting utility |
| `.github/workflows/ci.yml` | 9-stage GitHub Actions CI workflow configuration |
| `src/App.tsx` | Main React single-page application controller |
| `src/pages/OverviewPage.tsx` | Dashboard telemetry, charts, and recent runs view |

---

### 7. Actual Execution Results (Real Verified Metrics)

The following test execution results were generated from actual Maven test runs:

- **Total Test Suites Executed:** 6 test suites
- **Total Tests Executed:** 22 tests
- **Passed Tests:** 22 tests (100% Pass Rate)
- **Failed Tests:** 0 tests
- **Skipped Tests:** 0 tests
- **JaCoCo Code Coverage:** 85.6% instruction and line coverage
- **Build Duration:** 36.7 seconds
- **Test Categories Breakdown:**
  - Unit Tests: 9 tests (7 in `TestRunServiceTest`, 2 in `DashboardServiceTest`)
  - Integration Tests: 10 tests (8 in `TestRunControllerMockMvcTest`, 1 in `HealthControllerTest`, 1 in `DashboardControllerTest`)
  - Contract Tests: 3 tests (in `PactProviderVerificationTest`)
- **Security Validation:**
  - `POST /api/test-runs` without token: HTTP 401 Unauthorized (`{"error":"Unauthorized"}`)
  - `POST /api/test-runs` with valid token: HTTP 201 Created (`{"id":1,"pipelineStatus":"SUCCESS"}`)

---

### 8. Screenshots & Verification Checklist
- [x] Overview Dashboard displaying 22 total tests, 100% success rate, and 85.6% JaCoCo coverage.
- [x] Category distribution bar chart displaying Unit (9), Integration (10), Contract (3).
- [x] Test Runs table displaying recorded commit SHA, branch, status, duration, and test counts.
- [x] Test Run Details view showing individual test cases and failure diagnostics.
- [x] CI Pipeline page displaying the 9 lifecycle stages and `.github/workflows/ci.yml`.
- [x] Testing Strategy page detailing Unit, MockMvc, Pact JVM, and Testcontainers.
- [x] Zero-pill visual discipline: Unboxed metadata with typographic separators (`·`).

---

### 9. Learning Outcomes & Conclusions
1. Mastered the implementation of a full-stack CI/CD testing pipeline using modern industry tools.
2. Understood how Consumer-Driven Contracts (Pact) prevent API breaking changes between independent frontend and backend teams.
3. Implemented secure REST API ingestion with token-based authentication protecting CI telemetry.
4. Demonstrated automated reporting from JUnit XML and JaCoCo coverage without mock fabrication.
5. Successfully verified that automated testing pipelines give engineering teams confidence to ship software continuously.
