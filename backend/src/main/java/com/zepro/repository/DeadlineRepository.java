package com.zepro.repository;

import com.zepro.model.Deadline;
import com.zepro.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {
    
    // ✅ Find deadlines by role
    List<Deadline> findByRoleSpecificity(UserRole role);
    
    // ✅ Find active deadlines by role
    List<Deadline> findByRoleSpecificityAndIsActiveTrue(UserRole role);
    
    // ✅ Find all active deadlines
    List<Deadline> findByIsActiveTrue();
    
    // ✅ Find deadline by ID
    Optional<Deadline> findByDeadlineId(Long deadlineId);
}