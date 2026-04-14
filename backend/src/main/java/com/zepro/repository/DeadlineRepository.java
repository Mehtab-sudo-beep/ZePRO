package com.zepro.repository;

import com.zepro.model.Deadline;
import com.zepro.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {
    
    // ✅ Find deadlines by role and department
    List<Deadline> findByRoleSpecificityAndDepartment_DepartmentId(UserRole role, Long departmentId);
    
    // ✅ Find active deadlines by role and department
    List<Deadline> findByRoleSpecificityAndIsActiveTrueAndDepartment_DepartmentId(UserRole role, Long departmentId);
    
    // ✅ Find all active deadlines by department
    List<Deadline> findByIsActiveTrueAndDepartment_DepartmentId(Long departmentId);
    
    // ✅ Find deadline by ID
    Optional<Deadline> findByDeadlineId(Long deadlineId);
    
    // ✅ Find all deadlines by department
    List<Deadline> findByDepartment_DepartmentId(Long departmentId);
}