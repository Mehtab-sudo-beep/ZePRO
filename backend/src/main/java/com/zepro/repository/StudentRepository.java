package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zepro.model.Faculty;
import com.zepro.model.Student;
import com.zepro.model.Users;
import java.util.Optional;
import java.util.List;
public interface StudentRepository extends JpaRepository<Student, Long> {
     Optional<Student> findByUser(Users user);

         Optional<Student> findByUser_Email(String email);
    Optional<Student> findByUserUserId(Long userId);

    long countByIsAllocatedTrue();

    long countByIsAllocatedFalse();

    List<Student> findByIsAllocatedFalse();

    List<Student> findByIsAllocatedTrue(); // ✅ ADD THIS — used by getAllocatedStudents()

    List<Student> findByAllocatedFacultyFacultyId(Long facultyId);
    long countByAllocatedFaculty(Faculty faculty);

    @Query("SELECT s FROM Student s WHERE " +
            "LOWER(s.user.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.rollNumber) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
            "LOWER(s.user.email) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Student> searchStudents(@Param("query") String query);

    @Modifying
    @Query("UPDATE Student s SET s.isAllocated = true, s.allocatedFaculty = :faculty WHERE s.studentId = :studentId")
    void allocateToFaculty(@Param("studentId") Long studentId, @Param("faculty") Faculty faculty);

    @Modifying
    @Query("UPDATE Student s SET s.allocatedFaculty = :faculty WHERE s.studentId = :studentId")
    void updateAllocatedFaculty(@Param("studentId") Long studentId, @Param("faculty") Faculty faculty);
}