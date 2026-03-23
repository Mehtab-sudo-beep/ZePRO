package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Student;
import com.zepro.model.Users;
import java.util.List;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
     Optional<Student> findByUser(Users user);
     List<Student> findByDepartment_DepartmentId(Long departmentId);
}