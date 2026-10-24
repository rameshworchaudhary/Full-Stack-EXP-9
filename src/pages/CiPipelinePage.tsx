import React, { useEffect, useState } from 'react';
import {
  Workflow,
  CheckCircle2,
  GitBranch,
  Shield,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Info,
  Server,
  FileCode,
} from 'lucide-react';

export const CiPipelinePage: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [deploymentReport, setDeploymentReport] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    fetch('/deployment-report.json', { cache: 'no-store' })
      .then(async (response) => {
        if (!response.ok) return;
        const report = await response.json();
        if (report.status === 'healthy' || report.status === 'rollback') setDeploymentReport(report);
      })
      .catch(() => setDeploymentReport(null));
  }, []);

  const stages = [
    {
      num: 1,
      name: 'Checkout Source Code',
      tool: 'actions/checkout@v4',
      description: 'Clones repository code with complete Git history and commit SHA metadata.',
      cmd: 'git checkout ${{ github.sha }}',
    },
    {
      num: 2,
      name: 'Set up Toolchains',
      tool: 'actions/setup-java@v4 & setup-node@v4',
      description: 'Initializes OpenJDK 17 (Temurin) and Node.js 20 LTS with Maven and npm dependency caching.',
      cmd: 'java -version && node -v',
    },
    {
      num: 3,
      name: 'Compile Backend',
      tool: 'Maven & Spring Boot 3.3.4',
      description: 'Compiles all 22 Java classes, entity models, controllers, and services with javac.',
      cmd: 'mvn -f backend/pom.xml clean compile',
    },
    {
      num: 4,
      name: 'Run Unit Tests',
      tool: 'JUnit 5 & Mockito',
      description: 'Executes pure, repository-independent service tests, business validations, and exception paths.',
      cmd: 'mvn -f backend/pom.xml test -Dtest=*ServiceTest',
    },
    {
      num: 5,
      name: 'Run API Integration Tests',
      tool: 'Spring Boot Test & MockMvc',
      description: 'Tests REST endpoints (/api/health, /api/dashboard/summary, /api/test-runs) with JSON assertions and HTTP 401 auth checks.',
      cmd: 'mvn -f backend/pom.xml test -Dtest=*ControllerTest,*MockMvcTest',
    },
    {
      num: 6,
      name: 'Verify Pact Contracts',
      tool: 'Pact JVM 4.6.14',
      description: 'Verifies consumer-driven contract interactions between React frontend expectations and Spring Boot HTTP provider.',
      cmd: 'mvn -f backend/pom.xml test -Dtest=PactProviderVerificationTest',
    },
    {
      num: 7,
      name: 'Database Integration (Testcontainers)',
      tool: 'Testcontainers & PostgreSQL 15',
      description: 'Spins up isolated PostgreSQL Docker container in CI runner, applies schema, and tests relational persistence.',
      cmd: 'mvn -f backend/pom.xml test -Dtest=PostgreSqlTestcontainersTest',
    },
    {
      num: 8,
      name: 'Generate Coverage & Build Frontend',
      tool: 'JaCoCo 0.8.12 & Vite/TypeScript',
      description: 'Generates JaCoCo XML & HTML reports; performs TypeScript type checking and Vite production bundle.',
      cmd: 'mvn jacoco:report && npm run build',
    },
    {
      num: 9,
      name: 'Ingest Results & Upload Artifacts',
      tool: 'publish-ci-results.py & upload-artifact@v4',
      description: 'Parses surefire XML and JaCoCo reports, submits payload via secure X-CI-Token, and saves reports as GitHub artifacts.',
      cmd: 'python3 scripts/publish-ci-results.py',
    },
  ];

  const workflowYaml = `name: Full-Stack CI Pipeline
on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  checks: write

jobs:
  build-and-test:
    name: Build, Test & Validate
    runs-on: ubuntu-latest
    timeout-minutes: 25

    steps:
      - name: 1. Checkout Source Code
        uses: actions/checkout@v4

      - name: 2. Set up Java 17
        uses: actions/setup-java@v4
        with:
          distribution: 'temurin'
          java-version: '17'
          cache: 'maven'

      - name: 3. Set up Node.js LTS
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'

      - name: 4. Compile Backend
        run: mvn -f backend/pom.xml clean compile

      - name: 5. Run Unit & Controller Tests
        run: mvn -f backend/pom.xml test

      - name: 6. Verify Pact Contract Tests
        run: mvn -f backend/pom.xml test -Dtest=PactProviderVerificationTest

      - name: 7. Run Testcontainers Postgres Tests
        run: mvn -f backend/pom.xml test -Dtest=PostgreSqlTestcontainersTest

      - name: 8. Verify JaCoCo Code Coverage
        run: mvn -f backend/pom.xml jacoco:report

      - name: 9. Build Frontend
        run: npm ci && npm run build

      - name: 10. Ingest CI Results to Dashboard
        if: always()
        env:
          CI_API_BASE_URL: \${{ secrets.CI_API_BASE_URL }}
          CI_INGESTION_TOKEN: \${{ secrets.CI_INGESTION_TOKEN }}
          GITHUB_SHA: \${{ github.sha }}
          GITHUB_REF_NAME: \${{ github.ref_name }}
          GITHUB_RUN_ID: \${{ github.run_id }}
        run: python3 scripts/publish-ci-results.py

      - name: 11. Upload JUnit & Coverage Artifacts
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: test-and-coverage-reports
          path: |
            backend/target/surefire-reports/
            backend/target/site/jacoco/`;

  const copyYaml = () => {
    navigator.clipboard.writeText(workflowYaml);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <section className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3">
        <h3 className="text-base font-bold">Deployment status</h3>
        {deploymentReport ? (
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            {[
              ['Health-check status', deploymentReport.status],
              ['Stable release', deploymentReport.stableImage],
              ['Canary release', deploymentReport.canaryImage],
              ['Image tag / commit SHA', deploymentReport.commitSha],
              ['Canary traffic', `${deploymentReport.trafficPercent ?? 'Not configured'}%`],
              ['Last deployment result', deploymentReport.lastResult],
              ['Rollback status', deploymentReport.rollback === true ? 'Rolled back' : 'No rollback'],
              ['Updated at', deploymentReport.updatedAt],
            ].map(([label, value]) => (
              <div key={label as string} className="rounded border border-neutral-200 p-3">
                <dt className="text-xs text-neutral-500">{label}</dt>
                <dd className="font-mono break-all">{String(value ?? 'Not configured')}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-neutral-600">Not configured — no verified deployment report is published to this dashboard.</p>
        )}
        <p className="text-xs text-neutral-500">This is the server generated report. Health checks show availability only and do not replace metrics based canary analysis.</p>
      </section>
      {/* Header Info */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-base font-bold text-black flex items-center gap-2">
              <Workflow className="w-5 h-5 text-neutral-800" />
              Automated CI Pipeline Architecture
            </h3>
            <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
              Whenever code is pushed or a Pull Request is opened, GitHub Actions launches a clean Ubuntu runner to automatically compile, execute 4 testing tiers, generate coverage reports, and report telemetry.
            </p>
          </div>
        </div>

        <div className="p-3 bg-white border border-neutral-300 rounded-lg flex items-start gap-2.5 text-xs text-neutral-800 shadow-xs">
          <Info className="w-4 h-4 text-black shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Real GitHub Actions Execution:</strong> GitHub Actions triggers workflows upon real repository commits. There is no synthetic "Run Pipeline" button that fakes cloud execution. Test telemetry is ingested via authenticated REST API payload when workflows complete.
          </p>
        </div>
      </div>

      {/* 9 Stages Diagram */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold uppercase font-mono tracking-wider text-neutral-500">
          Continuous Integration Lifecycle (9 Stages)
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
          {stages.map((st) => (
            <div
              key={st.num}
              className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col justify-between hover:border-neutral-400 transition-colors shadow-xs"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="w-6 h-6 rounded-full bg-black text-white flex items-center justify-center font-bold text-[11px]">
                    {st.num}
                  </span>
                  <span className="text-neutral-500 text-[10px] font-semibold">{st.tool}</span>
                </div>
                <h5 className="font-bold text-black text-sm">{st.name}</h5>
                <p className="text-neutral-600 text-xs font-sans leading-relaxed">{st.description}</p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-200 text-[11px] text-black bg-neutral-100 p-2 rounded overflow-x-auto border border-neutral-200 font-bold">
                <code>$ {st.cmd}</code>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* GitHub Repository Configuration & Secrets */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-black" />
            <h4 className="text-sm font-bold text-black">GitHub Secrets Configuration</h4>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            In your GitHub repository (<code>Settings &rarr; Secrets and variables &rarr; Actions</code>), configure these secrets to enable automatic ingestion into this dashboard:
          </p>

          <div className="space-y-3 font-mono text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
              <span className="text-black font-bold">CI_API_BASE_URL</span>
              <p className="text-neutral-600 text-[11px] font-sans">
                Base URL of your deployed CI Dashboard (e.g., <code>https://your-dashboard-domain.com</code>).
              </p>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-1">
              <span className="text-black font-bold">CI_INGESTION_TOKEN</span>
              <p className="text-neutral-600 text-[11px] font-sans">
                Shared secret token matching backend <code>ci.ingestion.token</code> (Header: <code>X-CI-Token</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Local Execution Guide */}
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 shadow-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-black" />
            <h4 className="text-sm font-bold text-black">Local Pipeline Replay</h4>
          </div>

          <p className="text-xs text-neutral-600 leading-relaxed">
            Developers can run the full test pipeline and generate JaCoCo coverage locally without pushing to GitHub:
          </p>

          <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-3.5 space-y-2 font-mono text-xs text-neutral-800">
            <p className="text-neutral-500 text-[11px] font-semibold">// 1. Run all unit, mockmvc, and contract tests</p>
            <p className="text-black font-bold">mvn -f backend/pom.xml clean test</p>
            <p className="text-neutral-500 text-[11px] mt-2 font-semibold">// 2. Generate JaCoCo coverage report</p>
            <p className="text-black font-bold">mvn -f backend/pom.xml jacoco:report</p>
            <p className="text-neutral-500 text-[11px] mt-2 font-semibold">// 3. Ingest real test run into dashboard</p>
            <p className="text-neutral-900 font-semibold bg-white p-2 rounded border border-neutral-200">
              CI_API_BASE_URL="http://127.0.0.1:8085" CI_INGESTION_TOKEN="ci-secret-token-change-me" python3 scripts/publish-ci-results.py
            </p>
          </div>
        </div>
      </div>

      {/* Workflow YAML Viewer */}
      <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCode className="w-4 h-4 text-black" />
            <h4 className="text-sm font-bold text-black font-mono">
              .github/workflows/ci.yml
            </h4>
          </div>
          <button
            onClick={copyYaml}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-black hover:bg-neutral-800 text-white rounded-md text-xs font-mono font-semibold transition-colors shadow-xs"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy YAML</span>
              </>
            )}
          </button>
        </div>

        <pre className="bg-neutral-950 border border-neutral-800 rounded-lg p-4 font-mono text-xs text-neutral-100 overflow-x-auto max-h-96 leading-relaxed">
          {workflowYaml}
        </pre>
      </div>
    </div>
  );
};
