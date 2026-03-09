package com.zepro.controller;

import com.zepro.dto.student.*;
import com.zepro.service.StudentService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/student")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @PostMapping("/create-team")
    public TeamResponse createTeam(@RequestBody CreateTeamRequest request) {
        return studentService.createTeam(request);
    }

    @PostMapping("/join-team")
    public String joinTeam(@RequestBody JoinTeamRequest request) {
        return studentService.joinTeam(request);
    }

    // TEAM LEAD SENDS PROJECT REQUEST
    @PostMapping("/request-project")
    public String requestProject(@RequestBody ProjectRequestDTO request) {
        return studentService.requestProject(request);
    }

    // STUDENT CHECKS ASSIGNED PROJECT
    @GetMapping("/assigned-project/{studentId}")
    public AssignedProjectResponse getAssignedProject(@PathVariable Long studentId) {
        return studentService.getAssignedProject(studentId);
    }
}