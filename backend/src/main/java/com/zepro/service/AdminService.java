package com.zepro.service;

import com.zepro.dto.*;
import com.zepro.model.*;
import com.zepro.repository.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminService {

    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository usersRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(InstituteRepository instituteRepository,
                        DepartmentRepository departmentRepository,
                        UserRepository usersRepository,
                        PasswordEncoder passwordEncoder) {

        this.instituteRepository = instituteRepository;
        this.departmentRepository = departmentRepository;
        this.usersRepository = usersRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public InstituteResponse createInstitute(CreateInstituteRequest request) {

        Institute institute = new Institute();
        institute.setInstituteName(request.getInstituteName());

        Institute saved = instituteRepository.save(institute);

        return new InstituteResponse(
                saved.getInstituteId(),
                saved.getInstituteName()
        );
    }

    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {

        Institute institute = instituteRepository.findById(request.getInstituteId())
                .orElseThrow(() -> new RuntimeException("Institute not found"));

        Department department = new Department();
        department.setDepartmentName(request.getDepartmentName());
        department.setInstitute(institute);

        Department saved = departmentRepository.save(department);

        return new DepartmentResponse(
                saved.getDepartmentId(),
                saved.getDepartmentName(),
                institute.getInstituteId(),
                institute.getInstituteName()
        );
    }

    public UserResponse createUser(CreateUserRequest request) {

        Users user = new Users();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        Users saved = usersRepository.save(user);

        return new UserResponse(
                saved.getUserId(),
                saved.getName(),
                saved.getEmail(),
                saved.getRole()
        );
    }
}