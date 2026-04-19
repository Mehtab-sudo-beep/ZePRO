package com.zepro.repository;

import com.zepro.model.DeactivatedTeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DeactivatedTeamJoinRequestRepository extends JpaRepository<DeactivatedTeamJoinRequest, Long> {

    // ✅ Find all deactivated requests for a specific student
    List<DeactivatedTeamJoinRequest> findByTeamJoinRequestStudentStudentId(Long studentId);

    // ✅ Find all deactivated requests for a specific team
    List<DeactivatedTeamJoinRequest> findByTeamJoinRequest_Team_TeamId(Long teamId);
}
