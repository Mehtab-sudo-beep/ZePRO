package com.zepro.controller;

import com.zepro.dto.LoginRequest;
import com.zepro.dto.SignupRequest;
// import com.zepro.dto.OAuthSignupRequest;
import com.zepro.dto.ChangePasswordRequest;
import com.zepro.dto.ForgotPasswordRequest;
import org.springframework.security.core.Authentication;
import com.zepro.service.AuthService;

import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

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

    @PostMapping("/google")
    public Object googleLogin(@RequestBody com.zepro.dto.GoogleLoginRequest request) {
        return authService.googleLogin(request);
    }

    @PostMapping("/login")
    public Object login(@RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password")
    public String forgotPassword(@RequestBody ForgotPasswordRequest request, HttpServletRequest httpRequest) {
        String baseUrl = "http://" + httpRequest.getServerName() + ":" + httpRequest.getServerPort();
        return authService.forgotPassword(request.getEmail(), baseUrl);
    }

    @GetMapping("/reset-password-action")
    public String resetPasswordAction(
            @RequestParam String email,
            @RequestParam String token) {
        return authService.resetPasswordAction(email, token);
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
    
    // Notification Request DTO logic encapsulated here
    public static class NotificationRequest {
        private String email;
        private boolean emailNotifications;
        private boolean pushNotifications;
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public boolean isEmailNotifications() { return emailNotifications; }
        public void setEmailNotifications(boolean emailNotifications) { this.emailNotifications = emailNotifications; }
        public boolean isPushNotifications() { return pushNotifications; }
        public void setPushNotifications(boolean pushNotifications) { this.pushNotifications = pushNotifications; }
    }

    @PutMapping("/notifications")
    public String updateNotifications(@RequestBody NotificationRequest request) {
        return authService.updateNotificationPreferences(
                request.getEmail(),
                request.isEmailNotifications(),
                request.isPushNotifications()
        );
    }

    @PostMapping(value = "/profile-picture", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public String uploadProfilePicture(
            @org.springframework.web.bind.annotation.RequestParam("email") String email,
            @org.springframework.web.bind.annotation.RequestParam("file") org.springframework.web.multipart.MultipartFile file) {
        return authService.updateProfilePicture(email, file);
    }

    @PostMapping("/logout")
    public String logout() {
        return "Logged out successfully";
    }
}