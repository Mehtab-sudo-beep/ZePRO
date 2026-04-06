package com.zepro.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.zepro.model.Faculty;
import com.zepro.model.Users;
import java.util.List;


public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUser_Email(String email);
    Optional<Faculty> findByUserUserId(Long userId);
    Optional<Faculty> findByUser(Users user);
    Optional<Faculty> findByUserUserIdAndIsFCTrue(Long userId);

    @Query("SELECT f FROM Faculty f WHERE " +
           "LOWER(f.user.name) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.user.email) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           "LOWER(f.specialization) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Faculty> searchFaculties(@Param("query") String query);

    @Query("SELECT COALESCE(SUM(f.maxStudents), 0) FROM Faculty f")
    Integer sumMaxStudents();   // ← Integer not int

    @Query("SELECT COALESCE(SUM(f.allocatedStudents), 0) FROM Faculty f")
    Integer sumAllocatedStudents();   // ← Integer not int

    @Modifying
    @Query("UPDATE Faculty f SET f.allocatedStudents = f.allocatedStudents - 1 WHERE f.facultyId = :facultyId")
    void decrementAllocatedStudents(@Param("facultyId") Long facultyId);

    @Modifying
    @Query("UPDATE Faculty f SET f.allocatedStudents = f.allocatedStudents + 1 WHERE f.facultyId = :facultyId")
    void incrementAllocatedStudents(@Param("facultyId") Long facultyId);
}