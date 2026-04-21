package com.zepro.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;

import com.zepro.dto.ForgotPasswordRequest;
import com.zepro.dto.LoginRequest;
import com.zepro.dto.LoginResponse;
import com.zepro.dto.SignupRequest;
import com.zepro.dto.GoogleLoginRequest;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;
import java.util.Map;
import com.zepro.model.Admin;
import com.zepro.model.Faculty;
import com.zepro.model.Student;
import com.zepro.model.Users;
import com.zepro.model.UserRole;
import com.zepro.repository.AdminRepository;
import com.zepro.repository.FacultyRepository;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.UserRepository;
import com.zepro.security.JwtUtil;
import com.zepro.service.EmailService;
import com.zepro.service.FileUploadService;
import com.zepro.repository.DepartmentRepository;
import com.zepro.repository.InstituteRepository;
import com.zepro.model.Department;
import com.zepro.model.Institute;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EmailService emailService;
    private final FileUploadService fileUploadService;
    private final DepartmentRepository departmentRepository;
    private final InstituteRepository instituteRepository;

    public AuthService(UserRepository userRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            AdminRepository adminRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil,
            EmailService emailService,
            FileUploadService fileUploadService,
            DepartmentRepository departmentRepository,
            InstituteRepository instituteRepository) {

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.emailService = emailService;
        this.fileUploadService = fileUploadService;
        this.departmentRepository = departmentRepository;
        this.instituteRepository = instituteRepository;
    }

    // ✅ Google Login Endpoint
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isEmpty()) {
            throw new RuntimeException("ID Token is required");
        }

        try {
            String url = "https://oauth2.googleapis.com/tokeninfo?id_token=" + request.getIdToken();

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.getForEntity(url, Map.class);
            Map body = response.getBody();

            if (body == null) {
                throw new RuntimeException("Invalid token response from Google");
            }

            String email = (String) body.get("email");
            String name = (String) body.get("name");
            String googleId = (String) body.get("sub");
            String pictureUrl = (String) body.get("picture");

            Object emailVerifiedObj = body.get("email_verified");
            boolean emailVerified = false;
            if (emailVerifiedObj instanceof Boolean) {
                emailVerified = (Boolean) emailVerifiedObj;
            } else if (emailVerifiedObj instanceof String) {
                emailVerified = Boolean.parseBoolean((String) emailVerifiedObj);
            }

            if (!emailVerified) {
                throw new RuntimeException("Google email not verified.");
            }

            java.util.Optional<Users> userOptional = userRepository.findByEmail(email);
            Users user;
            if (userOptional.isEmpty()) {
                // User doesn't exist, create account
                user = new Users();
                user.setName(name != null ? name : "Unknown Google User");
                user.setEmail(email);
                user.setRole(UserRole.STUDENT); // Force STUDENT role for new Google signups
                user.setOauthProvider("google");
                user.setOauthId(googleId);
                user.setProfilePictureUrl(pictureUrl);
                user.setOAuthUser(true);

                String usernamePrefix = email.indexOf("@") > 0 ? email.substring(0, email.indexOf("@")) : email;
                user.setPassword(passwordEncoder.encode(usernamePrefix));

                user = userRepository.save(user);
                createUserRoleProfile(user, null, null, usernamePrefix); // raw password for Google login
            } else {
                user = userOptional.get();
                if (user.isOAuthUser() && user.getOauthProvider() != null) {
                    if (!user.getOauthProvider().equals("google")) {
                        throw new RuntimeException("This email was registered with " + user.getOauthProvider()
                                + " OAuth. Please use that to login.");
                    }
                }

                if ((user.getProfilePictureUrl() == null || user.getProfilePictureUrl().trim().isEmpty())
                        && pictureUrl != null) {
                    user.setProfilePictureUrl(pictureUrl);
                }
                if (googleId != null)
                    user.setOauthId(googleId);
                user.setOAuthUser(true);
                user = userRepository.save(user);
            }

            // Generate JWT Token
            String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());

            Long studentId = null;
            Long facultyId = null;
            boolean isInTeam = false;
            boolean isTeamLead = false;
            boolean isFC = false;

            if (user.getRole() == UserRole.STUDENT) {
                Student student = studentRepository
                        .findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Student profile not found"));

                studentId = student.getStudentId();
                isInTeam = student.isInTeam();
                isTeamLead = student.isTeamLead();
            }

            if (user.getRole() == UserRole.FACULTY) {
                Faculty faculty = facultyRepository
                        .findByUser_Email(user.getEmail())
                        .orElseThrow(() -> new RuntimeException("Faculty profile not found"));

                facultyId = faculty.getFacultyId();
                isFC = (faculty.getIsFC() != null && faculty.getIsFC());
            }

            if (user.getRole() == UserRole.ADMIN) {
                adminRepository
                        .findByUser(user)
                        .orElseThrow(() -> new RuntimeException("Admin profile not found"));
            }

            return new LoginResponse(
                    token,
                    user.getRole().name(),
                    facultyId,
                    studentId,
                    isInTeam,
                    isTeamLead,
                    user.getEmail(),
                    user.getName(),
                    user.getPhone(),
                    isFC,
                    user.isEmailNotifications(),
                    user.isPushNotifications(),
                    user.getProfilePictureUrl());
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    // ✅ NEW: Helper method to create role profile
    private void createUserRoleProfile(Users user, Long departmentId, Long instituteId, String rawPassword) {
        Department dept = (departmentId != null) ? departmentRepository.findById(departmentId).orElse(null) : null;
        Institute inst = (instituteId != null) ? instituteRepository.findById(instituteId).orElse(null) : null;

        switch (user.getRole()) {
            case STUDENT:
                Student student = new Student();
                student.setUser(user);
                student.setInTeam(false);
                student.setTeamLead(false);
                student.setDepartment(dept);
                student.setInstitute(inst);
                student.setRollNumber(rawPassword); 
                studentRepository.save(student);
                break;

            case FACULTY:
                Faculty faculty = new Faculty();
                faculty.setUser(user);
                faculty.setDepartment(dept);
                faculty.setInstitute(inst);
                faculty.setEmployeeId(rawPassword); 
                facultyRepository.save(faculty);
                break;

            case ADMIN:
                Admin admin = new Admin();
                admin.setUser(user);
                adminRepository.save(admin);
                break;
        }
    }

    public java.util.List<String> getAllowedTails() {
        return instituteRepository.findAll().stream()
                .map(com.zepro.model.Institute::getTail)
                .filter(java.util.Objects::nonNull)
                .map(String::toLowerCase)
                .map(t -> t.startsWith("@") ? t.substring(1) : t)
                .distinct()
                .toList();
    }

    // ------------------------------------------------
    // SIGNUP
    // ------------------------------------------------

    public String signup(SignupRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered. Please login.");
        }

        String email = request.getEmail().toLowerCase();
        if (!email.contains("@")) {
            throw new RuntimeException("Invalid email format.");
        }

        String domain = email.substring(email.indexOf("@") + 1);
        java.util.List<String> allowedTails = getAllowedTails();

        boolean isAllowed = allowedTails.stream().anyMatch(tail -> domain.equals(tail) || domain.endsWith("." + tail));

        if (!isAllowed) {
            throw new RuntimeException("Registration is only allowed for verified institute domains.");
        }

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        Users savedUser = userRepository.save(user);
        createUserRoleProfile(savedUser, request.getDepartmentId(), request.getInstituteId(), request.getPassword());
        return "User created successfully";
    }

    public LoginResponse login(LoginRequest request) {
        String email = request.getEmail().trim();
        Users user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        Long studentId = null;
        Long facultyId = null;
        boolean isInTeam = false;
        boolean isTeamLead = false;
        if (user.getRole() == UserRole.STUDENT) {
            Student student = studentRepository
                    .findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            studentId = student.getStudentId();
            isInTeam = student.isInTeam();
            isTeamLead = student.isTeamLead();
        }
        boolean isFC = false;
        if (user.getRole() == UserRole.FACULTY) {
            Faculty faculty = facultyRepository
                    .findByUser_Email(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("Faculty profile not found"));
            facultyId = faculty.getFacultyId();
            isFC = (faculty.getIsFC() != null && faculty.getIsFC());
        }
        if (user.getRole() == UserRole.ADMIN) {
            adminRepository
                    .findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Admin profile not found"));
        }
        return new LoginResponse(
                token,
                user.getRole().name(),
                facultyId,
                studentId,
                isInTeam,
                isTeamLead,
                user.getEmail(),
                user.getName(),
                user.getPhone(),
                isFC,
                user.isEmailNotifications(),
                user.isPushNotifications(),
                user.getProfilePictureUrl());
    }

    // ------------------------------------------------
    // FORGOT PASSWORD
    // ------------------------------------------------

    public String forgotPasswordOtp(String email) {
        Users user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Generate 6-digit OTP
        String otp = String.format("%06d", new java.util.Random().nextInt(999999));
        
        user.setResetOtp(otp);
        user.setResetOtpExpiry(java.time.LocalDateTime.now().plusMinutes(10));
        userRepository.save(user);

        emailService.sendOtpEmail(user.getEmail(), user.getName(), otp);

        return "OTP sent successfully to your email";
    }

    public boolean verifyOtp(String email, String otp) {
        Users user = userRepository.findByEmail(email).orElse(null);
        if (user == null) return false;
        if (user.getResetOtp() == null || !user.getResetOtp().equals(otp)) return false;
        if (user.getResetOtpExpiry() == null || user.getResetOtpExpiry().isBefore(java.time.LocalDateTime.now())) {
            return false;
        }
        return true;
    }

    public String resetPasswordOtp(String email, String otp, String newPassword) {
        if (!verifyOtp(email, otp)) {
            throw new RuntimeException("Invalid or expired OTP");
        }
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setResetOtp(null);
        user.setResetOtpExpiry(null);
        userRepository.save(user);

        return "Password reset successfully";
    }



    public String changePassword(String email, String currentPassword, String newPassword) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(currentPassword, user.getPassword())) {
            throw new RuntimeException("Incorrect current password");
        }
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        return "Password changed successfully";
    }

    public String updateProfile(String currentEmail, String newName, String newPhone) {
        Users user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (newName != null && !newName.trim().isEmpty())
            user.setName(newName);
        if (newPhone != null && !newPhone.trim().isEmpty())
            user.setPhone(newPhone);
        userRepository.save(user);
        return "Profile updated successfully";
    }

    public String updateNotificationPreferences(String email, boolean emailNotifications, boolean pushNotifications) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setEmailNotifications(emailNotifications);
        user.setPushNotifications(pushNotifications);
        userRepository.save(user);
        return "Notification preferences updated";
    }

    public void updatePushToken(String email, String pushToken) {
        Users user = userRepository.findByEmail(email).orElse(null);
        if (user != null) {
            user.setExpoPushToken(pushToken);
            userRepository.save(user);
        }
    }

    public String updateProfilePicture(String email, org.springframework.web.multipart.MultipartFile file) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        try {
            String path = fileUploadService.saveFile("profile_pictures", file);
            user.setProfilePictureUrl(path);
            userRepository.save(user);
            return path;
        } catch (java.io.IOException e) {
            throw new RuntimeException("Failed to upload profile picture: " + e.getMessage());
        }
    }

    public String deleteAccount(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return "Account deleted successfully";
    }
}