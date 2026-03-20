package com.zepro.repository;

import com.zepro.model.TeamJoinRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;   
import org.springframework.data.repository.query.Param;

public interface TeamJoinRequestRepository extends JpaRepository<TeamJoinRequest, Long> {

    boolean existsByStudentStudentIdAndTeamTeamId(Long studentId, Long teamId);

    List<TeamJoinRequest> findByTeamTeamIdAndStatus(Long teamId, String status);

    List<TeamJoinRequest> findByStudentStudentId(Long studentId);

    @Modifying
    @Query("delete from TeamJoinRequest r where r.student.studentId = :studentId")
    void deleteAllByStudentId(@Param("studentId") Long studentId);
}