package com.zepro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.zepro.model.ProjectRequest;

public interface ProjectRequestRepository extends JpaRepository<ProjectRequest, Long> {

    Optional<ProjectRequest> findByTeamTeamId(Long teamId);

}