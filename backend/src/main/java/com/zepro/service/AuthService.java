package com.zepro.service;

import com.zepro.dto.*;
import com.zepro.model.Users;
import com.zepro.repository.UserRepository;
import com.zepro.security.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthService(UserRepository userRepository,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil){

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    public Object signup(SignupRequest request){

        Users user = new Users();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        userRepository.save(user);

        return "User created";
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