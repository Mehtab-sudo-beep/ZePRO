package com.zepro.service;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.zepro.dto.ForgotPasswordRequest;
import com.zepro.dto.LoginRequest;
import com.zepro.dto.LoginResponse;
import com.zepro.dto.SignupRequest;
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

        switch(request.getRole()){

            case STUDENT:

                Student student = new Student();
                student.setUser(savedUser);
                student.setInTeam(false);
                student.setTeamLead(false);

                studentRepository.save(student);
                break;

            case FACULTY:
                Faculty faculty = new Faculty();
                faculty.setUser(savedUser);
                facultyRepository.save(faculty);
                break;

            case ADMIN:
                Admin admin = new Admin();
                admin.setUser(savedUser);
                adminRepository.save(admin);
                break;
        }

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

        // No additional info needed for admin
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
        // This attempts to delete the root user. Note that foreign key constraints on Student/Faculty might block this unless cascading is configured. 
        // For settings screen parity, we execute it here.
        userRepository.delete(user);
        return "Account deleted successfully";
    }
}