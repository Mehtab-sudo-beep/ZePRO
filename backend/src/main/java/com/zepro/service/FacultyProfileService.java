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
    public FacultyProfile getProfile(String email, String degree) {

        System.out.println("➡️ Fetching profile for: " + email + ", degree: " + degree);

        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> {
                    System.out.println("Faculty NOT FOUND");
                    return new RuntimeException("Faculty not found");
                });

        System.out.println("✅ Faculty found: " + faculty.getUser().getName());

        FacultyProfile dto = new FacultyProfile();

        // ✅ BASIC INFO
        dto.setFacultyId(faculty.getFacultyId());
        dto.setName(faculty.getUser().getName());
        dto.setEmail(faculty.getUser().getEmail());
        dto.setPhone(faculty.getPhone());
        dto.setDesignation(faculty.getDesignation());
        dto.setEmployeeId(faculty.getEmployeeId());
        dto.setSpecialization(faculty.getSpecialization());
        dto.setExperience(faculty.getExperience());
        dto.setQualification(faculty.getQualification());
        dto.setCabinNo(faculty.getCabinNo());

        if (faculty.getInstitute() != null) {
            dto.setInstituteId(faculty.getInstitute().getInstituteId());
            dto.setInstituteName(faculty.getInstitute().getInstituteName());
        }

        if (faculty.getDepartment() != null) {
            dto.setDepartmentId(faculty.getDepartment().getDepartmentId());
            dto.setDepartment(faculty.getDepartment().getDepartmentName());
        }


        // ✅ GET DEGREE-SPECIFIC ALLOCATION RULES
        Long departmentId = (faculty.getDepartment() != null) 
            ? faculty.getDepartment().getDepartmentId() 
            : null;

        com.zepro.model.AllocationRules rules = null;
        if (departmentId != null) {
            rules = allocationRulesRepository
                .findByDepartment_DepartmentIdAndDegree(departmentId, degree)
                .orElseGet(() -> {
                    System.out.println("⚠️  No rules found for department " + departmentId + " and degree " + degree + ", trying default for dept...");
                    return allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                        .stream().findFirst().orElse(null);
                });
        }

        if (rules == null) {
            System.out.println("⚠️  Using system defaults for rules");
            rules = new com.zepro.model.AllocationRules();
            rules.setMaxStudentsPerFaculty(10);
            rules.setMaxTeamSize(4);
            rules.setMaxProjectsPerFaculty(3);
        }

        System.out.println("📋 Allocation Rules (" + degree + ") - maxStudentsPerFaculty: " + rules.getMaxStudentsPerFaculty());

        // ✅ COUNT ONLY PROJECTS FOR THIS DEGREE WITH STATUS "OPEN" OR "ASSIGNED" OR "IN_PROGRESS" AND isActive = true
        List<Project> activeProjects = projectRepository.findByFacultyFacultyId(faculty.getFacultyId())
                .stream()
                .filter(project -> 
                    (degree.equals(project.getDegree())) &&
                    ("OPEN".equals(project.getStatus()) || "ASSIGNED".equals(project.getStatus()) || "IN_PROGRESS".equals(project.getStatus()))
                    && project.getIsActive())
                .collect(Collectors.toList());

        int createdSlots = activeProjects.stream()
                .mapToInt(Project::getStudentSlots)
                .sum();

        // ✅ DEGREE-SPECIFIC ALLOCATED STUDENT COUNT
        int allocatedCount = (int) studentRepository.countByAllocatedFacultyAndDegree(faculty, degree);

        dto.setTotalCreatedSlots(createdSlots);
        dto.setAllocatedStudents(allocatedCount);
        dto.setMaxStudentsPerFaculty(rules.getMaxStudentsPerFaculty());
        dto.setIsUGCoordinator(faculty.getIsUGCoordinator() != null && faculty.getIsUGCoordinator());
        dto.setIsPGCoordinator(faculty.getIsPGCoordinator() != null && faculty.getIsPGCoordinator());

        System.out.println("📦 Profile DTO (" + degree + ") prepared. Slots: " + createdSlots + "/" + rules.getMaxStudentsPerFaculty());

        return dto;
    }

    // ✅ UPDATE PROFILE
    public FacultyProfile updateProfile(String email, FacultyProfile dto, String degree) {

        System.out.println("➡️ Updating profile for: " + email + ", degree: " + degree);

        Faculty faculty = facultyRepository.findByUser_Email(email)
                .orElseThrow(() -> {
                    System.out.println("Faculty NOT FOUND");
                    return new RuntimeException("Faculty not found");
                });

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

        facultyRepository.save(faculty);

        System.out.println("✅ Profile updated in DB");

        return getProfile(email, degree);
    }
}