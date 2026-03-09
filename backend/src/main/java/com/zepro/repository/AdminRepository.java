package com.zepro.repository;

import com.zepro.model.Admin;
import com.zepro.model.Users;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface AdminRepository extends JpaRepository<Admin, Long> {

    Optional<Admin> findByUser(Users user);

}