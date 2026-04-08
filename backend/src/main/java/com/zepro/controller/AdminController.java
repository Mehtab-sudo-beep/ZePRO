package com.zepro.controller;

import com.zepro.dto.*;
import com.zepro.service.AdminService;
import com.zepro.model.UserRole;
import com.zepro.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/admin")
public class AdminController {

    private final AdminService adminService;
    
    @Autowired
    private UserRepository userRepository;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ✅ CHECK IF USER IS ADMIN
    private boolean isAdmin(Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            return user.getRole() == UserRole.ADMIN;
        } catch (Exception e) {
            return false;
        }
    }

    // ── INSTITUTE ─────────────────────────────────────────────

    @PostMapping("/institute")
    public ResponseEntity<?> createInstitute(
            @RequestBody CreateInstituteRequest request,
            Authentication authentication) {
        
        // ✅ AUTHENTICATION CHECK
        if (authentication == null || !authentication.isAuthenticated()) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Authentication required");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        // ✅ ADMIN ROLE CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can create institutes");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            InstituteResponse response = adminService.createInstitute(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create institute");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/institutes")
    public ResponseEntity<?> getAllInstitutes() {
        try {
            List<InstituteResponse> institutes = adminService.getAllInstitutes();
            return ResponseEntity.ok(institutes);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch institutes");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/institute/{id}")
    public ResponseEntity<?> deleteInstitute(
            @PathVariable Long id,
            Authentication authentication) {
        
        // ✅ ADMIN CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can delete institutes");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            adminService.deleteInstitute(id);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Institute deleted successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete institute");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ── DEPARTMENT ────────────────────────────────────────────

    @PostMapping("/department")
    public ResponseEntity<?> createDepartment(
            @RequestBody CreateDepartmentRequest request,
            Authentication authentication) {
        
        // ✅ ADMIN CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can create departments");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            DepartmentResponse response = adminService.createDepartment(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create department: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/departments/{instituteId}")
    public ResponseEntity<?> getDepartmentsByInstitute(@PathVariable Long instituteId) {
        try {
            List<DepartmentResponse> departments = adminService.getDepartmentsByInstitute(instituteId);
            return ResponseEntity.ok(departments);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch departments");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @DeleteMapping("/department/{id}")
    public ResponseEntity<?> deleteDepartment(
            @PathVariable Long id,
            Authentication authentication) {
        
        // ✅ ADMIN CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can delete departments");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            adminService.deleteDepartment(id);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Department deleted successfully");
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete department");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ── USERS ─────────────────────────────────────────────────

    // ✅ ADD THIS ENDPOINT
    @PostMapping("/user")
    public ResponseEntity<?> createUser(
            @RequestBody CreateUserRequest request,
            Authentication authentication) {
        
        // ✅ ADMIN CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can create users");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            UserResponse response = adminService.createUser(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create user: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/users/{departmentId}")
    public ResponseEntity<?> getUsersByDepartment(@PathVariable Long departmentId) {
        try {
            List<UserResponse> users = adminService.getUsersByDepartment(departmentId);
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch users");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        try {
            List<UserResponse> users = adminService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch users");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(
            @PathVariable Long id,
            @RequestParam String role,
            Authentication authentication) {
        
        // ✅ ADMIN CHECK
        if (!isAdmin(authentication)) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can update user roles");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            UserResponse response = adminService.updateUserRole(id, role);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update user role");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
