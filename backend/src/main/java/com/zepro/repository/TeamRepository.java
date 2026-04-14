package com.zepro.repository;

import com.zepro.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TeamRepository extends JpaRepository<Team, Long> {

    // ✅ KEEP ORIGINAL FUNCTION NAME with @Query annotation
    @Query("SELECT t FROM Team t LEFT JOIN FETCH t.faculty f WHERE t.department.departmentId = :departmentId")
    List<Team> findAllwithDetailsandDepartment_DepartmentId(@Param("departmentId") Long departmentId);

    // ✅ Alternative simpler version if above doesn't work
    @Query("SELECT DISTINCT t FROM Team t WHERE t.department.departmentId = :departmentId")
    List<Team> findAllwithDetailsandDepartment_DepartmentIdSimple(@Param("departmentId") Long departmentId);

    // Other methods
    List<Team> findByFacultyFacultyId(Long facultyId);

    Optional<Team> findByTeamId(Long teamId);

    List<Team> findByTeamLeadStudentId(Long studentId);

    List<Team> findByDepartmentDepartmentId(Long departmentId);

    List<Team> findByInstituteInstituteId(Long instituteId);

    // ✅ Additional helper methods
    @Query("SELECT t FROM Team t WHERE t.department.departmentId = :departmentId AND t.teamId = :teamId")
    Optional<Team> findByIdAndDepartmentId(@Param("teamId") Long teamId, @Param("departmentId") Long departmentId);

    @Query("SELECT COUNT(t) FROM Team t WHERE t.department.departmentId = :departmentId")
    long countByDepartmentId(@Param("departmentId") Long departmentId);
}