import React from 'react';
import {
  ShieldCheck,
  Cpu,
  Layers,
  FileCheck2,
  Database,
  Terminal,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const TestingStrategyPage: React.FC = () => {
  const tiers = [
    {
      title: '1. Unit Testing',
      tools: 'JUnit 5 · Mockito 5',
      badge: 'Fastest (ms)',
      icon: Cpu,
      purpose: 'Isolates core domain services and business calculations from external systems.',
      whatItTests: [
        'TestRunService business rules (status derivation, pass/fail counters).',
        'Input validation (rejects blank commit SHA or invalid branch name).',
        'Dashboard summary calculations with empty state vs. aggregate computations.',
        'Exception handling (ResourceNotFoundException, IllegalArgumentException).',
      ],
      cmd: 'mvn test -Dtest=TestRunServiceTest,DashboardServiceTest',
    },
    {
      title: '2. API Integration Testing',
      tools: 'Spring Boot Test · MockMvc',
      badge: 'Fast (~2s)',
      icon: Layers,
      purpose: 'Verifies the HTTP Web layer, serialization, routing, validation, and security headers.',
      whatItTests: [
        'GET /api/health returns 200 OK with expected JSON schema.',
        'GET /api/dashboard/summary serialization and status codes.',
        'POST /api/test-runs token authentication (X-CI-Token verification).',
        'Rejection of unauthorized POST requests with HTTP 401.',
        'HTTP 400 Bad Request on invalid request body payloads.',
      ],
      cmd: 'mvn test -Dtest=*ControllerTest,*MockMvcTest',
    },
    {
      title: '3. Consumer-Driven Contract Testing',
      tools: 'Pact JVM 4.6.14 · JUnit 5 Provider',
      badge: 'Medium (~10s)',
      icon: FileCheck2,
      purpose: 'Prevents breaking API changes between Frontend Consumer expectations and Backend Provider.',
      whatItTests: [
        'Verifies that Spring Boot endpoints strictly satisfy FrontendConsumer contracts.',
        'Enforces response JSON schema, types, and required attributes.',
        'Validates provider states before requests execute.',
        'Fails the CI build automatically if backend alters payload without frontend agreement.',
      ],
      cmd: 'mvn test -Dtest=PactProviderVerificationTest',
    },
    {
      title: '4. Database Integration Testing',
      tools: 'Testcontainers · PostgreSQL 15 Container',
      badge: 'Thorough (Docker)',
      icon: Database,
      purpose: 'Validates actual SQL dialects, relational constraints, foreign keys, and indexes.',
      whatItTests: [
        'Launches genuine PostgreSQL 15 Docker container in CI.',
        'Applies real Hibernate DDL migrations against PostgreSQL.',
        'Verifies cascading deletes and relationships between TestRun and TestCaseResult.',
        'Validates complex aggregate JPQL queries (SUM, AVG, GROUP BY).',
      ],
      cmd: 'mvn test -Dtest=PostgreSqlTestcontainersTest',
    },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Overview Card */}
      <div className="bg-neutral-50 border border-neutral-200 rounded-xl p-5 space-y-3 shadow-xs">
        <h3 className="text-base font-bold text-black flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-neutral-800" />
          Multi-Tiered Automated Testing Pyramid
        </h3>
        <p className="text-xs text-neutral-600 leading-relaxed font-sans">
          The CI Quality Dashboard is engineered with a strict 4-layer testing defense to eliminate regressions, ensure API contract stability, and validate persistent data integrity before any pull request is merged.
        </p>
      </div>

      {/* 4 Tiers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {tiers.map((tier, idx) => {
          const Icon = tier.icon;
          return (
            <div
              key={idx}
              className="bg-white border border-neutral-200 rounded-xl p-5 space-y-4 flex flex-col justify-between hover:border-neutral-400 transition-colors shadow-xs"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-black text-white">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-black">{tier.title}</h4>
                      <p className="text-[11px] font-mono text-neutral-500 font-semibold">{tier.tools}</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-500 font-semibold">{tier.badge}</span>
                </div>

                <p className="text-xs text-neutral-700 font-sans leading-relaxed">{tier.purpose}</p>

                <div className="space-y-1.5 pt-1">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 font-bold block">
                    What this protects:
                  </span>
                  <ul className="space-y-1 text-xs text-neutral-600 font-sans">
                    {tier.whatItTests.map((item, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-black font-bold shrink-0 font-mono">✓</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-neutral-200 font-mono text-[11px] bg-neutral-100 p-2.5 rounded-lg text-black border border-neutral-200 font-bold overflow-x-auto">
                <code>$ {tier.cmd}</code>
              </div>
            </div>
          );
        })}
      </div>

      {/* Contract & Coverage Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 font-mono text-xs shadow-xs">
          <h4 className="text-sm font-bold text-black flex items-center gap-2">
            <FileCheck2 className="w-4 h-4 text-black" />
            How Pact Prevents Integration Breakages
          </h4>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            Unlike traditional end-to-end tests that are slow and brittle, Consumer-Driven Contracts allow the frontend team to define expected requests and responses in a machine-readable Pact JSON file. During CI:
          </p>
          <ol className="list-decimal list-inside space-y-1.5 text-neutral-700 font-sans text-xs">
            <li>The contract file is copied to <code>backend/src/test/resources/pacts/</code>.</li>
            <li>Pact JVM spins up the Spring Boot HTTP provider on an ephemeral port.</li>
            <li>Each recorded interaction is replayed and asserted for status and payload match.</li>
            <li>If a backend developer renames a field, Pact fails the build before production is affected.</li>
          </ol>
        </div>

        <div className="bg-white border border-neutral-200 rounded-xl p-5 space-y-3 font-mono text-xs shadow-xs">
          <h4 className="text-sm font-bold text-black flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-black" />
            JaCoCo Coverage Metric Protection
          </h4>
          <p className="text-xs text-neutral-600 font-sans leading-relaxed">
            The Java Code Coverage library (JaCoCo) instruments JVM bytecode during the Maven test lifecycle. In this project:
          </p>
          <ul className="space-y-1.5 text-neutral-700 font-sans text-xs">
            <li className="flex items-start gap-2">
              <span className="text-black font-bold font-mono">→</span>
              <span>Generates machine-readable <code>jacoco.xml</code> and interactive HTML reports.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold font-mono">→</span>
              <span>The ingestion script parses instruction & line counters to publish actual metrics.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-black font-bold font-mono">→</span>
              <span>Reports are preserved as downloadable workflow artifacts on GitHub Actions.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
