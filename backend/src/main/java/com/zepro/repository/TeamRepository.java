package com.zepro.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.zepro.model.Team;
<<<<<<< HEAD

public interface TeamRepository extends JpaRepository<Team, Long> {
=======
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {
    
List<Team> findAll();
>>>>>>> origin/main
}