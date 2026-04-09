package com.zepro.service;

import com.zepro.dto.faculty.FacultyProfile;
import com.zepro.model.Faculty;
import com.zepro.repository.FacultyRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.zepro.model.Project;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class FacultyProfileService {

    @Autowired
    private FacultyRepository facultyRepository;

    @Autowired
    private com.zepro.repository.ProjectRepository projectRepository;

    @Autowired
    private com.zepro.repository.StudentRepository studentRepository;

    @Autowired
    private com.zepro.repository.AllocationRulesRepository allocationRulesRepository;

    // ✅ GET PROFILE
    public FacultyProfile getProfile(String email) {

        System.out.println("➡️ Fetching profile for: " + email);

        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> {
                    System.out.println("Faculty NOT FOUND");
                    return new RuntimeException("Faculty not found");
                });

        System.out.println("✅ Faculty found: " + faculty.getUser().getName());

        FacultyProfile dto = new FacultyProfile();

        // ✅ BASIC INFO
        dto.setFacultyId(faculty.getFacultyId());
        System.out.println("📌 Faculty ID: " + faculty.getFacultyId());

        dto.setName(faculty.getUser().getName());
        dto.setEmail(faculty.getUser().getEmail());
        dto.setPhone(faculty.getPhone());
        dto.setDesignation(faculty.getDesignation());
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setSpecialization(faculty.getSpecialization());
        dto.setExperience(faculty.getExperience());
        dto.setQualification(faculty.getQualification());
        dto.setCabinNo(faculty.getCabinNo());

        // ✅ SET INSTITUTE ID ONLY (NOT FULL OBJECT TO AVOID DUPLICATION)
        if (faculty.getInstitute() != null) {
            dto.setInstituteId(faculty.getInstitute().getInstituteId());
            System.out.println("🏢 Institute ID: " + faculty.getInstitute().getInstituteId());
            // ❌ DON'T SET FULL INSTITUTE OBJECT - CAUSES DUPLICATION
            // dto.setInstitute(faculty.getInstitute());  // ← REMOVE THIS
        }

        // ✅ SET DEPARTMENT ID AND NAME ONLY (NOT FULL OBJECT)
        if (faculty.getDepartment() != null) {
            dto.setDepartmentId(faculty.getDepartment().getDepartmentId());
            dto.setDepartment(faculty.getDepartment().getDepartmentName());
            System.out.println("🏛️  Department ID: " + faculty.getDepartment().getDepartmentId());
            System.out.println("🏛️  Department: " + faculty.getDepartment().getDepartmentName());
        } else {
            System.out.println("⚠️  No department assigned to faculty");
        }

        dto.setProblemStatementLink(faculty.getProblemStatementLink());
        dto.setDomains(faculty.getDomains());
        dto.setSubDomains(faculty.getSubDomains());

        // ✅ GET DEPARTMENT-SPECIFIC ALLOCATION RULES
        Long departmentId = (faculty.getDepartment() != null) 
            ? faculty.getDepartment().getDepartmentId() 
            : 1L;

        com.zepro.model.AllocationRules rules = allocationRulesRepository
                .findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println("⚠️  No rules found for department " + departmentId + ", using defaults");
                    com.zepro.model.AllocationRules defaults = new com.zepro.model.AllocationRules();
                    defaults.setMaxStudentsPerFaculty(10);
                    defaults.setMaxTeamSize(4);
                    defaults.setMaxProjectsPerFaculty(3);
                    return defaults;
                });

        System.out.println("📋 Allocation Rules - maxStudentsPerFaculty: " + rules.getMaxStudentsPerFaculty());

        // ✅ COUNT ONLY PROJECTS WITH STATUS "OPEN" OR "ASSIGNED" AND isActive = true
        List<Project> activeProjects = projectRepository.findByFacultyFacultyId(faculty.getFacultyId())
                .stream()
                .filter(project -> ("OPEN".equals(project.getStatus()) || "ASSIGNED".equals(project.getStatus()) || "IN_PROGRESS".equals(project.getStatus()))
                        && project.getIsActive())
                .collect(Collectors.toList());

        int createdSlots = activeProjects.stream()
                .mapToInt(Project::getStudentSlots)
                .sum();

        int allocatedCount = (int) studentRepository.countByAllocatedFaculty(faculty);

        dto.setTotalCreatedSlots(createdSlots);
        dto.setAllocatedStudents(allocatedCount);
        dto.setMaxStudentsPerFaculty(rules.getMaxStudentsPerFaculty());

        System.out.println("📦 Profile DTO prepared:");
        System.out.println("   - Name: " + dto.getName());
        System.out.println("   - Department: " + dto.getDepartment() + " (ID: " + dto.getDepartmentId() + ")");
        System.out.println("   - Institute ID: " + dto.getInstituteId());
        System.out.println("   - Created Slots: " + createdSlots + "/" + rules.getMaxStudentsPerFaculty());
        System.out.println("   - Allocated Students: " + allocatedCount);

        return dto;
    }

    // ✅ UPDATE PROFILE
    public FacultyProfile updateProfile(String email, FacultyProfile dto) {

        System.out.println("➡️ Updating profile for: " + email);

        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> {
                    System.out.println("Faculty NOT FOUND");
                    return new RuntimeException("Faculty not found");
                });

        System.out.println("OLD NAME: " + faculty.getUser().getName());
        System.out.println("NEW NAME: " + dto.getName());

        // update Users
        faculty.getUser().setName(dto.getName());
        faculty.getUser().setEmail(dto.getEmail());

        // update Faculty
        faculty.setPhone(dto.getPhone());
        faculty.setDesignation(dto.getDesignation());
        faculty.setEmployeeId(dto.getEmployeeId());
        faculty.setSpecialization(dto.getSpecialization());
        faculty.setExperience(dto.getExperience());
        faculty.setQualification(dto.getQualification());
        faculty.setCabinNo(dto.getCabinNo());
        // ❌ DON'T SET INSTITUTE OBJECT - CAUSES ISSUES
        // faculty.setInstitute(dto.getInstitute());

        faculty.setProblemStatementLink(dto.getProblemStatementLink());
        faculty.setDomains(dto.getDomains());
        faculty.setSubDomains(dto.getSubDomains());

        facultyRepository.save(faculty);

        System.out.println("✅ Profile updated in DB");

        return getProfile(email);
    }
}