package com.ci.dashboard.repository;

import com.ci.dashboard.entity.TestCaseResult;
import com.ci.dashboard.entity.TestCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TestCaseResultRepository extends JpaRepository<TestCaseResult, Long> {

    @Query("SELECT c FROM TestCaseResult c WHERE c.testRun.id = :testRunId")
    List<TestCaseResult> findByTestRunId(@Param("testRunId") Long testRunId);

    @Query("SELECT c FROM TestCaseResult c WHERE c.testRun.id = :testRunId AND c.testCategory = :category")
    List<TestCaseResult> findByTestRunIdAndTestCategory(@Param("testRunId") Long testRunId, @Param("category") TestCategory category);

    Long countByTestCategory(TestCategory category);

    @Query("SELECT c.testCategory, COUNT(c) FROM TestCaseResult c GROUP BY c.testCategory")
    List<Object[]> countGroupedByCategory();
}
