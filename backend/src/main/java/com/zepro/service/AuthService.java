package com.zepro.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zepro.dto.ForgotPasswordRequest;
import com.zepro.dto.LoginRequest;
import com.zepro.dto.LoginResponse;
import com.zepro.dto.SignupRequest;
import com.zepro.dto.SignupRequest;
import com.zepro.dto.GoogleLoginRequest;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import org.springframework.beans.factory.annotation.Value;
import java.util.Collections;
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

    @Value("${spring.security.oauth2.client.registration.google.client-id:}")
    private String googleClientId;

    // ✅ NEW: Google Login Endpoint
    public LoginResponse googleLogin(GoogleLoginRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isEmpty()) {
            throw new RuntimeException("ID Token is required");
        }

        try {
            GoogleIdToken idToken;
            if (googleClientId != null && !googleClientId.isEmpty() && !googleClientId.equals("YOUR_GOOGLE_CLIENT_ID")) {
                GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), GsonFactory.getDefaultInstance())
                        .setAudience(Collections.singletonList(googleClientId))
                        .build();
                idToken = verifier.verify(request.getIdToken());
                if (idToken == null) {
                    throw new RuntimeException("Invalid Google ID token.");
                }
            } else {
                // Fallback for development if client ID is not configured
                idToken = GoogleIdToken.parse(GsonFactory.getDefaultInstance(), request.getIdToken());
                System.out.println("WARNING: Skipping strict Google token verification because client ID is not configured.");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            boolean emailVerified = Boolean.TRUE.equals(payload.getEmailVerified());
            String name = (String) payload.get("name");
            String pictureUrl = (String) payload.get("picture");

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
                user.setRole(request.getRole() != null ? request.getRole() : UserRole.STUDENT);
                user.setOauthProvider("google");
                user.setOauthId(payload.getSubject());
                user.setProfilePictureUrl(pictureUrl);
                user.setOAuthUser(true);

                user.setPassword(passwordEncoder.encode("oauth-google-" + payload.getSubject()));

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
            throw new RuntimeException("Google token verification failed: " + e.getMessage(), e);
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

        // Later you can implement email sending here

        return "Password reset link sent";
    }

    // ------------------------------------------------
    // RESET PASSWORD
    // ------------------------------------------------

    public void resetPassword(String token,String newPassword){
        // implement reset logic later
    }

    // ------------------------------------------------
    // CHANGE PASSWORD
    // ------------------------------------------------

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

    // ------------------------------------------------
    // UPDATE PROFILE
    // ------------------------------------------------
    public String updateProfile(String currentEmail, String newName, String newPhone) {
        Users user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (newName != null && !newName.trim().isEmpty()) user.setName(newName);
        if (newPhone != null && !newPhone.trim().isEmpty()) user.setPhone(newPhone);
        userRepository.save(user);
        return "Profile updated successfully";
    }

    // ------------------------------------------------
    // DELETE ACCOUNT
    // ------------------------------------------------
    public String deleteAccount(String email) {
        Users user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        userRepository.delete(user);
        return "Account deleted successfully";
    }
}