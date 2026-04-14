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

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       StudentRepository studentRepository,
                       FacultyRepository facultyRepository,
                       AdminRepository adminRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil){

        this.userRepository = userRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.adminRepository = adminRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    // ✅ Google Login Endpoint
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        if (request.getAccessToken() == null || request.getAccessToken().isEmpty()) {
            throw new RuntimeException("Access Token is required");
        }

        try {
            String url = "https://www.googleapis.com/oauth2/v2/userinfo";

            HttpHeaders headers = new HttpHeaders();
            headers.setBearerAuth(request.getAccessToken());

            HttpEntity<String> entity = new HttpEntity<>(headers);

            RestTemplate restTemplate = new RestTemplate();
            ResponseEntity<Map> response = restTemplate.exchange(
                    url,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map body = response.getBody();

            String email = (String) body.get("email");
            String name = (String) body.get("name");
            String googleId = (String) body.get("id");
            String pictureUrl = (String) body.get("picture");
            Boolean emailVerified = (Boolean) body.get("verified_email");

            if (emailVerified == null || !emailVerified) {
                throw new RuntimeException("Google email not verified.");
            }

            java.util.Optional<Users> userOptional = userRepository.findByEmail(email);
            Users user;
            if (userOptional.isEmpty()) {
                // User doesn't exist, create account
                user = new Users();
                user.setName(name != null ? name : "Unknown Google User");
                user.setEmail(email);
                user.setRole(request.getRole() != null ? UserRole.valueOf(request.getRole()) : UserRole.STUDENT);
                user.setOauthProvider("google");
                user.setOauthId(googleId);
                user.setProfilePictureUrl(pictureUrl);
                user.setOAuthUser(true);

                user.setPassword(passwordEncoder.encode("oauth-google-" + googleId));

                user = userRepository.save(user);
                createUserRoleProfile(user);
            } else {
                user = userOptional.get();
                if (user.isOAuthUser() && user.getOauthProvider() != null) {
                    if (!user.getOauthProvider().equals("google")) {
                        throw new RuntimeException("This email was registered with " + user.getOauthProvider() + " OAuth. Please use that to login.");
                    }
                }
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
                    isFC
            );
        } catch (Exception e) {
            throw new RuntimeException("Google authentication failed: " + e.getMessage(), e);
        }
    }

    // ✅ NEW: Helper method to create role profile
    private void createUserRoleProfile(Users user){
        switch(user.getRole()){
            case STUDENT:
                Student student = new Student();
                student.setUser(user);
                student.setInTeam(false);
                student.setTeamLead(false);
                studentRepository.save(student);
                break;

            case FACULTY:
                Faculty faculty = new Faculty();
                faculty.setUser(user);
                facultyRepository.save(faculty);
                break;

            case ADMIN:
                Admin admin = new Admin();
                admin.setUser(user);
                adminRepository.save(admin);
                break;
        }
    }

    // ------------------------------------------------
    // SIGNUP
    // ------------------------------------------------

    public String signup(SignupRequest request){
        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        Users savedUser = userRepository.save(user);
        createUserRoleProfile(savedUser);
        return "User created successfully";
    }
    
    public LoginResponse login(LoginRequest request){
        String email = request.getEmail().trim();
        Users user = userRepository
                .findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getEmail(), user.getRole().name());
        Long studentId = null;
        Long facultyId = null;
        boolean isInTeam = false;
        boolean isTeamLead = false;
        if(user.getRole() == UserRole.STUDENT){
            Student student = studentRepository
                    .findByUser(user)
                    .orElseThrow(() -> new RuntimeException("Student profile not found"));
            studentId = student.getStudentId();
            isInTeam = student.isInTeam();
            isTeamLead = student.isTeamLead();
        }
        boolean isFC = false;
        if(user.getRole() == UserRole.FACULTY){
            Faculty faculty = facultyRepository
                    .findByUser_Email(user.getEmail())
                    .orElseThrow(() -> new RuntimeException("Faculty profile not found"));
            facultyId = faculty.getFacultyId();
            isFC = (faculty.getIsFC() != null && faculty.getIsFC());
        }   
        if(user.getRole() == UserRole.ADMIN){
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
                isFC
        );
    }

    // ------------------------------------------------
    // FORGOT PASSWORD
    // ------------------------------------------------

    public String forgotPassword(ForgotPasswordRequest request){
        Users user = userRepository
                .findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        return "Password reset link sent";
    }

    public void resetPassword(String token,String newPassword){
        // implement reset logic later
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
        if (newName != null && !newName.trim().isEmpty()) user.setName(newName);
        if (newPhone != null && !newPhone.trim().isEmpty()) user.setPhone(newPhone);
        userRepository.save(user);
        return "Profile updated successfully";
    }

    public String deleteAccount(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return "Account deleted successfully";
    }
}