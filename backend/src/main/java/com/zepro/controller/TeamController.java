package com.zepro.controller;

import com.zepro.model.Team;
import com.zepro.service.TeamService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/teams")
public class TeamController {

    private final TeamService teamService;

    public TeamController(TeamService teamService) {
        this.teamService = teamService;
    }

    @PostMapping("/create")
    public Team createTeam(@RequestBody Team team) {
        return teamService.createTeam(team);
    }

    @PostMapping("/add-member")
    public String addMember(
            @RequestParam Long teamId,
            @RequestParam Long studentId) {

        teamService.addMember(teamId, studentId);
        return "Member added";
    }
}   