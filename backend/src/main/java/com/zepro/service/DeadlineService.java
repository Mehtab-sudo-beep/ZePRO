package com.zepro.service;

import com.zepro.model.Deadline;
import com.zepro.model.Department;
import com.zepro.model.Faculty;
import com.zepro.model.UserRole;
import com.zepro.dto.deadline.CreateDeadlineRequest;
import com.zepro.dto.deadline.DeadlineResponse;
import com.zepro.repository.DeadlineRepository;
import com.zepro.repository.DepartmentRepository;
import com.zepro.repository.FacultyRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class DeadlineService {

    private final DeadlineRepository deadlineRepository;
    private final DepartmentRepository departmentRepository;
    private final FacultyRepository facultyRepository;
    private final com.zepro.repository.StudentRepository studentRepository;
    private final EmailService emailService;

    public DeadlineService(DeadlineRepository deadlineRepository, DepartmentRepository departmentRepository,
                          FacultyRepository facultyRepository, com.zepro.repository.StudentRepository studentRepository,
                          EmailService emailService) {
        this.deadlineRepository = deadlineRepository;
        this.departmentRepository = departmentRepository;
        this.facultyRepository = facultyRepository;
        this.studentRepository = studentRepository;
        this.emailService = emailService;
    }

    // ✅ CREATE DEADLINE (Auto-bind to Coordinator's Department)
    @Transactional
    public DeadlineResponse createDeadline(CreateDeadlineRequest request, String coordinatorEmail) {
        System.out.println("[DeadlineService] 📌 Creating deadline: " + request.getTitle());
        
        // Get coordinator's faculty record
        Faculty coordinator = facultyRepository.findByUser_Email(coordinatorEmail)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + coordinatorEmail));

        // Get coordinator's department
        Department department = coordinator.getDepartment();
        if (department == null) {
            throw new RuntimeException("Coordinator does not have an assigned department");
        }

        System.out.println("[DeadlineService] 👨‍🏫 Coordinator: " + coordinatorEmail);
        System.out.println("[DeadlineService] 🏢 Department: " + department.getDepartmentName());

        Deadline deadline = new Deadline(
                request.getTitle(),
                request.getDescription(),
                request.getDeadlineDate(),
                request.getRoleSpecificity(),
                department
        );

        Deadline savedDeadline = deadlineRepository.save(deadline);
        
        System.out.println("[DeadlineService] ✅ Deadline created: " + savedDeadline.getDeadlineId() 
                + " for department: " + department.getDepartmentName());

        // ✅ ASYNC EMAIL DISPATCH
        dispatchDeadlineEmail(savedDeadline);
        
        return mapToResponse(savedDeadline);
    }

    // ✅ GET DEADLINE BY ID
    @Transactional(readOnly = true)
    public DeadlineResponse getDeadlineById(Long deadlineId) {
        System.out.println("[DeadlineService] 📋 Fetching deadline: " + deadlineId);
        
        Deadline deadline = deadlineRepository.findByDeadlineId(deadlineId)
                .orElseThrow(() -> new RuntimeException("Deadline not found with ID: " + deadlineId));
        
        return mapToResponse(deadline);
    }

    // ✅ GET ALL DEADLINES BY DEPARTMENT AND ROLE
    @Transactional(readOnly = true)
    public List<DeadlineResponse> getDeadlinesByRoleAndDepartment(UserRole role, Long departmentId) {
        System.out.println("[DeadlineService] 📋 Fetching deadlines for role: " + role + " and department: " + departmentId);
        
        List<Deadline> deadlines = deadlineRepository
                .findByRoleSpecificityAndDepartment_DepartmentId(role, departmentId);
        
        System.out.println("[DeadlineService] ✅ Found " + deadlines.size() + " deadlines");
        
        return deadlines.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET ACTIVE DEADLINES BY DEPARTMENT AND ROLE
    @Transactional(readOnly = true)
    public List<DeadlineResponse> getActiveDeadlinesByRoleAndDepartment(UserRole role, Long departmentId) {
        System.out.println("[DeadlineService] 📋 Fetching active deadlines for role: " + role + " and department: " + departmentId);
        
        List<Deadline> deadlines = deadlineRepository
                .findByRoleSpecificityAndIsActiveTrueAndDepartment_DepartmentId(role, departmentId);
        
        System.out.println("[DeadlineService] ✅ Found " + deadlines.size() + " active deadlines");
        
        return deadlines.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET ALL ACTIVE DEADLINES BY DEPARTMENT
    @Transactional(readOnly = true)
    public List<DeadlineResponse> getActiveDeadlinesByDepartment(Long departmentId) {
        System.out.println("[DeadlineService] 📋 Fetching all active deadlines for department: " + departmentId);
        
        List<Deadline> deadlines = deadlineRepository
                .findByIsActiveTrueAndDepartment_DepartmentId(departmentId);
        
        System.out.println("[DeadlineService] ✅ Found " + deadlines.size() + " active deadlines");
        
        return deadlines.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET ALL DEADLINES BY DEPARTMENT
    @Transactional(readOnly = true)
    public List<DeadlineResponse> getAllDeadlinesByDepartment(Long departmentId) {
        System.out.println("[DeadlineService] 📋 Fetching all deadlines for department: " + departmentId);
        
        List<Deadline> deadlines = deadlineRepository
                .findByDepartment_DepartmentId(departmentId);
        
        System.out.println("[DeadlineService] ✅ Found " + deadlines.size() + " deadlines");
        
        return deadlines.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ GET ALL DEADLINES FOR COORDINATOR'S DEPARTMENT
    @Transactional(readOnly = true)
    public List<DeadlineResponse> getCoordinatorDeadlines(String coordinatorEmail) {
        System.out.println("[DeadlineService] 📋 Fetching all deadlines for coordinator: " + coordinatorEmail);
        
        Faculty coordinator = facultyRepository.findByUser_Email(coordinatorEmail)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + coordinatorEmail));

        Department department = coordinator.getDepartment();
        if (department == null) {
            throw new RuntimeException("Coordinator does not have an assigned department");
        }

        List<Deadline> deadlines = deadlineRepository
                .findByDepartment_DepartmentId(department.getDepartmentId());
        
        System.out.println("[DeadlineService] ✅ Found " + deadlines.size() + " deadlines for department: " + department.getDepartmentName());
        
        return deadlines.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    // ✅ UPDATE DEADLINE (Keep department fixed)
    @Transactional
    public DeadlineResponse updateDeadline(Long deadlineId, CreateDeadlineRequest request, String coordinatorEmail) {
        System.out.println("[DeadlineService] ✏️  Updating deadline: " + deadlineId);
        
        Deadline deadline = deadlineRepository.findByDeadlineId(deadlineId)
                .orElseThrow(() -> new RuntimeException("Deadline not found with ID: " + deadlineId));

        Faculty coordinator = facultyRepository.findByUser_Email(coordinatorEmail)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + coordinatorEmail));

        // Verify coordinator owns this deadline (same department)
        if (!deadline.getDepartment().getDepartmentId().equals(coordinator.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Coordinator can only update deadlines from their own department");
        }

        deadline.setTitle(request.getTitle());
        deadline.setDescription(request.getDescription());
        deadline.setDeadlineDate(request.getDeadlineDate());
        deadline.setRoleSpecificity(request.getRoleSpecificity());

        Deadline updatedDeadline = deadlineRepository.save(deadline);
        
        System.out.println("[DeadlineService] ✅ Deadline updated: " + updatedDeadline.getDeadlineId());

        // ✅ ASYNC EMAIL DISPATCH
        dispatchDeadlineEmail(updatedDeadline);
        
        return mapToResponse(updatedDeadline);
    }

    // ✅ TOGGLE DEADLINE ACTIVE STATUS
    @Transactional
    public DeadlineResponse toggleDeadlineStatus(Long deadlineId, String coordinatorEmail) {
        System.out.println("[DeadlineService] 🔄 Toggling status for deadline: " + deadlineId);
        
        Deadline deadline = deadlineRepository.findByDeadlineId(deadlineId)
                .orElseThrow(() -> new RuntimeException("Deadline not found with ID: " + deadlineId));

        Faculty coordinator = facultyRepository.findByUser_Email(coordinatorEmail)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + coordinatorEmail));

        // Verify coordinator owns this deadline
        if (!deadline.getDepartment().getDepartmentId().equals(coordinator.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Coordinator can only toggle deadlines from their own department");
        }

        deadline.setIsActive(!deadline.getIsActive());
        Deadline updatedDeadline = deadlineRepository.save(deadline);
        
        System.out.println("[DeadlineService] ✅ Deadline status toggled to: " + updatedDeadline.getIsActive());
        
        return mapToResponse(updatedDeadline);
    }

    // ✅ DELETE DEADLINE
    @Transactional
    public void deleteDeadline(Long deadlineId, String coordinatorEmail) {
        System.out.println("[DeadlineService] 🗑️  Deleting deadline: " + deadlineId);
        
        Deadline deadline = deadlineRepository.findByDeadlineId(deadlineId)
                .orElseThrow(() -> new RuntimeException("Deadline not found with ID: " + deadlineId));

        Faculty coordinator = facultyRepository.findByUser_Email(coordinatorEmail)
                .orElseThrow(() -> new RuntimeException("Coordinator not found with email: " + coordinatorEmail));

        // Verify coordinator owns this deadline
        if (!deadline.getDepartment().getDepartmentId().equals(coordinator.getDepartment().getDepartmentId())) {
            throw new RuntimeException("Coordinator can only delete deadlines from their own department");
        }

        deadlineRepository.deleteById(deadlineId);
        System.out.println("[DeadlineService] ✅ Deadline deleted: " + deadlineId);
    }

    // ✅ HELPER: MAP TO RESPONSE
    private DeadlineResponse mapToResponse(Deadline deadline) {
        return new DeadlineResponse(
                deadline.getDeadlineId(),
                deadline.getTitle(),
                deadline.getDescription(),
                deadline.getDeadlineDate(),
                deadline.getIsActive(),
                deadline.getRoleSpecificity(),
                deadline.getDepartment().getDepartmentId(),
                deadline.getDepartment().getDepartmentName(),
                deadline.getCreatedAt(),
                deadline.getUpdatedAt()
        );
    }

    // ✅ HELPER: DISPATCH EMAILS BASED ON ROLE
    private void dispatchDeadlineEmail(Deadline deadline) {
        Long deptId = deadline.getDepartment().getDepartmentId();
        
        if (deadline.getRoleSpecificity() == UserRole.STUDENT) {
            List<String> studentEmails = studentRepository.findByDepartment_DepartmentId(deptId)
                    .stream()
                    .filter(s -> s.getUser() != null && s.getUser().getEmail() != null)
                    .map(s -> s.getUser().getEmail())
                    .toList();
            
            emailService.sendDeadlineNotification(
                studentEmails,
                "Student",
                deadline.getTitle(),
                deadline.getDescription(),
                deadline.getDeadlineDate()
            );
        } else if (deadline.getRoleSpecificity() == UserRole.FACULTY) {
            List<String> facultyEmails = facultyRepository.findByDepartment_DepartmentId(deptId)
                    .stream()
                    .filter(f -> f.getUser() != null && f.getUser().getEmail() != null)
                    .map(f -> f.getUser().getEmail())
                    .toList();
            
            emailService.sendDeadlineNotification(
                facultyEmails,
                "Faculty",
                deadline.getTitle(),
                deadline.getDescription(),
                deadline.getDeadlineDate()
            );
        }
    }
}