package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.User;

public interface UserRepository extends JpaRepository<User, Long> {

}