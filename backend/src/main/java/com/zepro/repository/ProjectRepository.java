package com.zepro.repository;
import com.zepro.model.Team;
import com.zepro.model.Project;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectRepository extends JpaRepository<Project,Long>{

    List<Project> findByFacultyFacultyId(Long facultyId);

    List<Project> findByStatus(String status);

    Project findByTeam(Team team);
}