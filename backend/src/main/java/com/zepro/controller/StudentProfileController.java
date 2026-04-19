package com.zepro.controller;

import com.zepro.dto.StudentProfile;
import com.zepro.service.StudentProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("student/profile")
@CrossOrigin
public class StudentProfileController {

    @Autowired
    private StudentProfileService service;

    // ✅ GET
    @GetMapping
    public ResponseEntity<StudentProfile> getProfile(Authentication auth) {
        String email = auth.getName();
        return ResponseEntity.ok(service.getProfile(email));
    }

    // ✅ UPDATE
    @PutMapping(consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<StudentProfile> updateProfile(
            Authentication auth,
            @ModelAttribute com.zepro.dto.student.UpdateStudentProfileRequest dto) {

        String email = auth.getName();
        return ResponseEntity.ok(service.updateProfile(email, dto));
    }
}