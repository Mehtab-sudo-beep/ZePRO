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

        if (student.getTeam() != null) {
            dto.setTeamName(student.getTeam().getTeamName());
        }

        dto.setResumeLink(student.getResumeLink());
        dto.setMarksheetLink(student.getMarksheetLink());

        return dto;
    }

    // ✅ UPDATE PROFILE
    public StudentProfile updateProfile(String email, StudentProfile dto) {

        Student student = studentRepository.findByUser_Email(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        // update user fields
        student.getUser().setName(dto.getName());
        student.getUser().setEmail(dto.getEmail());

        student.setResumeLink(dto.getResumeLink());
        student.setMarksheetLink(dto.getMarksheetLink());

        studentRepository.save(student);

        return getProfile(email); // 🔥 return updated
    }
}