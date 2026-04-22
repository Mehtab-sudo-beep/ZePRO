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
    private final TeamRepository teamRepository;
    private final ProjectRequestRepository projectRequestRepository;
    private final MeetingRepository meetingRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminService(InstituteRepository instituteRepository,
            DepartmentRepository departmentRepository,
            UserRepository usersRepository,
            StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            ProjectRepository projectRepository,
            TeamRepository teamRepository,
            ProjectRequestRepository projectRequestRepository,
            MeetingRepository meetingRepository,
            PasswordEncoder passwordEncoder) {

        this.instituteRepository = instituteRepository;
        this.departmentRepository = departmentRepository;
        this.usersRepository = usersRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.projectRepository = projectRepository;
        this.teamRepository = teamRepository;
        this.projectRequestRepository = projectRequestRepository;
        this.meetingRepository = meetingRepository;
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
        institute.setTail(request.getTail()); // ✅ NEW LINE

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
        response.setTail(saved.getTail()); // ✅ NEW LINE

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
                    res.setTail(inst.getTail()); // ✅ NEW LINE

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
                        dept.getCoordinatorPhone()))
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
                saved.getCoordinatorPhone());
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
                saved.getRole());
    }

    public List<UserResponse> getAllUsers() {
        return usersRepository.findAll().stream()
                .map(u -> new UserResponse(
                        u.getUserId(),
                        u.getName(),
                        u.getEmail(),
                        u.getRole()))
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
                    student.getRollNumber()));
        });

        // Add Faculty
        facultyRepository.findByDepartment_DepartmentId(departmentId).forEach(faculty -> {
            UserResponse resp = new UserResponse(
                    faculty.getUser().getUserId(),
                    faculty.getUser().getName(),
                    faculty.getUser().getEmail(),
                    faculty.getUser().getRole(),
                    faculty.getEmployeeId());
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

    // ✅ DELETE USER (FACULTY OR STUDENT)
    @org.springframework.transaction.annotation.Transactional
    public void deleteUser(Long userId) {
        System.out.println("[AdminService] 🗑 Processing delete for User ID: " + userId);
        Users user = usersRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getRole() == com.zepro.model.UserRole.FACULTY) {
            facultyRepository.findByUser_UserId(userId).ifPresent(faculty -> {
                System.out.println("[AdminService] 🗑 Deleting Faculty: " + faculty.getUser().getName());

                List<Project> projects = projectRepository.findByFacultyFacultyId(faculty.getFacultyId());
                for (Project project : projects) {
                    if (project.getTeam() != null || "ALLOCATED".equals(project.getStatus())) {
                        Team team = project.getTeam();
                        if (team != null) {
                            team.setStatus("pending");
                            teamRepository.save(team);

                            for (Student s : team.getMembers()) {
                                s.setAllocated(false);
                                s.setAllocatedProject(null);
                                s.setAllocatedFaculty(null);
                                studentRepository.save(s);
                            }

                            List<ProjectRequest> rejectedRequests = projectRequestRepository
                                    .findByTeamTeamIdAndStatus(team.getTeamId(), RequestStatus.REJECTED);
                            for (ProjectRequest req : rejectedRequests) {
                                req.setStatus(RequestStatus.PENDING);
                                projectRequestRepository.save(req);
                            }
                        }
                    }

                    List<ProjectRequest> requests = projectRequestRepository
                            .findByProjectProjectId(project.getProjectId());
                    projectRequestRepository.deleteAll(requests);

                    projectRepository.delete(project);
                }

                if (faculty.getIsFC() != null && faculty.getIsFC()) {
                    Department dept = faculty.getDepartment();
                    if (dept != null && dept.getCoordinatorEmail() != null
                            && dept.getCoordinatorEmail().equals(user.getEmail())) {
                        dept.setCoordinatorName(null);
                        dept.setCoordinatorEmail(null);
                        dept.setCoordinatorPhone(null);
                        departmentRepository.save(dept);
                    }
                }

                facultyRepository.delete(faculty);
            });
        } else if (user.getRole() == com.zepro.model.UserRole.STUDENT) {
            studentRepository.findByUserUserId(userId).ifPresent(student -> {
                System.out.println("[AdminService] 🗑 Deleting Student: " + student.getUser().getName());
                Team team = student.getTeam();
                if (team != null) {
                    team.getMembers().remove(student);

                    if (student.isTeamLead()) {
                        if (!team.getMembers().isEmpty()) {
                            Student newLead = team.getMembers().get(0);
                            newLead.setTeamLead(true);
                            team.setTeamLead(newLead);
                            studentRepository.save(newLead);
                        } else {
                            team.setTeamLead(null);
                        }
                    }

                    student.setTeam(null);

                    Project allocatedProject = projectRepository.findByTeam(team);
                    if (allocatedProject != null) {
                        System.out.println(
                                "[AdminService] 🔄 Reverting project allocation for team " + team.getTeamName());

                        allocatedProject.updateStatusWithHistory("IN_PROGRESS");
                        allocatedProject.setTeam(null);
                        projectRepository.save(allocatedProject);

                        team.setStatus("pending");

                        for (Student s : team.getMembers()) {
                            s.setAllocated(false);
                            s.setAllocatedProject(null);
                            s.setAllocatedFaculty(null);
                            studentRepository.save(s);
                        }

                        List<ProjectRequest> rejectedRequests = projectRequestRepository
                                .findByTeamTeamIdAndStatus(team.getTeamId(), RequestStatus.REJECTED);
                        for (ProjectRequest req : rejectedRequests) {
                            req.setStatus(RequestStatus.PENDING);
                            projectRequestRepository.save(req);
                        }

                        List<Meeting> cancelledMeetings = meetingRepository.findByTeamTeamIdAndStatus(team.getTeamId(),
                                com.zepro.model.MeetingStatus.CANCELLED);
                        for (Meeting meeting : cancelledMeetings) {
                            meeting.setStatus(com.zepro.model.MeetingStatus.SCHEDULED);
                            meetingRepository.save(meeting);
                        }
                    }
                    teamRepository.save(team);
                }
                studentRepository.delete(student);
            });
        }

        usersRepository.delete(user);
        System.out.println("[AdminService] ✅ User deleted successfully.");
    }

    // ✅ FIXED ASSIGN FACULTY COORDINATOR TO DEPARTMENT
    public DepartmentResponse assignFacultyCoordinator(Long facultyId, Long departmentId) {

        System.out.println("[AdminService] 🔍 Assigning coordinator - FacultyId: " + facultyId + ", DepartmentId: "
                + departmentId);

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

        // ✅ Ensure only one coordinator per department
        facultyRepository.findByDepartment_DepartmentIdAndIsFC(departmentId, true)
                .ifPresent(existing -> {
                    System.out.println(
                            "[AdminService] 🔄 Removing FC status from existing: " + existing.getUser().getName());
                    existing.setIsFC(false);
                    facultyRepository.save(existing);
                });

        // Update faculty role to FACULTY_COORDINATOR
        faculty.setIsFC(true);
        facultyRepository.save(faculty);

        System.out.println("[AdminService] 📝 Updating department coordinator info");

        // Update department's coordinator
        department.setCoordinatorName(faculty.getUser().getName());
        department.setCoordinatorEmail(faculty.getUser().getEmail());
        department.setCoordinatorPhone(faculty.getPhone());

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
                updated.getCoordinatorPhone());
    }

    // ✅ GET FACULTY BY DEPARTMENT
    public List<UserResponse> getFacultyByDepartment(Long departmentId) {
        System.out.println("[AdminService] 📡 Fetching faculty for department: " + departmentId);

        List<UserResponse> response = facultyRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(f -> new UserResponse(
                        f.getUser().getUserId(),
                        f.getUser().getName(),
                        f.getUser().getEmail(),
                        f.getUser().getRole(),
                        f.getEmployeeId(),
                        f.getIsFC()))
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
                        s.getRollNumber()))
                .toList();

        System.out.println("[AdminService] ✅ Found " + response.size() + " students");
        return response;
    }

    // ✅ REMOVE FACULTY COORDINATOR
    @org.springframework.transaction.annotation.Transactional
    public DepartmentResponse removeFacultyCoordinator(Long facultyId, Long departmentId) {

        System.out.println(
                "[AdminService] 🔍 Removing coordinator - FacultyId: " + facultyId + ", DepartmentId: " + departmentId);

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
                updated.getCoordinatorPhone());
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

        System.out.println("[AdminService] ✅ Students: " + studentCount + ", Faculty: " + facultyCount + ", Projects: "
                + projectCount);

        return new DepartmentStatsResponse(
                departmentId,
                department.getDepartmentName(),
                studentCount,
                facultyCount,
                projectCount);
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
                totalFaculty);
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
                faculty.getIsFC() ? "FACULTY_COORDINATOR" : "FACULTY");
    }

    // ✅ GET STUDENT DASHBOARD STATS
    public StudentDashboardStatsResponse getStudentDashboardStats(Long studentId) {

        System.out.println("[AdminService] 📊 Fetching student dashboard stats for ID: " + studentId);

        Student student = studentRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        long projectsCount = 0; // Can be added if Student has projects relation
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
                projectsCount);
    }

    // =========================================================================
    // ADMIN PDF REPORT GENERATION
    // =========================================================================

    @org.springframework.transaction.annotation.Transactional(readOnly = true)
    public byte[] generateAdminReportPdf(Long instituteId, Long departmentId) {
        try {
            List<Department> targetDepartments = new java.util.ArrayList<>();
            if (departmentId != null && departmentId > 0) {
                Department dept = departmentRepository.findById(departmentId)
                        .orElseThrow(() -> new RuntimeException("Department not found"));
                targetDepartments.add(dept);
            } else {
                targetDepartments = departmentRepository.findByInstitute_InstituteId(instituteId);
                if (targetDepartments.isEmpty()) {
                    throw new RuntimeException("No departments found for institute");
                }
            }

            org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument();

            // COLORS
            java.awt.Color darkBlue = new java.awt.Color(26, 47, 76);
            java.awt.Color orange = new java.awt.Color(242, 169, 0);
            java.awt.Color lightBlue = new java.awt.Color(221, 230, 245);
            java.awt.Color borderColor = new java.awt.Color(200, 210, 230);

            for (Department department : targetDepartments) {
                org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage(
                        org.apache.pdfbox.pdmodel.common.PDRectangle.A4);
                document.addPage(page);
                org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(
                        document, page);

                List<Team> allTeams = teamRepository
                        .findAllwithDetailsandDepartment_DepartmentId(department.getDepartmentId());
                long allocated = studentRepository
                        .countByIsAllocatedTrueAndDepartment_DepartmentId(department.getDepartmentId());
                long unallocated = studentRepository
                        .countByIsAllocatedFalseAndDepartment_DepartmentId(department.getDepartmentId());
                int totalMembersInTeams = allTeams.stream()
                        .mapToInt(t -> t.getMembers() == null ? 0 : t.getMembers().size()).sum();

                float margin = 40;
                float pageWidth = page.getMediaBox().getWidth();
                float yPosition = page.getMediaBox().getHeight();

                // --- HEADER BLOCK ---
                contentStream.setNonStrokingColor(darkBlue);
                contentStream.addRect(0, yPosition - 100, pageWidth, 100);
                contentStream.fill();

                contentStream.setNonStrokingColor(orange);
                contentStream.addRect(0, yPosition - 105, pageWidth, 5);
                contentStream.fill();

                contentStream.setNonStrokingColor(java.awt.Color.WHITE);
                drawCenteredText(contentStream, "ZePRO", org.apache.pdfbox.pdmodel.font.PDType1Font.TIMES_BOLD, 28,
                        pageWidth, yPosition - 40);
                drawCenteredText(contentStream, "Project Registration & Oversight System",
                        org.apache.pdfbox.pdmodel.font.PDType1Font.TIMES_ROMAN, 12, pageWidth, yPosition - 60);
                drawCenteredText(contentStream, "Admin Teams Report",
                        org.apache.pdfbox.pdmodel.font.PDType1Font.TIMES_BOLD, 18, pageWidth, yPosition - 85);

                yPosition -= 140;

                // --- SUMMARY BOX ---
                float summaryHeight = 65;
                float summaryWidth = pageWidth - (2 * margin);
                contentStream.setNonStrokingColor(lightBlue);
                contentStream.addRect(margin, yPosition - summaryHeight, summaryWidth, summaryHeight);
                contentStream.fill();

                contentStream.setNonStrokingColor(darkBlue);
                org.apache.pdfbox.pdmodel.font.PDType1Font boldFont = org.apache.pdfbox.pdmodel.font.PDType1Font.TIMES_BOLD;
                org.apache.pdfbox.pdmodel.font.PDType1Font regFont = org.apache.pdfbox.pdmodel.font.PDType1Font.TIMES_ROMAN;
                int fontSize = 10;

                String dateStr = java.time.LocalDate.now()
                        .format(java.time.format.DateTimeFormatter.ofPattern("dd-MM-yyyy"));

                float col1X = margin + 20;
                float col1ValX = margin + 95;
                float col2X = margin + 240;
                float col2ValX = margin + 335;

                float row1Y = yPosition - 20;
                float row2Y = yPosition - 38;
                float row3Y = yPosition - 56;

                drawTextWithFont(contentStream, "Department:", boldFont, fontSize, col1X, row1Y);
                drawTextWithFont(contentStream, limitText(department.getDepartmentName(), 100), regFont, fontSize,
                        col1ValX, row1Y);

                drawTextWithFont(contentStream, "Generated on:", boldFont, fontSize, col2X, row1Y);
                drawTextWithFont(contentStream, dateStr, regFont, fontSize, col2ValX, row1Y);

                drawTextWithFont(contentStream, "Total Teams:", boldFont, fontSize, col1X, row2Y);
                drawTextWithFont(contentStream, String.valueOf(allTeams.size()), regFont, fontSize, col1ValX, row2Y);

                drawTextWithFont(contentStream, "Total Members:", boldFont, fontSize, col2X, row2Y);
                drawTextWithFont(contentStream, String.valueOf(totalMembersInTeams), regFont, fontSize, col2ValX,
                        row2Y);

                drawTextWithFont(contentStream, "Allocated:", boldFont, fontSize, col1X, row3Y);
                drawTextWithFont(contentStream, String.valueOf(allocated), regFont, fontSize, col1ValX, row3Y);

                drawTextWithFont(contentStream, "Unallocated:", boldFont, fontSize, col2X, row3Y);
                drawTextWithFont(contentStream, String.valueOf(unallocated), regFont, fontSize, col2ValX, row3Y);

                yPosition -= (summaryHeight + 40);

                // --- TABLE TITLE ---
                drawTextWithFont(contentStream, "Team Members", boldFont, 12, margin, yPosition);
                yPosition -= 10;
                contentStream.setNonStrokingColor(orange);
                contentStream.addRect(margin, yPosition, summaryWidth, 2);
                contentStream.fill();
                yPosition -= 20;

                // --- TABLE ---
                float[] colWidths = { 35, 125, 75, 90, 100, 90 };
                String[] headers = { "S.No", "Team Members", "Roll No", "Team Name", "Project", "Guide" };

                contentStream.setNonStrokingColor(darkBlue);
                contentStream.addRect(margin, yPosition - 20, summaryWidth, 20);
                contentStream.fill();

                contentStream.setNonStrokingColor(java.awt.Color.WHITE);
                float curX = margin;
                for (int i = 0; i < headers.length; i++) {
                    drawTextWithFont(contentStream, headers[i], boldFont, 9, curX + 5, yPosition - 14);
                    curX += colWidths[i];
                }
                yPosition -= 20;

                contentStream.setStrokingColor(borderColor);
                contentStream.setLineWidth(0.5f);

                int teamNo = 1;
                for (Team team : allTeams) {
                    List<Student> members = team.getMembers();
                    if (members == null)
                        members = new java.util.ArrayList<>();
                    int rowSpan = Math.max(1, members.size());
                    float rowHeight = rowSpan * 20f;

                    if (yPosition - rowHeight < 50) {
                        contentStream.moveTo(margin, yPosition);
                        contentStream.lineTo(margin + summaryWidth, yPosition);
                        contentStream.stroke();

                        contentStream.close();
                        page = new org.apache.pdfbox.pdmodel.PDPage(org.apache.pdfbox.pdmodel.common.PDRectangle.A4);
                        document.addPage(page);
                        contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page);
                        yPosition = page.getMediaBox().getHeight() - 50;

                        contentStream.setNonStrokingColor(darkBlue);
                        contentStream.addRect(margin, yPosition - 20, summaryWidth, 20);
                        contentStream.fill();
                        contentStream.setNonStrokingColor(java.awt.Color.WHITE);
                        curX = margin;
                        for (int i = 0; i < headers.length; i++) {
                            drawTextWithFont(contentStream, headers[i], boldFont, 9, curX + 5, yPosition - 14);
                            curX += colWidths[i];
                        }
                        yPosition -= 20;
                        contentStream.setStrokingColor(borderColor);
                        contentStream.setLineWidth(0.5f);
                    }

                    contentStream.addRect(margin, yPosition - rowHeight, summaryWidth, rowHeight);
                    contentStream.stroke();

                    curX = margin;
                    for (int i = 0; i < colWidths.length - 1; i++) {
                        curX += colWidths[i];
                        contentStream.moveTo(curX, yPosition);
                        contentStream.lineTo(curX, yPosition - rowHeight);
                        contentStream.stroke();
                    }

                    contentStream.setNonStrokingColor(darkBlue);

                    String topic = team.getTeamName() != null ? team.getTeamName() : "";
                    Project project = projectRepository.findByTeam(team);
                    String projectTitle = (project != null && project.getTitle() != null) ? project.getTitle() : "-";
                    String guide = team.getFaculty() != null && team.getFaculty().getUser() != null
                            ? team.getFaculty().getUser().getName()
                            : "-";

                    float centerY = yPosition - (rowHeight / 2) - 3;

                    drawCenteredTextWithin(contentStream, String.valueOf(teamNo++), boldFont, 9, margin,
                            margin + colWidths[0], centerY);

                    float tNameStartX = margin + colWidths[0] + colWidths[1] + colWidths[2];
                    writeWrappedText(contentStream, topic, regFont, 9, tNameStartX + 5, centerY, colWidths[3] - 10);

                    float pNameStartX = tNameStartX + colWidths[3];
                    writeWrappedText(contentStream, projectTitle, regFont, 9, pNameStartX + 5, centerY,
                            colWidths[4] - 10);

                    float guideStartX = pNameStartX + colWidths[4];
                    writeWrappedText(contentStream, guide, regFont, 9, guideStartX + 5, centerY, colWidths[5] - 10);

                    float memY = yPosition;
                    for (int m = 0; m < rowSpan; m++) {
                        if (m > 0) {
                            contentStream.moveTo(margin + colWidths[0], memY);
                            contentStream.lineTo(margin + colWidths[0] + colWidths[1] + colWidths[2], memY);
                            contentStream.stroke();
                        }
                        if (m < members.size()) {
                            Student s = members.get(m);
                            String sName = limitText(s.getUser().getName(), 120);
                            String sRoll = s.getRollNumber() != null ? s.getRollNumber()
                                    : extractRoll(s.getUser().getEmail());
                            drawTextWithFont(contentStream, sName, regFont, 9, margin + colWidths[0] + 5, memY - 14);
                            drawTextWithFont(contentStream, sRoll, regFont, 9, margin + colWidths[0] + colWidths[1] + 5,
                                    memY - 14);
                        }
                        memY -= 20;
                    }
                    yPosition -= rowHeight;
                }

                yPosition -= 50;
                contentStream.setStrokingColor(borderColor);
                contentStream.moveTo(pageWidth / 2 - 100, yPosition);
                contentStream.lineTo(pageWidth / 2 + 100, yPosition);
                contentStream.stroke();

                yPosition -= 15;
                contentStream.setNonStrokingColor(new java.awt.Color(120, 130, 150));
                drawCenteredText(contentStream, "This is an auto-generated report from the ZePRO System.", regFont, 8,
                        pageWidth, yPosition);
                drawCenteredText(contentStream, "Do not alter the contents manually.", regFont, 8, pageWidth,
                        yPosition - 10);

                contentStream.close();
            }

            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            document.save(baos);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Generated PDF Error: " + e.getMessage());
        }
    }

    private void drawTextWithFont(org.apache.pdfbox.pdmodel.PDPageContentStream contentStream, String text,
            org.apache.pdfbox.pdmodel.font.PDType1Font font, int fontSize, float x, float y) throws Exception {
        if (text == null)
            text = "";
        text = text.replace("\n", " ").replace("\r", " ");
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void drawCenteredText(org.apache.pdfbox.pdmodel.PDPageContentStream contentStream, String text,
            org.apache.pdfbox.pdmodel.font.PDType1Font font, int fontSize, float pageWidth, float y) throws Exception {
        if (text == null)
            text = "";
        text = text.replace("\n", " ").replace("\r", " ");
        float titleWidth = font.getStringWidth(text) / 1000f * fontSize;
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset((pageWidth - titleWidth) / 2, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void drawCenteredTextWithin(org.apache.pdfbox.pdmodel.PDPageContentStream contentStream, String text,
            org.apache.pdfbox.pdmodel.font.PDType1Font font, int fontSize, float startX, float endX, float y)
            throws Exception {
        if (text == null)
            text = "";
        text = text.replace("\n", " ").replace("\r", " ");
        float textWidth = font.getStringWidth(text) / 1000f * fontSize;
        float x = startX + ((endX - startX) - textWidth) / 2;
        contentStream.beginText();
        contentStream.setFont(font, fontSize);
        contentStream.newLineAtOffset(x, y);
        contentStream.showText(text);
        contentStream.endText();
    }

    private void writeWrappedText(org.apache.pdfbox.pdmodel.PDPageContentStream cs, String text,
            org.apache.pdfbox.pdmodel.font.PDType1Font font, int fontSize, float x, float y, float maxWidth)
            throws Exception {
        if (text == null)
            text = "";
        text = text.replace("\n", " ").replace("\r", " ");
        float txtW = font.getStringWidth(text) / 1000f * fontSize;
        if (txtW > maxWidth) {
            int chars = (int) (text.length() * (maxWidth / txtW)) - 2;
            if (chars > 0)
                text = text.substring(0, chars) + "..";
        }
        drawTextWithFont(cs, text, font, fontSize, x, y);
    }

    private String limitText(String text, float widthConstraint) {
        if (text == null || text.trim().isEmpty())
            return "";
        try {
            int maxChars = (int) (widthConstraint / 3.0);
            if (text.length() > maxChars) {
                return text.substring(0, Math.max(0, maxChars - 2)) + "..";
            }
            return text.replace("\n", " ").replace("\r", "");
        } catch (Exception e) {
            return "";
        }
    }

    private String extractRoll(String email) {
        if (email == null)
            return "";
        return email.split("@")[0].toUpperCase();
    }
}