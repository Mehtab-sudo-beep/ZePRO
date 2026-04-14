package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Domain;
import java.util.List;

public interface DomainRepository extends JpaRepository<Domain, Long> {
    List<Domain> findByDepartment_DepartmentId(Long departmentId);
}