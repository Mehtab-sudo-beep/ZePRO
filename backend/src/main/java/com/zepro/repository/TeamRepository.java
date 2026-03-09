package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Team;

public interface TeamRepository extends JpaRepository<Team, Long> {
}