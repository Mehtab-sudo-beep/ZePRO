package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Student;
import com.zepro.model.Users;
import java.util.Optional;

public interface StudentRepository extends JpaRepository<Student, Long> {
     Optional<Student> findByUser(Users user);
         Optional<Student> findByUser_Email(String email);

}