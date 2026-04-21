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
import org.springframework.http.ResponseEntity;

@RestController
@RequestMapping("/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/tails")
    public java.util.List<String> getAllowedTails() {
        return authService.getAllowedTails();
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
    public String forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return authService.forgotPasswordOtp(request.getEmail());
    }

    public static class VerifyOtpRequest {
        private String email;
        private String otp;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }
    }

    @PostMapping("/verify-otp")
    public java.util.Map<String, Boolean> verifyOtp(@RequestBody VerifyOtpRequest request) {
        boolean isValid = authService.verifyOtp(request.getEmail(), request.getOtp());
        return java.util.Collections.singletonMap("valid", isValid);
    }

    public static class ResetPasswordOtpRequest {
        private String email;
        private String otp;
        private String newPassword;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public String getOtp() {
            return otp;
        }

        public void setOtp(String otp) {
            this.otp = otp;
        }

        public String getNewPassword() {
            return newPassword;
        }

        public void setNewPassword(String newPassword) {
            this.newPassword = newPassword;
        }
    }

    @PostMapping("/reset-password-otp")
    public java.util.Map<String, String> resetPasswordOtp(@RequestBody ResetPasswordOtpRequest request) {
        String msg = authService.resetPasswordOtp(request.getEmail(), request.getOtp(), request.getNewPassword());
        return java.util.Collections.singletonMap("message", msg);
    }

    @PostMapping("/change-password")
    public String changePassword(
            @RequestBody ChangePasswordRequest request) {

        return authService.changePassword(
                request.getEmail(),
                request.getCurrentPassword(),
                request.getNewPassword());
    }

    // Notification Request DTO logic encapsulated here
    public static class NotificationRequest {
        private String email;
        private boolean emailNotifications;
        private boolean pushNotifications;

        public String getEmail() {
            return email;
        }

        public void setEmail(String email) {
            this.email = email;
        }

        public boolean isEmailNotifications() {
            return emailNotifications;
        }

        public void setEmailNotifications(boolean emailNotifications) {
            this.emailNotifications = emailNotifications;
        }

        public boolean isPushNotifications() {
            return pushNotifications;
        }

        public void setPushNotifications(boolean pushNotifications) {
            this.pushNotifications = pushNotifications;
        }
    }

    @PutMapping("/notifications")
    public String updateNotifications(@RequestBody NotificationRequest request) {
        return authService.updateNotificationPreferences(
                request.getEmail(),
                request.isEmailNotifications(),
                request.isPushNotifications());
    }

    public static class PushTokenRequest {
        private String token;

        public String getToken() {
            return token;
        }

        public void setToken(String token) {
            this.token = token;
        }
    }

    @PostMapping("/push-token")
    public ResponseEntity<?> updatePushToken(Authentication authentication, @RequestBody PushTokenRequest request) {
        if (authentication == null)
            return ResponseEntity.status(401).body("Unauthorized");
        String email = authentication.getName();
        authService.updatePushToken(email, request.getToken());
        return ResponseEntity.ok().build();
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

    public static class UpdateProfileRequest {
        private String name;
        private String email;
        private String phone;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPhone() { return phone; }
        public void setPhone(String phone) { this.phone = phone; }
    }

    @PutMapping("/update-profile")
    public ResponseEntity<?> updateProfile(@RequestBody UpdateProfileRequest request, Authentication authentication) {
        String emailToUpdate = request.getEmail();
        if ((emailToUpdate == null || emailToUpdate.isEmpty()) && authentication != null) {
            emailToUpdate = authentication.getName();
        }
        if (emailToUpdate == null) {
            return ResponseEntity.status(401).body(java.util.Collections.singletonMap("message", "Unauthorized"));
        }
        String msg = authService.updateProfile(emailToUpdate, request.getName(), request.getPhone());
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", msg));
    }

    @DeleteMapping("/delete-account")
    public ResponseEntity<?> deleteAccount(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(java.util.Collections.singletonMap("message", "Unauthorized"));
        }
        String email = authentication.getName();
        String msg = authService.deleteAccount(email);
        return ResponseEntity.ok(java.util.Collections.singletonMap("message", msg));
    }
}