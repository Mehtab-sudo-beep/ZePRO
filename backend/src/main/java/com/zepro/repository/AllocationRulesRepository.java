package com.zepro.repository;

import com.zepro.model.AllocationRules;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface AllocationRulesRepository extends JpaRepository<AllocationRules, Long> {

    // Always exactly one row in this table
    Optional<AllocationRules> findFirstByOrderByIdAsc();

    // Lightweight read — used to validate team size without loading full entity
    @Query("SELECT r.maxTeamSize FROM AllocationRules r ORDER BY r.id ASC LIMIT 1")
    Optional<Integer> findMaxTeamSize();

    // Lightweight read — used to validate faculty slots during allocation
    @Query("SELECT r.maxStudentsPerFaculty FROM AllocationRules r ORDER BY r.id ASC LIMIT 1")
    Optional<Integer> findMaxStudentsPerFaculty();

    // Direct update when row already exists — avoids a redundant SELECT before UPDATE
    @Modifying
    @Transactional
    @Query("UPDATE AllocationRules r SET r.maxTeamSize = :maxTeamSize, " +
           "r.maxStudentsPerFaculty = :maxStudentsPerFaculty WHERE r.id = :id")
    int updateRulesById(@Param("id") Long id,
                        @Param("maxTeamSize") int maxTeamSize,
                        @Param("maxStudentsPerFaculty") int maxStudentsPerFaculty);

    // DB-level guard: true if proposed team size exceeds rule
    @Query("SELECT CASE WHEN :teamSize > r.maxTeamSize THEN true ELSE false END " +
           "FROM AllocationRules r ORDER BY r.id ASC LIMIT 1")
    boolean exceedsMaxTeamSize(@Param("teamSize") int teamSize);

    // DB-level guard: true if faculty has no remaining slots
    @Query("SELECT CASE WHEN :allocatedCount >= r.maxStudentsPerFaculty THEN true ELSE false END " +
           "FROM AllocationRules r ORDER BY r.id ASC LIMIT 1")
    boolean facultyHasReachedStudentLimit(@Param("allocatedCount") int allocatedCount);
}