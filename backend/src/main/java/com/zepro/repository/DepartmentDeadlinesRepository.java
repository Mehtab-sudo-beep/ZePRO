package com.zepro.repository;

import com.zepro.model.DepartmentDeadlines;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DepartmentDeadlinesRepository extends JpaRepository<DepartmentDeadlines, Long> {

    Optional<DepartmentDeadlines> findByDepartment_DepartmentId(Long departmentId);
    Optional<DepartmentDeadlines> findByDepartment_DepartmentIdAndDegree(Long departmentId, String degree);
}
