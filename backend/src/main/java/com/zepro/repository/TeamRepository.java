package com.zepro.repository;

import com.zepro.model.Team;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface TeamRepository extends JpaRepository<Team, Long> {

    @Query("SELECT t FROM Team t " +
            "LEFT JOIN FETCH t.faculty f " +
            "LEFT JOIN FETCH f.user " +
            "LEFT JOIN FETCH t.teamLead " +
            "LEFT JOIN FETCH t.members m " +
            "LEFT JOIN FETCH m.user " +
            "LEFT JOIN FETCH m.allocatedFaculty af " +
            "LEFT JOIN FETCH af.user")
    List<Team> findAllWithDetails();
}