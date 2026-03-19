package com.zepro.service;
import com.zepro.model.Team;
import org.springframework.stereotype.Service;

@Service
public class TeamService {

    public Team createTeam(Team team){
        return team;
    }

    public void addMember(Long teamId, Long studentId){
        // implement later
    }
}
