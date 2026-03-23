package com.zepro.controller;

import com.zepro.dto.LoginRequest;
import com.zepro.dto.SignupRequest;
import com.zepro.dto.ForgotPasswordRequest;
import com.zepro.dto.ChangePasswordRequest;
import com.zepro.dto.UpdateProfileRequest;
import com.zepro.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/signup")
    public Object signup(@RequestBody SignupRequest request) {
        System.out.println("controlled");
        return authService.signup(request);
    }

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPassword(request);
    }

    @PostMapping("/reset-password")
    public String resetPassword(
            @RequestParam String token,
            @RequestParam String newPassword) {
        authService.resetPassword(token, newPassword);
        return "Password updated";
    }

    @PostMapping("/change-password")
    public ResponseEntity<String> changePassword(
            @RequestBody ChangePasswordRequest request,
            @RequestHeader("Authorization") String authHeader) {
        authService.changePassword(request, authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok("Password changed successfully");
    }

    @PostMapping("/update-profile")
    public ResponseEntity<String> updateProfile(
            @RequestBody UpdateProfileRequest request,
            @RequestHeader("Authorization") String authHeader) {
        authService.updateProfile(request, authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok("Profile updated successfully");
    }

    @PostMapping("/update-name")
    public ResponseEntity<String> updateName(
            @RequestBody UpdateProfileRequest request,
            @RequestHeader("Authorization") String authHeader) {
        authService.updateName(request.getName(), authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok("Name updated successfully");
    }

    @PostMapping("/update-email")
    public ResponseEntity<String> updateEmail(
            @RequestBody UpdateProfileRequest request,
            @RequestHeader("Authorization") String authHeader) {
        authService.updateEmail(request.getEmail(), authHeader.replace("Bearer ", ""));
        return ResponseEntity.ok("Email updated successfully");
    }
}