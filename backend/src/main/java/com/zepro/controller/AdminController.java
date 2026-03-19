package com.zepro.controller;

import com.zepro.dto.*;
import com.zepro.service.AdminService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @PostMapping("/institute")
    public InstituteResponse createInstitute(@RequestBody CreateInstituteRequest request) {
        return adminService.createInstitute(request);
    }

    @PostMapping("/department")
    public DepartmentResponse createDepartment(@RequestBody CreateDepartmentRequest request) {
        return adminService.createDepartment(request);
    }

    @PostMapping("/create-user")
    public UserResponse createUser(@RequestBody CreateUserRequest request) {
        return adminService.createUser(request);
    }
}