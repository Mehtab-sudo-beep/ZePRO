package com.zepro.repository;

import com.zepro.model.AllocationRules;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AllocationRulesRepository extends JpaRepository<AllocationRules, Long> {
    // ✅ GET RULES FOR SPECIFIC DEPARTMENT & INSTITUTE & DEGREE
    Optional<AllocationRules> findByDepartment_DepartmentIdAndInstitute_InstituteIdAndDegree(
            Long departmentId, Long instituteId, String degree);
    Optional<AllocationRules> findByDepartment_DepartmentIdAndDegree(Long departmentId, String degree);
    java.util.List<AllocationRules> findByDepartment_DepartmentId(Long departmentId);
    Optional<AllocationRules> findByDepartmentIsNull();
}