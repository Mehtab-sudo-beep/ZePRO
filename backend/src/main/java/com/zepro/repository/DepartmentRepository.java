package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Department;
import java.util.List;  
public interface DepartmentRepository extends JpaRepository<Department, Long> {
        List<Department> findByInstitute_InstituteId(Long instituteId);
}