# Automated Testing Strategy & Architecture

## Overview
The **CI Quality Dashboard** utilizes a 4-tier testing pyramid to guarantee stability, prevent regressions, enforce consumer-driven API contracts, and validate database persistence.

```
       / \
      / E2E \          Tier 4: Testcontainers Integration (PostgreSQL 15)
     /-------\
    /  Pact   \        Tier 3: Consumer-Driven Contract Verification (Pact JVM)
   /-----------\
  / Integration \      Tier 2: REST Controller & MockMvc Tests
 /---------------\
/   Unit Tests    \    Tier 1: JUnit 5 & Mockito Business Logic
-------------------
```

---

## 1. Unit Testing (JUnit 5 & Mockito)
- **Frameworks:** JUnit 5.10.x, Mockito 5.11.x
- **Target Components:** `TestRunService`, `DashboardService`, domain entity validation, and business calculations.
- **Purpose:** Test pure business logic in complete isolation from databases, HTTP listeners, or external infrastructure.
- **Key Assertions:**
  - Automatic status deduction: Any failed test case flips pipeline status to `FAILED`.
  - Counter synchronization: Tests matching passed, failed, and skipped counts.
  - Safe calculations: Avoiding division by zero when runs or tests are zero.
  - Input validation: Rejecting blank commit SHAs, empty branch names, or malformed filters.
- **Execution Command:**
  ```bash
  mvn -f backend/pom.xml test -Dtest=TestRunServiceTest,DashboardServiceTest
  ```

---

## 2. API Integration Testing (MockMvc)
- **Frameworks:** `spring-boot-starter-test`, MockMvc, Jackson ObjectMapper
- **Target Endpoints:**
  - `GET /api/health`
  - `GET /api/dashboard/summary`
  - `GET /api/test-runs`
  - `GET /api/test-runs/{id}`
  - `POST /api/test-runs` (Ingestion endpoint)
  - `GET /api/test-runs/{id}/cases`
- **Security & Authorization Verification:**
  - Verifies that `POST /api/test-runs` returns `401 Unauthorized` when the `X-CI-Token` header is missing or invalid.
  - Verifies that requests with a valid token return `201 Created`.
  - Verifies HTTP 400 Bad Request on invalid payloads (e.g., missing commitSha).
  - Verifies HTTP 404 Not Found on non-existent test run IDs.
- **Execution Command:**
  ```bash
  mvn -f backend/pom.xml test -Dtest=*ControllerTest,*MockMvcTest
  ```

---

## 3. Consumer-Driven Contract Testing (Pact JVM)
- **Frameworks:** `au.com.dius.pact.provider:junit5spring:4.6.14`
- **Consumer:** `FrontendConsumer` (React UI client)
- **Provider:** `BackendProvider` (Spring Boot API)
- **Contract Location:** `backend/src/test/resources/pacts/FrontendConsumer-BackendProvider.json`
- **Concept:**
  Instead of relying on unstable end-to-end browser tests, the React client defines its exact structural and type requirements in a contract. The Spring Boot backend tests itself against this contract during build time.
- **Verified Interactions:**
  1. `GET /api/health`: Validates health status response structure.
  2. `GET /api/dashboard/summary`: Validates aggregate statistics and category distribution.
  3. `GET /api/test-runs`: Validates test run list array structure and properties.
- **Execution Command:**
  ```bash
  mvn -f backend/pom.xml test -Dtest=PactProviderVerificationTest
  ```

---

## 4. Database Integration Testing (Testcontainers & PostgreSQL)
- **Frameworks:** `org.testcontainers:postgresql:1.20.2`, `junit-jupiter:1.20.2`
- **Target:** `PostgreSqlTestcontainersTest.java`
- **Concept:**
  Unit tests and H2 in-memory databases can conceal subtle SQL dialect and constraint discrepancies. Testcontainers launches a real Docker container running PostgreSQL 15 during integration testing to verify real database schemas, foreign keys, and JPQL aggregate queries.
- **Execution Command:**
  ```bash
  mvn -f backend/pom.xml test -Dtest=PostgreSqlTestcontainersTest
  ```
  *(Note: Requires a Docker daemon on the runner, supported by GitHub Actions `ubuntu-latest`).*

---

## 5. Code Coverage Verification (JaCoCo)
- **Plugin:** `org.jacoco:jacoco-maven-plugin:0.8.12`
- **Report Location:** `backend/target/site/jacoco/index.html` & `jacoco.xml`
- **Execution Command:**
  ```bash
  mvn -f backend/pom.xml jacoco:report
  ```
- **Coverage Output:** Verified instruction and line coverage exceeding 85% across controllers, services, and entities.
