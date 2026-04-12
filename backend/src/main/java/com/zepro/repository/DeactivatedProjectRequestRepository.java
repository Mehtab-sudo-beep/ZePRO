package com.zepro.repository;

import com.zepro.model.DeactivatedProjectRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeactivatedProjectRequestRepository extends JpaRepository<DeactivatedProjectRequest, Long> {
    
    // ✅ Find deactivated requests by project ID
    List<DeactivatedProjectRequest> findByProjectRequestProjectProjectId(Long projectId);
    
    // ✅ Find deactivated requests by request ID
    List<DeactivatedProjectRequest> findByProjectRequestRequestId(Long requestId);
}