package com.zepro.repository;

import com.zepro.model.DeactivatedMeeting;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeactivatedMeetingRepository extends JpaRepository<DeactivatedMeeting, Long> {
    
    // ✅ Find deactivated meetings by project ID
    List<DeactivatedMeeting> findByMeetingRequestProjectProjectId(Long projectId);
    
    // ✅ Find deactivated meetings by request ID
    List<DeactivatedMeeting> findByMeetingRequestRequestId(Long requestId);
}