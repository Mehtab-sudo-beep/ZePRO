package com.zepro.service;

import com.zepro.dto.*;
import com.zepro.model.Users;
import com.zepro.model.Student;
import com.zepro.model.Faculty;
import com.zepro.model.Admin;
import com.zepro.repository.UserRepository;
import com.zepro.security.JwtUtil;
import com.zepro.repository.StudentRepository;
import com.zepro.repository.FacultyRepository;
import com.zepro.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

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

    Users user = userRepository
            .findByEmail(request.getEmail())
            .orElseThrow(() -> new RuntimeException("User not found"));

    // DEBUG LINES
    System.out.println("Input password: " + request.getPassword());
    System.out.println("DB password: " + user.getPassword());
    System.out.println("Match result: " + passwordEncoder.matches(request.getPassword(), user.getPassword()));

    if(!passwordEncoder.matches(request.getPassword(), user.getPassword())){
        throw new RuntimeException("Invalid password");
    }

    String token = jwtUtil.generateToken(user.getEmail());

    return new LoginResponse(token, user.getRole().name());
}

    public void forgotPassword(String email){
        // implement email reset token logic
    }

    public void resetPassword(String token,String newPassword){
        // implement reset logic
    }
}