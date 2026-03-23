package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.ProjectDomain;
import java.util.List;

public interface ProjectDomainRepository extends JpaRepository<ProjectDomain, Long> {
    List<ProjectDomain> findByProjectProjectId(Long projectId);
    
}