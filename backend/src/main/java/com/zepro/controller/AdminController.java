package com.zepro.controller;

import com.zepro.dto.*;
import com.zepro.service.AdminService;
import com.zepro.model.UserRole;
import com.zepro.repository.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
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

   // ✅ HELPER METHOD - CHECK IF ADMIN
    private boolean isAdmin(Authentication authentication) {
        if (authentication == null) {
            System.out.println("[AdminController] ❌ Authentication is null");
            return false;
        }

        System.out.println("[AdminController] 🔐 Principal: " + authentication.getPrincipal());
        System.out.println("[AdminController] 🔐 Authorities: " + authentication.getAuthorities());

        boolean isAdmin = authentication.getAuthorities()
                .stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(auth -> {
                    System.out.println("[AdminController] 🔍 Checking authority: " + auth);
                    return auth.equals("ROLE_ADMIN") || auth.equals("ADMIN");
                });

        System.out.println("[AdminController] ✅ Is Admin: " + isAdmin);
        return isAdmin;
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

    // ✅ GET FACULTY BY DEPARTMENT
    @GetMapping("/department/{departmentId}/faculty")
    public ResponseEntity<?> getFacultyByDepartment(
            @PathVariable Long departmentId,
            Authentication authentication) {

        System.out.println("\n========== GET FACULTY BY DEPARTMENT ==========");
        System.out.println("[AdminController] 📡 GET /admin/department/" + departmentId + "/faculty");
        System.out.println("[AdminController] 🔐 Authentication: " + authentication);

        if (authentication == null) {
            System.out.println("[AdminController] ❌ No authentication provided");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        if (!isAdmin(authentication)) {
            System.out.println("[AdminController] ❌ User is not admin - FORBIDDEN");
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can view faculty");
            error.put("status", 403);
            error.put("authorities", authentication.getAuthorities().toString());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            List<UserResponse> faculty = adminService.getFacultyByDepartment(departmentId);
            System.out.println("[AdminController] ✅ Found " + faculty.size() + " faculty members");
            return ResponseEntity.ok(faculty);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch faculty: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ ASSIGN FACULTY COORDINATOR
    @PostMapping("/department/{departmentId}/coordinator")
    public ResponseEntity<?> assignFacultyCoordinator(
            @PathVariable Long departmentId,
            @RequestBody AssignFacultyCoordinatorRequest request,
            Authentication authentication) {

        System.out.println("\n========== ASSIGN FACULTY COORDINATOR ==========");
        System.out.println("[AdminController] 📤 POST /admin/department/" + departmentId + "/coordinator");
        System.out.println("[AdminController] Request - FacultyId: " + request.getFacultyId() + ", DepartmentId: " + request.getDepartmentId());
        System.out.println("[AdminController] 🔐 Authentication: " + authentication);

        if (authentication == null) {
            System.out.println("[AdminController] ❌ No authentication provided");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        if (!isAdmin(authentication)) {
            System.out.println("[AdminController] ❌ User is not admin - FORBIDDEN");
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Only ADMIN can assign coordinators");
            error.put("status", 403);
            error.put("authorities", authentication.getAuthorities().toString());
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        }

        try {
            System.out.println("[AdminController] 🔄 Processing assignment...");
            
            DepartmentResponse response = adminService.assignFacultyCoordinator(
                    request.getFacultyId(),
                    departmentId
            );
            
            System.out.println("[AdminController] ✅ Success - Coordinator assigned");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new java.util.Date());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ REMOVE FACULTY COORDINATOR
    @DeleteMapping("/department/{departmentId}/coordinator/{facultyId}")
    public ResponseEntity<?> removeFacultyCoordinator(
            @PathVariable Long departmentId,
            @PathVariable Long facultyId,
            Authentication authentication) {

        System.out.println("\n========== REMOVE FACULTY COORDINATOR ==========");
        System.out.println("[AdminController] 📤 DELETE /admin/department/" + departmentId + "/coordinator/" + facultyId);
        System.out.println("[AdminController] 🔐 Authentication: " + authentication);

        if (authentication == null || !authentication.isAuthenticated()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(Map.of("error", "Unauthorized"));
        }

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(Map.of("error", "Only ADMIN can remove coordinators"));
        }

        try {
            System.out.println("[AdminController] 🔄 Processing removal...");
            
            DepartmentResponse response = adminService.removeFacultyCoordinator(facultyId, departmentId);
            
            System.out.println("[AdminController] ✅ Success - Coordinator removed");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            e.printStackTrace();

            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            error.put("timestamp", new java.util.Date());

            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }

    // ✅ GET DEPARTMENT STATS
    @GetMapping("/department/{departmentId}/stats")
    public ResponseEntity<?> getDepartmentStats(
            @PathVariable Long departmentId,
            Authentication authentication) {

        System.out.println("\n========== GET DEPARTMENT STATS ==========");
        System.out.println("[AdminController] 📊 GET /admin/department/" + departmentId + "/stats");

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only ADMIN can view stats"));
        }

        try {
            DepartmentStatsResponse stats = adminService.getDepartmentStats(departmentId);
            System.out.println("[AdminController] ✅ Stats fetched");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET ADMIN DASHBOARD STATS
    @GetMapping("/dashboard/stats")
    public ResponseEntity<?> getAdminDashboardStats(Authentication authentication) {

        System.out.println("\n========== ADMIN DASHBOARD STATS ==========");
        System.out.println("[AdminController] 📊 GET /admin/dashboard/stats");

        if (!isAdmin(authentication)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Only ADMIN can access this"));
        }

        try {
            AdminDashboardStatsResponse stats = adminService.getAdminDashboardStats();
            System.out.println("[AdminController] ✅ Stats fetched");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET FACULTY DASHBOARD STATS
    @GetMapping("/faculty/{facultyId}/dashboard-stats")
    public ResponseEntity<?> getFacultyDashboardStats(
            @PathVariable Long facultyId,
            Authentication authentication) {

        System.out.println("\n========== FACULTY DASHBOARD STATS ==========");
        System.out.println("[AdminController] 📊 GET /admin/faculty/" + facultyId + "/dashboard-stats");

        try {
            FacultyDashboardStatsResponse stats = adminService.getFacultyDashboardStats(facultyId);
            System.out.println("[AdminController] ✅ Faculty stats fetched");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }

    // ✅ GET STUDENT DASHBOARD STATS
    @GetMapping("/student/{studentId}/dashboard-stats")
    public ResponseEntity<?> getStudentDashboardStats(
            @PathVariable Long studentId,
            Authentication authentication) {

        System.out.println("\n========== STUDENT DASHBOARD STATS ==========");
        System.out.println("[AdminController] 📊 GET /admin/student/" + studentId + "/dashboard-stats");

        try {
            StudentDashboardStatsResponse stats = adminService.getStudentDashboardStats(studentId);
            System.out.println("[AdminController] ✅ Student stats fetched");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            System.out.println("[AdminController] ❌ Error: " + e.getMessage());
            return ResponseEntity.status(500)
                    .body(Map.of("error", e.getMessage()));
        }
    }
}