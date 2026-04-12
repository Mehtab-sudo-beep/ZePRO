package com.zepro.repository;
import com.zepro.model.Team;
import com.zepro.model.Project;
import com.zepro.model.ProjectRequest;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long>{

    List<Project> findByFacultyFacultyId(Long facultyId);

    List<Project> findByStatus(String status);

    Project findByTeam(Team team);
    
    List<Project> findByFacultyFacultyIdAndProjectId(Long facultyId, Long projectId);
    
    List<Project> findByFacultyFacultyIdAndStatus(Long facultyId, String status);

    // ✅ NEW: Find projects by faculty, status and team
    List<Project> findByFacultyFacultyIdAndStatusAndTeam(Long facultyId, String status, Team team);

    // ✅ NEW: Find project by team and status
    Project findByTeamAndStatus(Team team, String status);
    
    // ✅ Find projects by team and project request
    @Query("SELECT p FROM Project p WHERE EXISTS " +
           "(SELECT pr FROM ProjectRequest pr WHERE pr.project = p AND pr.team = :team AND pr.status = 'ACCEPTED')")
    List<Project> findByTeamWithAcceptedRequest(@Param("team") Team team);

    // ✅ Find requests for a specific project and team
    @Query("SELECT pr FROM ProjectRequest pr WHERE pr.project = :project AND pr.team = :team")
    List<ProjectRequest> findByProjectAndTeam(@Param("project") Project project, @Param("team") Team team);
}