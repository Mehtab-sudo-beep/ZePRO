package com.zepro.repository;

import com.zepro.model.Deadline;
import com.zepro.model.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DeadlineRepository extends JpaRepository<Deadline, Long> {
    
    // ✅ Find deadlines by role, department and degree
    List<Deadline> findByRoleSpecificityAndDepartment_DepartmentIdAndDegree(UserRole role, Long departmentId, String degree);
    
    // ✅ Find active deadlines by role, department and degree
    List<Deadline> findByRoleSpecificityAndIsActiveTrueAndDepartment_DepartmentIdAndDegree(UserRole role, Long departmentId, String degree);
    
    // ✅ Find all active deadlines by department and degree
    List<Deadline> findByIsActiveTrueAndDepartment_DepartmentIdAndDegree(Long departmentId, String degree);
    
    // ✅ Find deadline by ID
    Optional<Deadline> findByDeadlineId(Long deadlineId);
    
    // ✅ Find all deadlines by department (any status, any role)
    List<Deadline> findByDepartment_DepartmentId(Long departmentId);
    
    // ✅ Find all deadlines by department AND degree (coordinator view — all statuses)
    List<Deadline> findByDepartment_DepartmentIdAndDegree(Long departmentId, String degree);
}