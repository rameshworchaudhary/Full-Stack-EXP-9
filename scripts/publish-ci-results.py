#!/usr/bin/env python3
"""
CI Results Publisher Script
Parses Maven Surefire JUnit XML reports and JaCoCo coverage reports,
aggregates test executions, and securely submits them to the CI Quality Dashboard ingestion API.
"""

import os
import sys
import glob
import json
import urllib.request
import urllib.error
import xml.etree.ElementTree as ET
from datetime import datetime, timezone

def determine_category(classname, testname):
    name = (classname + " " + testname).lower()
    if "pact" in name or "contract" in name:
        return "CONTRACT"
    elif "testcontainers" in name or "container" in name or "postgres" in name:
        return "INTEGRATION"
    elif "mockmvc" in name or "controller" in name or "integration" in name:
        return "INTEGRATION"
    elif "e2e" in name or "playwright" in name or "cypress" in name:
        return "E2E"
    return "UNIT"

def parse_surefire_reports(reports_dir):
    xml_files = glob.glob(os.path.join(reports_dir, "TEST-*.xml"))
    if not xml_files:
        print(f"No JUnit XML test reports found in {reports_dir}")
        return None, []

    total_tests = 0
    failures = 0
    errors = 0
    skipped = 0
    total_time_sec = 0.0
    test_cases = []

    for xml_file in xml_files:
        try:
            tree = ET.parse(xml_file)
            root = tree.getroot()

            # Handle both <testsuite> root and nested <testsuite> inside <testsuites>
            suites = [root] if root.tag == "testsuite" else root.findall(".//testsuite")
            for suite in suites:
                suite_total = int(suite.attrib.get("tests", 0))
                suite_failures = int(suite.attrib.get("failures", 0))
                suite_errors = int(suite.attrib.get("errors", 0))
                suite_skipped = int(suite.attrib.get("skipped", 0))
                suite_time = float(suite.attrib.get("time", 0.0))

                total_tests += suite_total
                failures += suite_failures
                errors += suite_errors
                skipped += suite_skipped
                total_time_sec += suite_time

                for case in suite.findall("testcase"):
                    case_name = case.attrib.get("name", "unknown")
                    classname = case.attrib.get("classname", "")
                    case_time = float(case.attrib.get("time", 0.0))
                    duration_ms = int(case_time * 1000)

                    failure_elem = case.find("failure")
                    error_elem = case.find("error")
                    skipped_elem = case.find("skipped")

                    if failure_elem is not None:
                        status = "FAILED"
                        msg = failure_elem.attrib.get("message", "") or (failure_elem.text or "").strip()
                    elif error_elem is not None:
                        status = "FAILED"
                        msg = error_elem.attrib.get("message", "") or (error_elem.text or "").strip()
                    elif skipped_elem is not None:
                        status = "SKIPPED"
                        msg = skipped_elem.attrib.get("message", "")
                    else:
                        status = "PASSED"
                        msg = None

                    category = determine_category(classname, case_name)
                    test_cases.append({
                        "testName": f"{classname}.{case_name}",
                        "testCategory": category,
                        "testStatus": status,
                        "durationMillis": duration_ms,
                        "failureMessage": msg[:2000] if msg else None
                    })
        except Exception as e:
            print(f"Error parsing test report {xml_file}: {e}", file=sys.stderr)

    passed = max(0, total_tests - (failures + errors + skipped))
    failed = failures + errors

    summary = {
        "totalTests": total_tests,
        "passedTests": passed,
        "failedTests": failed,
        "skippedTests": skipped,
        "durationMillis": int(total_time_sec * 1000)
    }
    return summary, test_cases

def parse_jacoco_coverage(jacoco_xml_path):
    if not os.path.isfile(jacoco_xml_path):
        print(f"JaCoCo coverage file not found at {jacoco_xml_path}, defaulting to 0.0%")
        return 0.0

    try:
        tree = ET.parse(jacoco_xml_path)
        root = tree.getroot()
        # Find instruction or line counter
        for counter in root.findall("counter"):
            if counter.attrib.get("type") in ("INSTRUCTION", "LINE"):
                missed = float(counter.attrib.get("missed", 0))
                covered = float(counter.attrib.get("covered", 0))
                total = missed + covered
                if total > 0:
                    coverage_pct = round((covered / total) * 100.0, 1)
                    return coverage_pct
    except Exception as e:
        print(f"Error parsing JaCoCo XML {jacoco_xml_path}: {e}", file=sys.stderr)
    return 0.0

def main():
    print("=" * 60)
    print("CI Quality Dashboard - Test Results Ingestion Utility")
    print("=" * 60)

    reports_dir = os.environ.get("SUREFIRE_DIR", "backend/target/surefire-reports")
    jacoco_path = os.environ.get("JACOCO_XML", "backend/target/site/jacoco/jacoco.xml")

    summary, test_cases = parse_surefire_reports(reports_dir)
    if summary is None:
        print("No test results found to publish. Exiting cleanly.")
        return 0

    coverage_pct = parse_jacoco_coverage(jacoco_path)

    commit_sha = os.environ.get("GITHUB_SHA") or os.environ.get("GIT_COMMIT") or "local-dev"
    branch_name = os.environ.get("GITHUB_REF_NAME") or os.environ.get("GIT_BRANCH") or "main"
    run_id_val = os.environ.get("GITHUB_RUN_ID")
    run_identifier = f"RUN-{run_id_val}" if run_id_val else f"RUN-{datetime.now(timezone.utc).strftime('%Y%m%d-%H%M%S')}"

    pipeline_status = "FAILED" if summary["failedTests"] > 0 else "SUCCESS"

    payload = {
        "runIdentifier": run_identifier,
        "commitSha": commit_sha,
        "branchName": branch_name,
        "pipelineStatus": pipeline_status,
        "totalTests": summary["totalTests"],
        "passedTests": summary["passedTests"],
        "failedTests": summary["failedTests"],
        "skippedTests": summary["skippedTests"],
        "coveragePercentage": coverage_pct,
        "durationMillis": summary["durationMillis"],
        "startedAt": datetime.now(timezone.utc).isoformat(),
        "completedAt": datetime.now(timezone.utc).isoformat(),
        "testCases": test_cases
    }

    print(f"Aggregated Results:")
    print(f"  Run Identifier: {payload['runIdentifier']}")
    print(f"  Branch:         {payload['branchName']}")
    print(f"  Commit:         {payload['commitSha'][:10]}")
    print(f"  Status:         {payload['pipelineStatus']}")
    print(f"  Total Tests:    {payload['totalTests']}")
    print(f"  Passed:         {payload['passedTests']}")
    print(f"  Failed:         {payload['failedTests']}")
    print(f"  Coverage:       {payload['coveragePercentage']}%")
    print(f"  Duration:       {payload['durationMillis']} ms")

    api_url = os.environ.get("CI_API_BASE_URL", "").rstrip("/")
    token = os.environ.get("CI_INGESTION_TOKEN", "")

    if not api_url or not token:
        print("\n[NOTICE] CI_API_BASE_URL or CI_INGESTION_TOKEN not set in environment.")
        print("Skipping dashboard upload. Test reports and artifacts remain available locally/in workflow.")
        return 0

    endpoint = f"{api_url}/api/test-runs"
    print(f"\nSubmitting results to {endpoint} ...")

    req = urllib.request.Request(
        endpoint,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-CI-Token": token,
            "User-Agent": "CI-Quality-Publisher/1.0"
        },
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            body = resp.read().decode("utf-8")
            print(f"Success ({resp.status}): Test run successfully ingested.")
            return 0
    except urllib.error.HTTPError as e:
        err_msg = e.read().decode("utf-8")
        print(f"HTTP Error {e.code} during ingestion: {err_msg}", file=sys.stderr)
        return 1
    except Exception as e:
        print(f"Failed to connect to ingestion endpoint: {e}", file=sys.stderr)
        return 1

if __name__ == "__main__":
    sys.exit(main())
