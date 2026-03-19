package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Department;

public interface DepartmentRepository extends JpaRepository<Department, Long> {
}