package com.zepro.controller;

import com.zepro.dto.LoginRequest;
import com.zepro.dto.SignupRequest;
import com.zepro.dto.ChangePasswordRequest;
import com.zepro.dto.ForgotPasswordRequest;
import org.springframework.security.core.Authentication;
import com.zepro.service.AuthService;

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
    public String changePassword(
            @RequestBody ChangePasswordRequest request) {
        
        return authService.changePassword(
                request.getEmail(), 
                request.getCurrentPassword(), 
                request.getNewPassword()
        );
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logged out successfully";
    }
}