package com.zepro.repository;

import com.zepro.model.Faculty;
import com.zepro.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FacultyRepository extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUser(Users user);

}