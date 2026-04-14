package com.zepro.controller;

import com.zepro.dto.deadline.CreateDeadlineRequest;
import com.zepro.dto.deadline.DeadlineResponse;
import com.zepro.model.UserRole;
import com.zepro.model.Faculty;
import com.zepro.model.Student;
import com.zepro.service.DeadlineService;
import com.zepro.repository.FacultyRepository;
import com.zepro.repository.UserRepository;
import com.zepro.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/deadlines")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FacultyDeadlineController {
    
    @Autowired
    private DeadlineService deadlineService;
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    @Autowired
    private UserRepository usersRepository;
    
    @Autowired
    private StudentRepository studentRepository;
    
    // ✅ Check if user is FACULTY COORDINATOR
    private boolean isFacultyCoordinator(Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            if (user.getRole() == UserRole.FACULTY) {
                var faculty = facultyRepository.findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Faculty record not found"));
                return faculty.getIsFC() != null && faculty.getIsFC();
            }
            
            return false;
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error checking coordinator status: " + e.getMessage());
            return false;
        }
    }

    // ✅ Get coordinator's email from authentication
    private String getCoordinatorEmail(Authentication authentication) {
        return authentication.getName();
    }

    // ✅ Get coordinator's department ID (FOR FACULTY COORDINATORS)
    private Long getCoordinatorDepartmentId(Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            var faculty = facultyRepository.findByUser(user)
                .orElseThrow(() -> new RuntimeException("Faculty record not found"));
            
            if (faculty.getDepartment() == null) {
                throw new RuntimeException("Faculty does not have an assigned department");
            }
            
            return faculty.getDepartment().getDepartmentId();
        } catch (Exception e) {
            throw new RuntimeException("Failed to get coordinator's department: " + e.getMessage());
        }
    }

    // ✅ NEW: Get student's department ID (FOR STUDENTS)
    private Long getStudentDepartmentId(Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            var student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Student record not found"));
            
            if (student.getDepartment() == null) {
                System.out.println("[FacultyDeadlineController] ⚠️  Student does not have a department assigned");
                return null;
            }
            
            System.out.println("[FacultyDeadlineController] 👤 Student department: " + student.getDepartment().getDepartmentName());
            return student.getDepartment().getDepartmentId();
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error getting student's department: " + e.getMessage());
            return null;
        }
    }
    
    // ✅ GET DEADLINES (Works for all users - FC gets all, students get role-specific)
    @GetMapping("")
    public ResponseEntity<?> getDeadlines(Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 📋 GET /api/deadlines");
            String email = authentication.getName();
            var user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<DeadlineResponse> deadlines;
            
            // ✅ If Faculty Coordinator → Get all deadlines for their department
            if (isFacultyCoordinator(authentication)) {
                Long departmentId = getCoordinatorDepartmentId(authentication);
                System.out.println("[FacultyDeadlineController] 👨‍🏫 Fetching all deadlines for FC department: " + departmentId);
                deadlines = deadlineService.getAllDeadlinesByDepartment(departmentId);
            } 
            // ✅ If Student → Get role-specific deadlines for their department
            else if (user.getRole() == UserRole.STUDENT) {
                Long departmentId = getStudentDepartmentId(authentication);
                
                if (departmentId == null) {
                    System.out.println("[FacultyDeadlineController] ⚠️  Student has not completed profile yet");
                    Map<String, Object> error = new HashMap<>();
                    error.put("message", "Please complete your profile first");
                    error.put("profileComplete", false);
                    return ResponseEntity.status(HttpStatus.ACCEPTED).body(error);
                }
                
                System.out.println("[FacultyDeadlineController] 👤 Fetching STUDENT deadlines for department: " + departmentId);
                deadlines = deadlineService.getActiveDeadlinesByRoleAndDepartment(UserRole.STUDENT, departmentId);
            } 
            // ✅ If Faculty (NOT Coordinator) → Get role-specific deadlines
            else if (user.getRole() == UserRole.FACULTY) {
                Long departmentId = getCoordinatorDepartmentId(authentication);
                System.out.println("[FacultyDeadlineController] 👨‍🏫 Fetching FACULTY deadlines for department: " + departmentId);
                deadlines = deadlineService.getActiveDeadlinesByRoleAndDepartment(UserRole.FACULTY, departmentId);
            }
            // ✅ Default for other roles
            else {
                Long departmentId = getCoordinatorDepartmentId(authentication);
                deadlines = deadlineService.getActiveDeadlinesByRoleAndDepartment(user.getRole(), departmentId);
            }
            
            System.out.println("[FacultyDeadlineController] ✅ Found " + deadlines.size() + " deadlines");
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            e.printStackTrace();
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ CREATE DEADLINE (FC Only - Auto-binds to their department)
    @PostMapping("/create")
    public ResponseEntity<?> createDeadline(@RequestBody CreateDeadlineRequest request, Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 📝 POST /api/deadlines/create");
            
            if (!isFacultyCoordinator(authentication)) {
                System.out.println("[FacultyDeadlineController] ❌ User is not a Faculty Coordinator");
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can create deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String coordinatorEmail = getCoordinatorEmail(authentication);
            System.out.println("[FacultyDeadlineController] 👨‍🏫 Creating deadline for coordinator: " + coordinatorEmail);
            
            DeadlineResponse response = deadlineService.createDeadline(request, coordinatorEmail);
            
            System.out.println("[FacultyDeadlineController] ✅ Deadline created successfully: " + response.getDeadlineId());
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            System.out.println("[FacultyDeadlineController] ❌ Invalid argument: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error creating deadline: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create deadline");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ GET ALL DEADLINES FOR COORDINATOR'S DEPARTMENT
    @GetMapping("/coordinator/all")
    public ResponseEntity<?> getCoordinatorAllDeadlines(Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 📋 GET /api/deadlines/coordinator/all");
            
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can view all deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String coordinatorEmail = getCoordinatorEmail(authentication);
            List<DeadlineResponse> deadlines = deadlineService.getCoordinatorDeadlines(coordinatorEmail);
            
            System.out.println("[FacultyDeadlineController] ✅ Found " + deadlines.size() + " deadlines");
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ GET DEADLINES BY ROLE AND DEPARTMENT
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getDeadlinesByRole(@PathVariable String role, Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 📋 GET /api/deadlines/role/" + role);
            
            UserRole roleEnum = UserRole.valueOf(role.toUpperCase());
            
            // ✅ Get department based on user role
            Long departmentId;
            if (roleEnum == UserRole.STUDENT) {
                departmentId = getStudentDepartmentId(authentication);
                if (departmentId == null) {
                    Map<String, Object> error = new HashMap<>();
                    error.put("error", "Please complete your profile first");
                    return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
                }
            } else {
                departmentId = getCoordinatorDepartmentId(authentication);
            }
            
            List<DeadlineResponse> deadlines = deadlineService.getActiveDeadlinesByRoleAndDepartment(roleEnum, departmentId);
            
            System.out.println("[FacultyDeadlineController] ✅ Found " + deadlines.size() + " deadlines for role: " + role);
            return ResponseEntity.ok(deadlines);
        } catch (IllegalArgumentException e) {
            System.out.println("[FacultyDeadlineController] ❌ Invalid role: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid role");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ GET DEADLINE BY ID
    @GetMapping("/{deadlineId}")
    public ResponseEntity<?> getDeadlineById(@PathVariable Long deadlineId) {
        try {
            System.out.println("[FacultyDeadlineController] 📋 GET /api/deadlines/" + deadlineId);
            
            DeadlineResponse deadline = deadlineService.getDeadlineById(deadlineId);
            
            System.out.println("[FacultyDeadlineController] ✅ Deadline found: " + deadlineId);
            return ResponseEntity.ok(deadline);
        } catch (RuntimeException e) {
            System.out.println("[FacultyDeadlineController] ❌ Deadline not found: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadline");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ TOGGLE DEADLINE ACTIVE STATUS (FC Only)
    @PutMapping("/{deadlineId}/toggle-active")
    public ResponseEntity<?> toggleActiveFlag(@PathVariable Long deadlineId, Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 🔄 PUT /api/deadlines/" + deadlineId + "/toggle-active");
            
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can toggle deadline status");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String coordinatorEmail = getCoordinatorEmail(authentication);
            DeadlineResponse response = deadlineService.toggleDeadlineStatus(deadlineId, coordinatorEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Active flag toggled successfully");
            result.put("deadline", response);
            
            System.out.println("[FacultyDeadlineController] ✅ Deadline status toggled: " + deadlineId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error toggling flag: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to toggle flag");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ UPDATE DEADLINE (FC Only - Department stays fixed)
    @PutMapping("/{deadlineId}")
    public ResponseEntity<?> updateDeadline(@PathVariable Long deadlineId, @RequestBody CreateDeadlineRequest request, Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] ✏️  PUT /api/deadlines/" + deadlineId);
            
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can update deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String coordinatorEmail = getCoordinatorEmail(authentication);
            DeadlineResponse response = deadlineService.updateDeadline(deadlineId, request, coordinatorEmail);
            
            System.out.println("[FacultyDeadlineController] ✅ Deadline updated: " + deadlineId);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error updating deadline: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update deadline");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    // ✅ DELETE DEADLINE (FC Only)
    @DeleteMapping("/{deadlineId}")
    public ResponseEntity<?> deleteDeadline(@PathVariable Long deadlineId, Authentication authentication) {
        try {
            System.out.println("[FacultyDeadlineController] 🗑️  DELETE /api/deadlines/" + deadlineId);
            
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can delete deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            String coordinatorEmail = getCoordinatorEmail(authentication);
            deadlineService.deleteDeadline(deadlineId, coordinatorEmail);
            
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Deadline deleted successfully");
            
            System.out.println("[FacultyDeadlineController] ✅ Deadline deleted: " + deadlineId);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            System.out.println("[FacultyDeadlineController] ❌ Error: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            System.out.println("[FacultyDeadlineController] ❌ Error deleting deadline: " + e.getMessage());
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete deadline");
            error.put("details", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
