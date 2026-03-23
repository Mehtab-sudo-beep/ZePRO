package com.zepro.controller;

import com.zepro.dto.*;
import com.zepro.service.AdminService;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ── INSTITUTE ─────────────────────────────────────────────

    @PostMapping("/institute")
    public InstituteResponse createInstitute(@RequestBody CreateInstituteRequest request) {
        return adminService.createInstitute(request);
    }

    @GetMapping("/institutes")
    public List<InstituteResponse> getAllInstitutes() {
        return adminService.getAllInstitutes();
    }

    @DeleteMapping("/institute/{id}")
    public void deleteInstitute(@PathVariable Long id) {
        adminService.deleteInstitute(id);
    }

    // ── DEPARTMENT ────────────────────────────────────────────

    @PostMapping("/department")
    public DepartmentResponse createDepartment(@RequestBody CreateDepartmentRequest request) {
        return adminService.createDepartment(request);
    }

    @GetMapping("/departments/{instituteId}")
    public List<DepartmentResponse> getDepartmentsByInstitute(@PathVariable Long instituteId) {
        return adminService.getDepartmentsByInstitute(instituteId);
    }

    @DeleteMapping("/department/{id}")
    public void deleteDepartment(@PathVariable Long id) {
        adminService.deleteDepartment(id);
    }

    // ── USERS ─────────────────────────────────────────────────

    @GetMapping("/users/{departmentId}")
    public List<UserResponse> getUsersByDepartment(@PathVariable Long departmentId) {
        return adminService.getUsersByDepartment(departmentId);
    }

    @GetMapping("/users")
    public List<UserResponse> getAllUsers() {
        return adminService.getAllUsers();
    }
}