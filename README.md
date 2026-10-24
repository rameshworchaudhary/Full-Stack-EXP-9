# CI Quality Dashboard - Continuous Integration Pipeline with Automated Testing

> A production-grade, demonstrable full-stack laboratory experiment implementing a Continuous Integration (CI) pipeline with automated testing (JUnit 5 Unit Tests, MockMvc API Integration Tests, Pact JVM Consumer-Driven Contract Tests, Testcontainers Database Tests, and GitHub Actions CI).
>
> **Lead Developer / Candidate:** Rameshwor Chaudhary  
> **Student UID / Roll No:** 24BAI71012  
> **Course:** Continuous Integration & Automated Software Testing Lab

---

## 1. Project Overview

The **CI Quality Dashboard** demonstrates how software changes are automatically built, validated, and monitored through an automated Continuous Integration pipeline.

### Core Features
- **Live Quality Dashboard:** Real-time visualization of total tests, passed, failed, skipped, success rate %, JaCoCo code coverage %, and recent executions.
- **Test Telemetry & Diagnostics:** Historical execution records with commit SHAs, branch names, execution durations, individual test cases, and failure stack traces.
- **Multi-Tier Automated Testing:**
  - **Unit Testing:** JUnit 5 & Mockito verifying business rules and calculations.
  - **API Integration Testing:** Spring Boot Test & MockMvc testing HTTP routing and validation.
  - **Consumer-Driven Contract Testing:** Pact JVM validating React client expectations against the Spring Boot provider.
  - **Database Integration Testing:** Testcontainers spinning up an isolated PostgreSQL 15 container in Docker.
- **Automated CI with GitHub Actions:** 9-stage pipeline triggered on push and pull requests to `main`.
- **Authenticated CI Ingestion:** Secure reporting utility (`scripts/publish-ci-results.py`) submitting real JUnit XML and JaCoCo coverage reports using `X-CI-Token` authentication.

---

## 2. Technology Stack

### Frontend
- **Framework:** React 19, TypeScript
- **Bundler:** Vite 6
- **Styling:** Tailwind CSS v4
- **API Client:** Axios
- **Visualization:** Recharts & Lucide React

### Backend
- **Language:** Java 17 (Temurin / OpenJDK)
- **Framework:** Spring Boot 3.3.4
- **ORM / Persistence:** Spring Data JPA, Hibernate 6.5
- **Databases:** H2 In-Memory (development & fast turnaround) and PostgreSQL 15 (production / Testcontainers)
- **Testing:** JUnit 5.10, Mockito 5.11, MockMvc, Pact JVM 4.6.14, Testcontainers 1.20.2
- **Code Coverage:** JaCoCo Maven Plugin 0.8.12

### DevOps & Automation
- **CI System:** GitHub Actions (`ubuntu-latest`)
- **Ingestion Utility:** Python 3.10 script (`scripts/publish-ci-results.py`)
- **Reports:** Surefire JUnit XML, JaCoCo XML & HTML artifacts

---

## 3. Project Architecture & Directory Structure

```text
ci-quality-dashboard/
├── backend/
│   ├── pom.xml                                      # Maven configuration with Spring Boot, Pact, JaCoCo
│   ├── .env.example                                 # Backend environment variables reference
│   └── src/
│       ├── main/
│       │   ├── java/com/ci/dashboard/
│       │   │   ├── CiDashboardApplication.java      # Spring Boot application entrypoint
│       │   │   ├── config/                          # WebConfig (CORS), IngestionSecurityFilter (X-CI-Token)
│       │   │   ├── controller/                      # HealthController, DashboardController, TestRunController
│       │   │   ├── dto/                             # DashboardSummaryDto, TestRunRequest, TestRunResponse
│       │   │   ├── entity/                          # TestRun, TestCaseResult, PipelineStatus, TestCategory
│       │   │   ├── exception/                       # GlobalExceptionHandler, ResourceNotFoundException
│       │   │   ├── repository/                      # TestRunRepository, TestCaseResultRepository
│       │   │   └── service/                         # TestRunService, DashboardService
│       │   └── resources/
│       │       └── application.properties           # Application configuration
│       └── test/
│           ├── java/com/ci/dashboard/
│           │   ├── service/                         # JUnit 5 & Mockito Unit Tests
│           │   ├── controller/                      # MockMvc API Integration Tests
│           │   ├── contract/                        # Pact JVM Provider Contract Tests
│           │   └── integration/                     # Testcontainers PostgreSQL Integration Tests
│           └── resources/
│               ├── application-test.properties      # Test profile settings
│               └── pacts/                           # FrontendConsumer-BackendProvider.json
├── src/                                             # React Frontend Application
│   ├── components/                                  # Sidebar, TopHeader, StatusBadge, MetricCard
│   ├── pages/                                       # Overview, TestRuns, TestRunDetail, CiPipeline, TestingStrategy, LabDocs
│   ├── services/                                    # api.ts (Axios REST client)
│   ├── types/                                       # TypeScript interfaces matching backend DTOs
│   ├── App.tsx                                      # Main React application
│   └── main.tsx                                     # React 19 entrypoint
├── scripts/
│   └── publish-ci-results.py                        # Automated JUnit XML / JaCoCo parser & ingestion utility
├── docs/
│   ├── testing-strategy.md                          # Testing pyramid documentation
│   ├── setup-guide.md                               # Local setup instructions
│   └── experiment-report.md                         # Complete academic laboratory report
├── .github/
│   └── workflows/
│       └── ci.yml                                   # 9-stage GitHub Actions CI workflow
├── index.html                                       # HTML entrypoint
├── package.json                                     # Frontend dependencies
├── vite.config.ts                                   # Vite configuration with /api reverse proxy
└── README.md                                        # Master documentation
```

---

## 4. Local Quick Start

### 1. Compile & Start the Spring Boot Backend
```bash
# Package the Spring Boot jar
mvn -f backend/pom.xml clean package -DskipTests

# Start the backend on port 8085
java -jar backend/target/ci-quality-dashboard-backend-1.0.0.jar --server.port=8085
```
Verify the backend is live:
```bash
curl http://localhost:8085/api/health
```

### 2. Start the React Frontend
In a separate terminal:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser. The frontend Vite server automatically proxies all `/api/*` requests to `http://127.0.0.1:8085`.

---

## 5. Running Automated Tests

### Run All Unit, API, and Contract Tests:
```bash
mvn -f backend/pom.xml test
```
*Executes all 22 Unit, MockMvc, and Pact contract tests.*

### Run Pact Contract Verification Separately:
```bash
mvn -f backend/pom.xml test -Dtest=PactProviderVerificationTest
```

### Run Testcontainers Database Integration Tests (Requires Docker):
```bash
mvn -f backend/pom.xml test -Dtest=PostgreSqlTestcontainersTest
```

### Generate JaCoCo Coverage Report:
```bash
mvn -f backend/pom.xml jacoco:report
```
*Report available at `backend/target/site/jacoco/index.html`.*

### Ingest Real Test Execution into Dashboard:
```bash
CI_API_BASE_URL="http://127.0.0.1:8085" \
CI_INGESTION_TOKEN="ci-secret-token-change-me" \
GITHUB_SHA="$(git rev-parse HEAD 2>/dev/null || echo 'local-dev')" \
GITHUB_REF_NAME="main" \
python3 scripts/publish-ci-results.py
```

---

## 6. GitHub Actions CI Configuration

The workflow `.github/workflows/ci.yml` defines the 9 automated stages:
1. **Checkout Source Code** (`actions/checkout@v4`)
2. **Set up Java 17 & Node.js 20** (`actions/setup-java@v4`, `actions/setup-node@v4`)
3. **Compile Backend** (`mvn compile`)
4. **Run Unit & Controller Tests** (`mvn test`)
5. **Verify Pact Contract Tests** (`mvn test -Dtest=PactProviderVerificationTest`)
6. **Run Testcontainers PostgreSQL Tests** (`mvn test -Dtest=PostgreSqlTestcontainersTest`)
7. **Generate JaCoCo Coverage Reports** (`mvn jacoco:report`)
8. **Build Frontend Bundle** (`npm ci && npm run build`)
9. **Ingest Results & Upload Artifacts** (`python3 scripts/publish-ci-results.py`)

### Required Repository Secrets:
In GitHub repository settings (`Settings &rarr; Secrets and variables &rarr; Actions`):
- `CI_API_BASE_URL`: Base URL of your deployed dashboard.
- `CI_INGESTION_TOKEN`: The secret token matching backend `ci.ingestion.token`.

---

## 7. Verified Execution Results

| Test Category | Suite / Class | Tests Run | Result |
|---------------|---------------|-----------|--------|
| Unit Testing | `TestRunServiceTest` | 7 | 7 Passed (0 Failed) |
| Unit Testing | `DashboardServiceTest` | 2 | 2 Passed (0 Failed) |
| API Integration | `HealthControllerTest` | 1 | 1 Passed (0 Failed) |
| API Integration | `DashboardControllerTest` | 1 | 1 Passed (0 Failed) |
| API Integration | `TestRunControllerMockMvcTest` | 8 | 8 Passed (0 Failed) |
| Contract Testing | `PactProviderVerificationTest` | 3 | 3 Passed (0 Failed) |
| **Total** | **All Suites** | **22** | **22 Passed (100% Pass Rate)** |

- **JaCoCo Instruction Coverage:** 85.6%
- **Execution Time:** ~30 seconds

---

## 8. License
Apache License 2.0

---

## 9. Combined Docker and Canary Deployment Experiment

This repository also includes the combined CI/CD experiment. GitHub Actions runs `mvn clean verify` (including the Testcontainers PostgreSQL suite), frontend type checking/build, then on `main` publishes Docker Hub images tagged with the full commit SHA and runs the protected production deployment job. Pull requests do not receive deployment credentials.

### Local Docker startup

Copy `.env.example` to `.env`, set a strong local PostgreSQL password and CI ingestion token, then run:

```bash
docker compose --env-file .env up --build -d
docker compose ps
curl http://localhost:8080/api/health
```

Open `http://localhost:3000`. PostgreSQL is reachable only on the internal Docker network and stores data in the `postgres_data` volume. Both stable and canary backend services run; local defaults use the same image. The gateway starts with a 90/10 stable/canary weighting.

### GitHub and Linux server setup

Configure Actions secrets `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`, `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`, `DEPLOY_PORT` (optional, defaults to 22), and `DEPLOY_PATH`. Protect the `production` environment and allow deployment from `main` only. Prepare the Linux server with Docker Compose, a restricted deployment user, HTTPS termination, and an authenticated Docker Hub pull session if repositories are private. Copy the compose file, `deploy/`, and `frontend/` to the deployment path. Create `.deploy.env` there with database and ingestion settings and mode `0600`.

`deploy/deploy.sh` validates SHA image tags, verifies candidate health, applies and validates Nginx configuration, then shifts traffic through 10/25/50/100 percent. It records the promoted stable image and restores the previous image and stable-only routing on a failed check. Rollback never removes database volumes. Use `DRY_RUN=true DEPLOY_IMAGE=registry/name:FULL_COMMIT_SHA ./deploy/deploy.sh` to view the planned sequence without Docker or production changes.

See [docs/combined-experiment-report.md](docs/combined-experiment-report.md) for architecture diagrams, complete commands, manual verification, rollback, and limitations. Health checks alone do not establish release reliability; add metrics-based error-rate, latency, and business behavior gates before production use. The UI displays **Not configured** until a deployment report is actually published; it does not infer release state from CI configuration.
