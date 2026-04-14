package com.zepro.repository;

import com.zepro.model.TeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {
    
    // ✅ Find by student ID and status
    List<TeamJoinRequest> findByStudentStudentIdAndStatus(Long studentId, String status);
    
    // ✅ Find by student ID (all requests)
    List<TeamJoinRequest> findByStudentStudentId(Long studentId);
    
    // ✅ Find by team ID (all requests)
    List<TeamJoinRequest> findByTeamTeamId(Long teamId);
    
    // ✅ Find by team ID and status
    List<TeamJoinRequest> findByTeamTeamIdAndStatus(Long teamId, String status);
    
    // ✅ Check if request exists by student and team
    boolean existsByStudentStudentIdAndTeamTeamId(Long studentId, Long teamId);
    
    // ✅ Delete all requests for a student
    void deleteAllByStudentStudentId(Long studentId);
}