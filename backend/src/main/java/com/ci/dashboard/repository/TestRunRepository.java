package com.ci.dashboard.repository;

import com.ci.dashboard.entity.PipelineStatus;
import com.ci.dashboard.entity.TestRun;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestRunRepository extends JpaRepository<TestRun, Long> {

    List<TestRun> findAllByOrderByStartedAtDesc();

    List<TestRun> findByPipelineStatusOrderByStartedAtDesc(PipelineStatus status);

    Optional<TestRun> findFirstByOrderByStartedAtDesc();

    Optional<TestRun> findByRunIdentifier(String runIdentifier);

    List<TestRun> findByCommitShaContainingIgnoreCaseOrRunIdentifierContainingIgnoreCaseOrderByStartedAtDesc(
            String commitSha, String runIdentifier);

    @Query("SELECT COALESCE(SUM(t.totalTests), 0) FROM TestRun t")
    Long sumTotalTests();

    @Query("SELECT COALESCE(SUM(t.passedTests), 0) FROM TestRun t")
    Long sumPassedTests();

    @Query("SELECT COALESCE(SUM(t.failedTests), 0) FROM TestRun t")
    Long sumFailedTests();

    @Query("SELECT COALESCE(SUM(t.skippedTests), 0) FROM TestRun t")
    Long sumSkippedTests();

    @Query("SELECT COALESCE(AVG(t.coveragePercentage), 0.0) FROM TestRun t")
    Double averageCoverage();
}
