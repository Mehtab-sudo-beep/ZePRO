package com.zepro.repository;

import com.zepro.model.AllocationRules;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface AllocationRulesRepository extends JpaRepository<AllocationRules, Long> {
    // ✅ GET RULES FOR SPECIFIC DEPARTMENT & INSTITUTE
    Optional<AllocationRules> findByDepartment_DepartmentIdAndInstitute_InstituteId(
            Long departmentId, Long instituteId);
    Optional<AllocationRules> findByDepartment_DepartmentId(Long departmentId);
    Optional<AllocationRules> findByDepartmentIsNull();
}