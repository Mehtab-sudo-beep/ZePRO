package com.zepro.controller;

import org.springframework.web.bind.annotation.*;
import org.springframework.beans.factory.annotation.Autowired;
import com.zepro.dto.HelpCenterResponse;
import com.zepro.model.Admin;
import com.zepro.model.Faculty;
import com.zepro.model.Student;
import com.zepro.model.Users;
import com.zepro.repository.AdminRepository;
import com.zepro.repository.FacultyRepository;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.UserRepository;
import org.springframework.http.ResponseEntity;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/help-center")
public class HelpCenterController {

    @Autowired
    private AdminRepository adminRepository;
    @Autowired
    private FacultyRepository facultyRepository;
    @Autowired
    private StudentRepository studentRepository;
    @Autowired
    private UserRepository userRepository;
    @Autowired
    private com.zepro.repository.InstituteRepository instituteRepository;

    @GetMapping
    public ResponseEntity<HelpCenterResponse> getHelpCenterData(Principal principal) {
        String email = principal.getName();
        Users user = userRepository.findByEmail(email).orElse(null);

        HelpCenterResponse response = new HelpCenterResponse();

        if (user == null) {
            return ResponseEntity.ok(response);
        }

        // Admin details (take the first admin)
        List<Admin> admins = adminRepository.findAll();
        com.zepro.model.Institute institute = instituteRepository.findAll().stream().findFirst().orElse(null);

        if (!admins.isEmpty()) {
            Admin admin = admins.get(0);
            response.setAdminName(admin.getUser().getName());
            
            if (institute != null) {
                response.setAdminEmail(institute.getEmail());
                response.setAdminPhone(institute.getPhoneNumber() != null ? institute.getPhoneNumber() : "N/A");
            } else {
                response.setAdminEmail(admin.getUser().getEmail());
                response.setAdminPhone(admin.getUser().getPhone() != null ? admin.getUser().getPhone() : "N/A");
            }
            
            response.setAdminOffice("Admin Block");
        } else {
             response.setAdminName("Admin");
             if (institute != null) {
                 response.setAdminEmail(institute.getEmail());
                 response.setAdminPhone(institute.getPhoneNumber() != null ? institute.getPhoneNumber() : "N/A");
             } else {
                 response.setAdminEmail("admin@college.edu");
                 response.setAdminPhone("N/A");
             }
             response.setAdminOffice("Admin Block");
        }

        // Find the user's department
        Long departmentId = null;
        if (user.getRole().name().equals("STUDENT")) {
            Student student = studentRepository.findByUser_Email(email).orElse(null);
            if (student != null && student.getDepartment() != null) {
                departmentId = student.getDepartment().getDepartmentId();
            }
        } else if (user.getRole().name().equals("FACULTY")) {
            Faculty faculty = facultyRepository.findByUser_Email(email).orElse(null);
            if (faculty != null && faculty.getDepartment() != null) {
                departmentId = faculty.getDepartment().getDepartmentId();
            }
        }

        if (departmentId != null) {
            // Find coordinator for this department
            List<Faculty> faculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
            Faculty coordinator = faculties.stream().filter(f -> f.getIsFC() != null && f.getIsFC()).findFirst().orElse(null);

            if (coordinator != null) {
                response.setCoordinatorName(coordinator.getUser().getName());
                response.setCoordinatorEmail(coordinator.getUser().getEmail());
                response.setCoordinatorOffice(coordinator.getCabinNo() != null ? coordinator.getCabinNo() : "Coordinator Office");
                response.setCoordinatorPhone(coordinator.getPhone() != null ? coordinator.getPhone() : (coordinator.getUser().getPhone() != null ? coordinator.getUser().getPhone() : "N/A"));
            } else {
                 response.setCoordinatorName("Coordinator Not Assigned");
                 response.setCoordinatorEmail("N/A");
                 response.setCoordinatorOffice("N/A");
                 response.setCoordinatorPhone("N/A");
            }
        } else {
           response.setCoordinatorName("N/A");
           response.setCoordinatorEmail("N/A");
           response.setCoordinatorOffice("N/A");
           response.setCoordinatorPhone("N/A");
        }

        return ResponseEntity.ok(response);
    }
}
