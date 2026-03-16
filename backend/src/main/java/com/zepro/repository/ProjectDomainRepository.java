package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.ProjectDomain;

public interface ProjectDomainRepository extends JpaRepository<ProjectDomain, Long> {

}