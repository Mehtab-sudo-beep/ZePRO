package com.zepro.service;

import com.zepro.dto.*;
import com.zepro.model.*;
import com.zepro.repository.*;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AdminService {

    private final InstituteRepository instituteRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository usersRepository;
    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(InstituteRepository instituteRepository,
                        DepartmentRepository departmentRepository,
                        UserRepository usersRepository,
                        StudentRepository studentRepository,
                        FacultyRepository facultyRepository,
                        PasswordEncoder passwordEncoder) {

        this.instituteRepository = instituteRepository;
        this.departmentRepository = departmentRepository;
        this.usersRepository = usersRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ CREATE INSTITUTE (FULL MAPPING)
    public InstituteResponse createInstitute(CreateInstituteRequest request) {

        Institute institute = new Institute();

        institute.setInstituteName(request.getInstituteName());
        institute.setInstituteCode(request.getInstituteCode());
        institute.setPhoneNumber(request.getPhoneNumber());
        institute.setAddress(request.getAddress());
        institute.setCity(request.getCity());
        institute.setState(request.getState());
        institute.setEmail(request.getEmail());
        institute.setWebsite(request.getWebsite());

        Institute saved = instituteRepository.save(institute);

        // ✅ FULL RESPONSE
        InstituteResponse response = new InstituteResponse();
        response.setInstituteId(saved.getInstituteId());
        response.setInstituteName(saved.getInstituteName());
        response.setInstituteCode(saved.getInstituteCode());
        response.setPhoneNumber(saved.getPhoneNumber());
        response.setAddress(saved.getAddress());
        response.setCity(saved.getCity());
        response.setState(saved.getState());
        response.setEmail(saved.getEmail());
        response.setWebsite(saved.getWebsite());

        return response;
    }

    // ✅ GET ALL INSTITUTES (FULL DATA)
    public List<InstituteResponse> getAllInstitutes() {
        return instituteRepository.findAll()
                .stream()
                .map(inst -> {
                    InstituteResponse res = new InstituteResponse();

                    res.setInstituteId(inst.getInstituteId());
                    res.setInstituteName(inst.getInstituteName());
                    res.setInstituteCode(inst.getInstituteCode());
                    res.setPhoneNumber(inst.getPhoneNumber());
                    res.setAddress(inst.getAddress());
                    res.setCity(inst.getCity());
                    res.setState(inst.getState());
                    res.setEmail(inst.getEmail());
                    res.setWebsite(inst.getWebsite());

                    return res;
                })
                .toList();
    }

    // ✅ DELETE INSTITUTE
    public void deleteInstitute(Long id) {
        instituteRepository.deleteById(id);
    }

    // ✅ GET DEPARTMENTS BY INSTITUTE
    public List<DepartmentResponse> getDepartmentsByInstitute(Long instituteId) {
        return departmentRepository.findByInstitute_InstituteId(instituteId)
                .stream()
                .map(dept -> new DepartmentResponse(
                        dept.getDepartmentId(),
                        dept.getDepartmentName(),
                        dept.getInstitute().getInstituteId(),
                        dept.getInstitute().getInstituteName(),
                        dept.getDepartmentCode(),
                        dept.getDescription(),
                        dept.getCoordinatorName(),
                        dept.getCoordinatorEmail(),
                        dept.getCoordinatorPhone()
                ))
                .toList();
    }

    // ✅ DELETE DEPARTMENT
    public void deleteDepartment(Long id) {
        departmentRepository.deleteById(id);
    }

    // -----------------------------
    // EXISTING METHODS (UNCHANGED)
    // -----------------------------

    public DepartmentResponse createDepartment(CreateDepartmentRequest request) {

        Institute institute = instituteRepository.findById(request.getInstituteId())
                .orElseThrow(() -> new RuntimeException("Institute not found"));

        Department department = new Department();
        department.setDepartmentName(request.getDepartmentName());
        department.setDepartmentCode(request.getDepartmentCode());
        department.setDescription(request.getDescription());
        department.setCoordinatorName(request.getCoordinatorName());
        department.setCoordinatorEmail(request.getCoordinatorEmail());
        department.setCoordinatorPhone(request.getCoordinatorPhone());
        department.setInstitute(institute);

        Department saved = departmentRepository.save(department);

        return new DepartmentResponse(
                saved.getDepartmentId(),
                saved.getDepartmentName(),
                institute.getInstituteId(),
                institute.getInstituteName(),
                saved.getDepartmentCode(),
                saved.getDescription(),
                saved.getCoordinatorName(),
                saved.getCoordinatorEmail(),
                saved.getCoordinatorPhone()
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

    public List<UserResponse> getAllUsers() {
        return usersRepository.findAll().stream()
                .map(u -> new UserResponse(
                        u.getUserId(),
                        u.getName(),
                        u.getEmail(),
                        u.getRole()
                ))
                .toList();
    }

    public List<UserResponse> getUsersByDepartment(Long departmentId) {
        List<UserResponse> users = new java.util.ArrayList<>();

        // Add Students
        studentRepository.findByDepartment_DepartmentId(departmentId).forEach(student -> {
            users.add(new UserResponse(
                    student.getUser().getUserId(),
                    student.getUser().getName(),
                    student.getUser().getEmail(),
                    student.getUser().getRole()
            ));
        });

        // Add Faculty
        facultyRepository.findByDepartment_DepartmentId(departmentId).forEach(faculty -> {
            UserResponse resp = new UserResponse(
                    faculty.getUser().getUserId(),
                    faculty.getUser().getName(),
                    faculty.getUser().getEmail(),
                    faculty.getUser().getRole()
            );
            users.add(resp);
        });

        return users;
    }
}