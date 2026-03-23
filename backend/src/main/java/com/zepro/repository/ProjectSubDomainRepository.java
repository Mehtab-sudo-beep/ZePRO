package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.ProjectSubDomain;
import java.util.List;

public interface ProjectSubDomainRepository extends JpaRepository<ProjectSubDomain, Long> {
    List<ProjectSubDomain> findByProjectProjectId(Long projectId);
}