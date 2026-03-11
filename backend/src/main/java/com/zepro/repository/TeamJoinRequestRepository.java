package com.zepro.repository;

import com.zepro.model.TeamJoinRequest;
import com.zepro.model.Team;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    List<TeamJoinRequest> findByTeamAndStatus(Team team, String status);
}