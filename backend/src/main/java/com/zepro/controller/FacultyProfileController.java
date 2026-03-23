package com.zepro.controller;

import com.zepro.dto.faculty.FacultyProfile;
import com.zepro.service.FacultyProfileService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("faculty/profile")
@CrossOrigin
public class FacultyProfileController {

    @Autowired
    private FacultyProfileService service;

    // ✅ GET PROFILE (FROM TOKEN)
    @GetMapping
public ResponseEntity<FacultyProfile> getProfile(Authentication auth) {

    String email = auth.getName();
    System.out.println("🔥 [GET PROFILE] Email: " + email);

    FacultyProfile profile = service.getProfile(email);

    System.out.println("✅ [GET PROFILE SUCCESS] Name: " + profile.getName());

    return ResponseEntity.ok(profile);
}

    // ✅ UPDATE PROFILE (FROM TOKEN)
    @PutMapping
public ResponseEntity<FacultyProfile> updateProfile(
        Authentication auth,
        @RequestBody FacultyProfile dto) {

    String email = auth.getName();

    System.out.println("🔥 [UPDATE PROFILE] Email: " + email);
    System.out.println("Incoming Data: " + dto);

    FacultyProfile updated = service.updateProfile(email, dto);

    System.out.println("✅ [PROFILE UPDATED] Name: " + updated.getName());

    return ResponseEntity.ok(updated);
}
}