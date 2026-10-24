# Local Setup & Execution Guide

This guide describes how to run and test both the Spring Boot backend and the React frontend locally.

---

## 1. Prerequisites
- **Java:** JDK 17 (Temurin or OpenJDK)
- **Maven:** Version 3.8+
- **Node.js:** Version 18+ or 20+ (with npm)
- **Python:** Python 3.8+ (for reporting utility `scripts/publish-ci-results.py`)
- **Docker:** Optional (required only for running Testcontainers locally)

---

## 2. Quick Local Start (Both Services)

### Step 1: Start Spring Boot Backend
```bash
# Compile and package backend
mvn -f backend/pom.xml clean package -DskipTests

# Run Spring Boot backend on port 8085 (or 8080 if not occupied)
java -jar backend/target/ci-quality-dashboard-backend-1.0.0.jar --server.port=8085
```
Verify the backend is live:
```bash
curl http://localhost:8085/api/health
```

### Step 2: Start React Frontend
In a separate terminal:
```bash
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser. The frontend Vite server automatically proxies `/api/*` requests to `http://127.0.0.1:8085`.

---

## 3. Running Automated Tests Locally

### Run All Unit, API, and Pact Tests:
```bash
mvn -f backend/pom.xml test
```

### Generate JaCoCo Coverage Report:
```bash
mvn -f backend/pom.xml jacoco:report
```
Open `backend/target/site/jacoco/index.html` in your browser to view the interactive coverage report.

### Ingest Real Test Execution to Local Dashboard:
```bash
CI_API_BASE_URL="http://127.0.0.1:8085" \
CI_INGESTION_TOKEN="ci-secret-token-change-me" \
GITHUB_SHA="$(git rev-parse HEAD 2>/dev/null || echo 'local-dev')" \
GITHUB_REF_NAME="main" \
python3 scripts/publish-ci-results.py
```
Refresh `http://localhost:3000` to inspect the newly ingested test run!

---

## 4. GitHub Actions CI Configuration

1. In your GitHub repository, navigate to `Settings` &rarr; `Secrets and variables` &rarr; `Actions`.
2. Add the following repository secrets:
   - `CI_API_BASE_URL`: URL of your deployed dashboard.
   - `CI_INGESTION_TOKEN`: The secret token matching backend `ci.ingestion.token`.
3. Push to `main` or open a Pull Request. GitHub Actions will execute `.github/workflows/ci.yml`.
