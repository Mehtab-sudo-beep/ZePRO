package com.zepro.service;

import com.zepro.dto.StudentProfile;
import com.zepro.model.Student;
import com.zepro.repository.StudentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class StudentProfileService {

    @Autowired
    private StudentRepository studentRepository;

    @Autowired
    private FileUploadService fileUploadService;

    // ✅ GET PROFILE
    public StudentProfile getProfile(String email) {

        Student student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        StudentProfile dto = new StudentProfile();

        dto.setName(student.getUser().getName());
        dto.setEmail(student.getUser().getEmail());

        dto.setIsInTeam(student.isInTeam());
        dto.setIsTeamLead(student.isTeamLead());

        if (student.getDepartment() != null) {
            dto.setDepartment(student.getDepartment().getDepartmentName());
        }

        if (student.getInstitute() != null) {
            dto.setInstitute(student.getInstitute().getInstituteName());
        }

        if (student.getTeam() != null) {
            dto.setTeamName(student.getTeam().getTeamName());
        }

        dto.setResumeLink(student.getResumeLink());
        dto.setMarksheetLink(student.getMarksheetLink());
        dto.setIsAllocated(student.isAllocated());

        return dto;
    }

    // ✅ UPDATE PROFILE
    public StudentProfile updateProfile(String email, com.zepro.dto.student.UpdateStudentProfileRequest dto) {

        Student student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // update user fields
        if (dto.getName() != null && !dto.getName().isEmpty()) {
            student.getUser().setName(dto.getName());
        }
        if (dto.getEmail() != null && !dto.getEmail().isEmpty()) {
            student.getUser().setEmail(dto.getEmail());
        }

        try {
            if (dto.getResumeFile() != null && !dto.getResumeFile().isEmpty()) {
                String resumePath = fileUploadService.saveFile("resumes", dto.getResumeFile());
                student.setResumeLink(resumePath);
            }

            if (dto.getMarksheetFile() != null && !dto.getMarksheetFile().isEmpty()) {
                String marksheetPath = fileUploadService.saveFile("marksheets", dto.getMarksheetFile());
                student.setMarksheetLink(marksheetPath);
            }
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload updated files: " + e.getMessage());
        }

        studentRepository.save(student);

        return getProfile(email); // 🔥 return updated
    }
}