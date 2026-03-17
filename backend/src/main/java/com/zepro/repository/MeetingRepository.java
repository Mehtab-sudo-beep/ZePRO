package com.zepro.repository;

import com.zepro.model.Meeting;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {
    List<Meeting> findByTeamTeamId(Long teamId);

    List<Meeting> findByRequestRequestId(Long requestId);
}