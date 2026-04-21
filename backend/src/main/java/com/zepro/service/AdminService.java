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
    private final ProjectRepository projectRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(InstituteRepository instituteRepository,
                        DepartmentRepository departmentRepository,
                        UserRepository usersRepository,
                        StudentRepository studentRepository,
                        FacultyRepository facultyRepository,
                        ProjectRepository projectRepository,
                        PasswordEncoder passwordEncoder) {

        this.instituteRepository = instituteRepository;
        this.departmentRepository = departmentRepository;
        this.usersRepository = usersRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.projectRepository = projectRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ✅ UPDATE CREATE INSTITUTE
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
        institute.setTail(request.getTail());  // ✅ NEW LINE

        Institute saved = instituteRepository.save(institute);

        // ✅ UPDATE RESPONSE
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
        response.setTail(saved.getTail());  // ✅ NEW LINE

        return response;
    }

    // ✅ UPDATE GET ALL INSTITUTES
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
                    res.setTail(inst.getTail());  // ✅ NEW LINE

                    return res;
                })
                .toList();
    }

    // ✅ DELETE INSTITUTE
    @org.springframework.transaction.annotation.Transactional
    public void deleteInstitute(Long id) {
        List<com.zepro.model.Department> departments = departmentRepository.findByInstitute_InstituteId(id);
        for (com.zepro.model.Department dept : departments) {
            deleteDepartment(dept.getDepartmentId());
        }
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
    @org.springframework.transaction.annotation.Transactional
    public void deleteDepartment(Long id) {
        // Delete Students and their Users
        List<com.zepro.model.Student> students = studentRepository.findByDepartment_DepartmentId(id);
        for (com.zepro.model.Student student : students) {
            Long userId = student.getUser().getUserId();
            studentRepository.delete(student);
            usersRepository.deleteById(userId);
        }

        // Delete Faculties and their Users
        List<com.zepro.model.Faculty> faculties = facultyRepository.findByDepartment_DepartmentId(id);
        for (com.zepro.model.Faculty faculty : faculties) {
            Long userId = faculty.getUser().getUserId();
            facultyRepository.delete(faculty);
            usersRepository.deleteById(userId);
        }

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
                    student.getUser().getRole(),
                    student.getRollNumber()
            ));
        });

        // Add Faculty
        facultyRepository.findByDepartment_DepartmentId(departmentId).forEach(faculty -> {
            UserResponse resp = new UserResponse(
                    faculty.getUser().getUserId(),
                    faculty.getUser().getName(),
                    faculty.getUser().getEmail(),
                    faculty.getUser().getRole(),
                    faculty.getEmployeeId()
            );
            users.add(resp);
        });

        return users;
    }

    public UserResponse updateUserRole(Long userId, String newRole) {
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        user.setRole(com.zepro.model.UserRole.valueOf(newRole));
        Users saved = usersRepository.save(user);
        return new UserResponse(saved.getUserId(), saved.getName(), saved.getEmail(), saved.getRole());
    }

    // ✅ FIXED ASSIGN FACULTY COORDINATOR TO DEPARTMENT
    public DepartmentResponse assignFacultyCoordinator(Long facultyId, Long departmentId) {
        
        System.out.println("[AdminService] 🔍 Assigning coordinator - FacultyId: " + facultyId + ", DepartmentId: " + departmentId);
        
        // ✅ FIXED: Query by userId instead of facultyId
        Faculty faculty = facultyRepository.findByUser_UserId(facultyId)
                .orElseThrow(() -> {
                    System.out.println("[AdminService] ❌ Faculty not found with userId: " + facultyId);
                    return new RuntimeException("Faculty not found with ID: " + facultyId);
                });

        System.out.println("[AdminService] ✅ Faculty found: " + faculty.getUser().getName());

        // Get department
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> {
                    System.out.println("[AdminService] ❌ Department not found with id: " + departmentId);
                    return new RuntimeException("Department not found with ID: " + departmentId);
                });

        System.out.println("[AdminService] ✅ Department found: " + department.getDepartmentName());

        // ✅ FIXED: Check if faculty belongs to this department
        if (!faculty.getDepartment().getDepartmentId().equals(departmentId)) {
            System.out.println("[AdminService] ❌ Faculty does not belong to this department");
            throw new RuntimeException("Faculty does not belong to this department");
        }

        System.out.println("[AdminService] 📝 Updating faculty role to FACULTY_COORDINATOR");

        // Update faculty role to FACULTY_COORDINATOR
        faculty.setIsFC(true);
        usersRepository.save(faculty.getUser());

        System.out.println("[AdminService] 📝 Updating department coordinator info");

        // Update department's coordinator
        department.setCoordinatorName(faculty.getUser().getName());
        department.setCoordinatorEmail(faculty.getUser().getEmail());
        department.setCoordinatorPhone(faculty.getPhone()); // ✅ FIXED: Use correct field name
        
        Department updated = departmentRepository.save(department);

        System.out.println("[AdminService] ✅ Coordinator assigned successfully");

        return new DepartmentResponse(
                updated.getDepartmentId(),
                updated.getDepartmentName(),
                updated.getInstitute().getInstituteId(),
                updated.getInstitute().getInstituteName(),
                updated.getDepartmentCode(),
                updated.getDescription(),
                updated.getCoordinatorName(),
                updated.getCoordinatorEmail(),
                updated.getCoordinatorPhone()
        );
    }

    // ✅ GET FACULTY BY DEPARTMENT
    public List<UserResponse> getFacultyByDepartment(Long departmentId) {
        System.out.println("[AdminService] 📡 Fetching faculty for department: " + departmentId);
        
        List<UserResponse> response = facultyRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(f -> new UserResponse(
                        f.getUser().getUserId(),  // ✅ USE userId FOR FRONTEND
                        f.getUser().getName(),
                        f.getUser().getEmail(),
                        f.getUser().getRole(),
                        f.getEmployeeId()
                ))
                .toList();
        
        System.out.println("[AdminService] ✅ Found " + response.size() + " faculty members");
        return response;
    }

    // ✅ GET STUDENTS BY DEPARTMENT
    public List<UserResponse> getStudentsByDepartment(Long departmentId) {
        System.out.println("[AdminService] 📡 Fetching students for department: " + departmentId);
        
        List<UserResponse> response = studentRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(s -> new UserResponse(
                        s.getUser().getUserId(),
                        s.getUser().getName(),
                        s.getUser().getEmail(),
                        s.getUser().getRole(),
                        s.getRollNumber()
                ))
                .toList();
        
        System.out.println("[AdminService] ✅ Found " + response.size() + " students");
        return response;
    }

    // ✅ REMOVE FACULTY COORDINATOR
    @org.springframework.transaction.annotation.Transactional
    public DepartmentResponse removeFacultyCoordinator(Long facultyId, Long departmentId) {
        
        System.out.println("[AdminService] 🔍 Removing coordinator - FacultyId: " + facultyId + ", DepartmentId: " + departmentId);
        
        // ✅ Query by userId
        Faculty faculty = facultyRepository.findByUser_UserId(facultyId)
                .orElseThrow(() -> {
                    System.out.println("[AdminService] ❌ Faculty not found with userId: " + facultyId);
                    return new RuntimeException("Faculty not found with ID: " + facultyId);
                });

        System.out.println("[AdminService] ✅ Faculty found: " + faculty.getUser().getName());

        // Get department
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));

        // ✅ Check if faculty belongs to this department
        if (!faculty.getDepartment().getDepartmentId().equals(departmentId)) {
            System.out.println("[AdminService] ❌ Faculty does not belong to this department");
            throw new RuntimeException("Faculty does not belong to this department");
        }

        // ✅ Check if faculty is actually a coordinator
        if (!faculty.getIsFC()) {
            System.out.println("[AdminService] ❌ Faculty is not a coordinator");
            throw new RuntimeException("Faculty is not a coordinator");
        }

        System.out.println("[AdminService] 📝 Removing coordinator status");

        // ✅ Set isFC to false
        faculty.setIsFC(false);
        facultyRepository.save(faculty);

        // ✅ Clear department coordinator info
        department.setCoordinatorName(null);
        department.setCoordinatorEmail(null);
        department.setCoordinatorPhone(null);
        
        Department updated = departmentRepository.save(department);

        System.out.println("[AdminService] ✅ Coordinator removed successfully");

        return new DepartmentResponse(
                updated.getDepartmentId(),
                updated.getDepartmentName(),
                updated.getInstitute().getInstituteId(),
                updated.getInstitute().getInstituteName(),
                updated.getDepartmentCode(),
                updated.getDescription(),
                updated.getCoordinatorName(),
                updated.getCoordinatorEmail(),
                updated.getCoordinatorPhone()
        );
    }

    // ✅ GET DEPARTMENT STATS
    public DepartmentStatsResponse getDepartmentStats(Long departmentId) {
        
        System.out.println("[AdminService] 📊 Fetching stats for department: " + departmentId);
        
        Department department = departmentRepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        
        // Count students in this department
        long studentCount = studentRepository.countByDepartment_DepartmentId(departmentId);
        
        // Count faculty in this department
        long facultyCount = facultyRepository.countByDepartment_DepartmentId(departmentId);

        // Count projects in this department
        long projectCount = projectRepository.countByFaculty_Department_DepartmentId(departmentId);
        
        System.out.println("[AdminService] ✅ Students: " + studentCount + ", Faculty: " + facultyCount + ", Projects: " + projectCount);
        
        return new DepartmentStatsResponse(
                departmentId,
                department.getDepartmentName(),
                studentCount,
                facultyCount,
                projectCount
        );
    }

    // ✅ GET TOTAL STATISTICS FOR ADMIN DASHBOARD
    public AdminDashboardStatsResponse getAdminDashboardStats() {
        
        System.out.println("[AdminService] 📊 Fetching admin dashboard stats");
        
        long totalInstitutes = instituteRepository.count();
        long totalDepartments = departmentRepository.count();
        long totalUsers = usersRepository.count();
        long totalStudents = studentRepository.count();
        long totalFaculty = facultyRepository.count();
        
        System.out.println("[AdminService] ✅ Stats: Institutes=" + totalInstitutes + 
                ", Departments=" + totalDepartments + ", Users=" + totalUsers);
        
        return new AdminDashboardStatsResponse(
                totalInstitutes,
                totalDepartments,
                totalUsers,
                totalStudents,
                totalFaculty
        );
    }

    // ✅ GET FACULTY DASHBOARD STATS
    public FacultyDashboardStatsResponse getFacultyDashboardStats(Long facultyId) {
        
        System.out.println("[AdminService] 📊 Fetching faculty dashboard stats for ID: " + facultyId);
        
        Faculty faculty = facultyRepository.findByUser_UserId(facultyId)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        
        long allocatedStudents = faculty.getAllocatedStudents();
        long projectsCount = faculty.getProjects() != null ? faculty.getProjects().size() : 0;
        long maxCapacity = faculty.getMaxStudents();
        
        System.out.println("[AdminService] ✅ Faculty stats: Allocated=" + allocatedStudents + 
                ", Projects=" + projectsCount);
        
        return new FacultyDashboardStatsResponse(
                facultyId,
                faculty.getUser().getName(),
                faculty.getDepartment().getDepartmentName(),
                allocatedStudents,
                maxCapacity,
                projectsCount,
                faculty.getIsFC() ? "FACULTY_COORDINATOR" : "FACULTY"
        );
    }

    // ✅ GET STUDENT DASHBOARD STATS
    public StudentDashboardStatsResponse getStudentDashboardStats(Long studentId) {
        
        System.out.println("[AdminService] 📊 Fetching student dashboard stats for ID: " + studentId);
        
        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));
        
        long projectsCount = 0;  // Can be added if Student has projects relation
        boolean isAllocated = student.isAllocated();
        boolean isInTeam = student.isInTeam();
        
        System.out.println("[AdminService] ✅ Student stats: Allocated=" + isAllocated + 
                ", InTeam=" + isInTeam);
        
        return new StudentDashboardStatsResponse(
                studentId,
                student.getUser().getName(),
                student.getDepartment().getDepartmentName(),
                student.getCgpa(),
                student.getYear(),
                isAllocated,
                isInTeam,
                student.isTeamLead(),
                projectsCount
        );
    }
}