package com.zepro.controller;

import com.zepro.dto.deadline.CreateDeadlineRequest;
import com.zepro.dto.deadline.DeadlineResponse;
import com.zepro.model.UserRole;
import com.zepro.service.DeadlineService;
import com.zepro.repository.FacultyRepository;
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
@RequestMapping("/api/deadlines")
@CrossOrigin(origins = "*", maxAge = 3600)
public class FacultyDeadlineController {
    
    @Autowired
    private DeadlineService deadlineService;
    
    @Autowired
    private FacultyRepository facultyRepository;
    
    @Autowired
    private UserRepository usersRepository;
    
    // ✅ CORRECTED: Check if user is FACULTY with isFC=true
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
            return false;
        }
    }
    
    // ✅ GET DEADLINES (Works for all users - FC gets all, others get role-specific)
    @GetMapping("")
    public ResponseEntity<?> getDeadlines(Authentication authentication) {
        try {
            String email = authentication.getName();
            var user = usersRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            List<DeadlineResponse> deadlines;
            
            // If Faculty Coordinator with isFC=true → Get ALL deadlines
            if (isFacultyCoordinator(authentication)) {
                deadlines = deadlineService.getAllDeadlines();
            } 
            // Otherwise → Get role-specific deadlines
            else {
                deadlines = deadlineService.getDeadlinesByRole(user.getRole());
            }
            
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PostMapping("/create")
    public ResponseEntity<?> createDeadline(@RequestBody CreateDeadlineRequest request, Authentication authentication) {
        try {
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can create deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            DeadlineResponse response = deadlineService.createDeadline(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to create deadline");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/all")
    public ResponseEntity<?> getAllDeadlines(Authentication authentication) {
        try {
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can view all deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            List<DeadlineResponse> deadlines = deadlineService.getAllDeadlines();
            return ResponseEntity.ok(deadlines);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/role/{role}")
    public ResponseEntity<?> getDeadlinesByRole(@PathVariable String role, Authentication authentication) {
        try {
            UserRole roleEnum = UserRole.valueOf(role.toUpperCase());
            List<DeadlineResponse> deadlines = deadlineService.getDeadlinesByRole(roleEnum);
            return ResponseEntity.ok(deadlines);
        } catch (IllegalArgumentException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Invalid role");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadlines");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @GetMapping("/{deadlineId}")
    public ResponseEntity<?> getDeadlineById(@PathVariable Long deadlineId) {
        try {
            DeadlineResponse deadline = deadlineService.getDeadlineById(deadlineId);
            return ResponseEntity.ok(deadline);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to fetch deadline");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{deadlineId}/toggle-active")
    public ResponseEntity<?> toggleActiveFlag(@PathVariable Long deadlineId, Authentication authentication) {
        try {
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can toggle deadline status");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            DeadlineResponse response = deadlineService.toggleActiveFlag(deadlineId);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Active flag toggled successfully");
            result.put("deadline", response);
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to toggle flag");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @PutMapping("/{deadlineId}")
    public ResponseEntity<?> updateDeadline(@PathVariable Long deadlineId, @RequestBody CreateDeadlineRequest request, Authentication authentication) {
        try {
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can update deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            DeadlineResponse response = deadlineService.updateDeadline(deadlineId, request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to update deadline");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
    
    @DeleteMapping("/{deadlineId}")
    public ResponseEntity<?> deleteDeadline(@PathVariable Long deadlineId, Authentication authentication) {
        try {
            if (!isFacultyCoordinator(authentication)) {
                Map<String, Object> error = new HashMap<>();
                error.put("error", "Only Faculty Coordinators can delete deadlines");
                return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
            }
            
            deadlineService.deleteDeadline(deadlineId);
            Map<String, Object> result = new HashMap<>();
            result.put("message", "Deadline deleted successfully");
            return ResponseEntity.ok(result);
        } catch (RuntimeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Failed to delete deadline");
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
        }
    }
}
