package com.zepro.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.zepro.model.*;
import com.zepro.repository.*;
import com.zepro.dto.facultycoordinator.*;

@Service
public class CoordinatorService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRulesRepository allocationRulesRepository;
    private final DepartmentRepository departmentrepository;
    private final TeamJoinRequestRepository teamJoinRequestRepository;
    private final DepartmentDeadlinesRepository departmentDeadlinesRepository;
    private final EmailService emailService;

    public CoordinatorService(StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            TeamRepository teamRepository,
            ProjectRepository projectRepository,
            AllocationRulesRepository allocationRulesRepository,
            DepartmentRepository departmentrepository,
            TeamJoinRequestRepository teamJoinRequestRepository,
            DepartmentDeadlinesRepository departmentDeadlinesRepository,
            EmailService emailService) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
        this.allocationRulesRepository = allocationRulesRepository;
        this.departmentrepository = departmentrepository;
        this.teamJoinRequestRepository = teamJoinRequestRepository;
        this.departmentDeadlinesRepository = departmentDeadlinesRepository;
        this.emailService = emailService;
    }

    // ✅ GET ALLOCATION RULES BY DEPARTMENT
    private AllocationRules getAllocationRulesByDepartment(Long departmentId) {
        System.out.println("[CoordinatorService] 📋 Fetching allocation rules for department: " + departmentId);
        return allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println(
                            "[CoordinatorService] ⚠️  No rules found for dept " + departmentId + ", using defaults");
                    AllocationRules defaults = new AllocationRules();
                    defaults.setMaxTeamSize(4);
                    defaults.setMaxStudentsPerFaculty(10);
                    defaults.setMaxProjectsPerFaculty(3);
                    return defaults;
                });
    }

    // ✅ ADD THIS METHOD - GET RULES BY DEPARTMENT
    public AllocationRulesResponse getRulesByDepartment(Long departmentId) {
        System.out.println("[CoordinatorService] 📋 Fetching rules for department: " + departmentId);

        AllocationRules rules = allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println(
                            "[CoordinatorService] ⚠️  No rules found for dept " + departmentId + ", using defaults");
                    AllocationRules defaults = new AllocationRules();
                    defaults.setMaxTeamSize(4);
                    defaults.setMaxStudentsPerFaculty(10);
                    defaults.setMaxProjectsPerFaculty(3);
                    return defaults;
                });

        System.out.println("[CoordinatorService] ✅ Rules for dept " + departmentId + ":");
        System.out.println("[CoordinatorService]    - maxTeamSize: " + rules.getMaxTeamSize());
        System.out.println("[CoordinatorService]    - maxStudentsPerFaculty: " + rules.getMaxStudentsPerFaculty());
        System.out.println("[CoordinatorService]    - maxProjectsPerFaculty: " + rules.getMaxProjectsPerFaculty());

        return new AllocationRulesResponse(
                rules.getMaxTeamSize(),
                rules.getMaxStudentsPerFaculty(),
                rules.getMaxProjectsPerFaculty());
    }

    // =========================================================================
    // OVERVIEW TAB
    // =========================================================================

    public DashboardStatsResponse getDashboardStats(Long departmentId) {

        long totalStudents = studentRepository.countByDepartment_DepartmentId(departmentId);
        long allocated = studentRepository.countByIsAllocatedTrueAndDepartment_DepartmentId(departmentId);
        long unallocated = studentRepository.countByIsAllocatedFalseAndDepartment_DepartmentId(departmentId);
        long totalTeams = teamRepository.countByDepartmentId(departmentId);
        long totalFaculty = facultyRepository.countByDepartment_DepartmentId(departmentId);

        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println(
                "[CoordinatorService] 📌 Fetching active projects for " + departmentFaculties.size() + " faculties");

        int totalCreatedActiveSlots = 0;
        for (Faculty faculty : departmentFaculties) {
            List<Project> activeProjects = projectRepository.findByFacultyFacultyId(faculty.getFacultyId())
                    .stream()
                    .filter(project -> project.getIsActive() &&
                            ("OPEN".equals(project.getStatus()) ||
                                    "ASSIGNED".equals(project.getStatus()) ||
                                    "IN_PROGRESS".equals(project.getStatus())))
                    .collect(Collectors.toList());

            int facultySlots = activeProjects.stream()
                    .mapToInt(Project::getStudentSlots)
                    .sum();

            totalCreatedActiveSlots += facultySlots;

            System.out.println("[CoordinatorService]    - Faculty " + faculty.getUser().getName() +
                    ": " + facultySlots + " active slots from " + activeProjects.size() + " projects");
        }

        System.out.println("[CoordinatorService] 🎯 Total Active Slots Created: " + totalCreatedActiveSlots);

        long totalUsedSlots = studentRepository.countByIsAllocatedTrueAndDepartment_DepartmentId(departmentId);
        int availableSlots = (int) (totalCreatedActiveSlots - totalUsedSlots);

        return new DashboardStatsResponse(
                totalStudents, allocated, unallocated,
                totalTeams, totalFaculty, availableSlots);
    }

    // =========================================================================
    // FACULTIES TAB
    // =========================================================================

    public List<CoordinatorFacultyResponse> getAllFaculties(long departmentId) {
        return facultyRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToFacultyResponse)
                .collect(Collectors.toList());
    }

    public List<CoordinatorFacultyResponse> searchFaculties(String query, long departmentId) {
        System.out.println("[CoordinatorService] 🔍 Searching faculties in department: " + departmentId);
        System.out.println("[CoordinatorService] Query: " + query);

        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] Total faculties in department: " + departmentFaculties.size());

        List<CoordinatorFacultyResponse> results = departmentFaculties.stream()
                .filter(faculty -> faculty.getUser().getName().toLowerCase().contains(query.toLowerCase()) ||
                        faculty.getUser().getEmail().toLowerCase().contains(query.toLowerCase()) ||
                        faculty.getEmployeeId().toLowerCase().contains(query.toLowerCase()))
                .map(this::mapToFacultyResponse)
                .collect(Collectors.toList());

        System.out.println("[CoordinatorService] ✅ Found " + results.size() + " matching faculties");
        return results;
    }

    // =========================================================================
    // STUDENTS TAB
    // =========================================================================

    public List<CoordinatorStudentResponse> getAllStudents(long departmentId) {
        return studentRepository.findByDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    public List<CoordinatorStudentResponse> searchStudents(String query, long departmentId) {
        return studentRepository.searchStudents(query).stream()
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    public List<CoordinatorStudentResponse> getAllocatedStudents(long departmentId) {
        return studentRepository.findByIsAllocatedTrueAndDepartment_DepartmentId(departmentId).stream()
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());
    }

    // =========================================================================
    // ALLOCATE
    // =========================================================================

    @Transactional
    public void allocateStudentToFaculty(AllocateStudentRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.isAllocated()) {
            throw new RuntimeException(
                    "Student is already allocated. Use override allocation instead.");
        }

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Long departmentId = faculty.getDepartment() != null ? faculty.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);

        System.out.println("[CoordinatorService] 📊 Allocation rules for dept " + departmentId + ": maxStudents="
                + rules.getMaxStudentsPerFaculty());

        if (faculty.getAllocatedStudents() >= rules.getMaxStudentsPerFaculty()) {
            throw new RuntimeException(
                    "No slots available for faculty: " + faculty.getUser().getName() +
                            " (Limit: " + rules.getMaxStudentsPerFaculty() + ")");
        }

        student.setAllocated(true);
        student.setAllocatedFaculty(faculty);
        studentRepository.save(student);

        updateFacultyAllocationCount(faculty);

        Team team = student.getTeam();
        if (team != null) {
            team.setFaculty(faculty);
            teamRepository.save(team);
            System.out.println("Team [" + team.getTeamName() +
                    "] guide set to: " + faculty.getUser().getName());
        }
    }

    // =========================================================================
    // OVERRIDE ALLOCATION
    // =========================================================================
    @Transactional
    public void overrideStudentAllocation(OverrideAllocationRequest request) {

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (!student.isAllocated() || student.getAllocatedFaculty() == null) {
            throw new RuntimeException(
                    "Student is not yet allocated. Use allocate instead.");
        }

        Faculty newFaculty = facultyRepository.findById(request.getNewFacultyId())
                .orElseThrow(() -> new RuntimeException("Target faculty not found"));

        Faculty oldFaculty = student.getAllocatedFaculty();

        if (oldFaculty.getFacultyId().equals(newFaculty.getFacultyId())) {
            throw new RuntimeException(
                    "New faculty must be different from the current faculty.");
        }

        Long departmentId = newFaculty.getDepartment() != null ? newFaculty.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);

        System.out.println("[CoordinatorService] 📊 Override allocation rules for dept " + departmentId
                + ": maxStudents=" + rules.getMaxStudentsPerFaculty());

        if (newFaculty.getAllocatedStudents() >= rules.getMaxStudentsPerFaculty()) {
            throw new RuntimeException(
                    "No slots available for faculty: " + newFaculty.getUser().getName() +
                            " (Limit: " + rules.getMaxStudentsPerFaculty() + ")");
        }

        updateFacultyAllocationCount(oldFaculty);
        updateFacultyAllocationCount(newFaculty);

        student.setAllocatedFaculty(newFaculty);
        studentRepository.save(student);

        Team team = student.getTeam();
        if (team != null) {
            Faculty currentTeamFaculty = team.getFaculty();

            if (currentTeamFaculty == null ||
                    currentTeamFaculty.getFacultyId().equals(oldFaculty.getFacultyId())) {

                team.setFaculty(newFaculty);
                teamRepository.save(team);
                System.out.println("Team [" + team.getTeamName() +
                        "] guide updated to: " + newFaculty.getUser().getName());
            }
        }
    }

    // =========================================================================
    // TEAMS TAB
    // =========================================================================

    @Transactional(readOnly = true)
    public List<CoordinatorTeamResponse> getAllTeams(long departmentid) {
        List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentid);
        System.out.println("[getAllTeams] Found " + allTeams.size() + " teams in DB");
        return allTeams.stream()
                .map(t -> {
                    try {
                        return mapToTeamResponse(t);
                    } catch (Exception e) {
                        System.out.println("Error mapping team " + t.getTeamId() + ": "
                                + e.getMessage());
                        return new CoordinatorTeamResponse(
                                t.getTeamId(),
                                t.getTeamName() != null ? t.getTeamName() : "Unknown",
                                "N/A", null, "N/A",
                                t.getStatus() != null ? t.getStatus() : "unknown",
                                List.of(), 3);
                    }
                })
                .collect(Collectors.toList());
    }

    // =========================================================================
    // DOWNLOAD ALL TEAMS REPORT
    // =========================================================================

    @Transactional(readOnly = true)
    public AllTeamsReportResponse getAllTeamsReport(long departmentid) {
        List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentid);
        System.out.println("[getAllTeamsReport] Found " + allTeams.size() + " teams in DB");
        List<CoordinatorTeamResponse> teamList = allTeams.stream()
                .map(t -> {
                    try {
                        return mapToTeamResponse(t);
                    } catch (Exception e) {
                        System.out.println("Error mapping team " + t.getTeamId() + ": "
                                + e.getMessage());
                        return new CoordinatorTeamResponse(
                                t.getTeamId(),
                                t.getTeamName() != null ? t.getTeamName() : "Unknown",
                                "N/A", null, "N/A",
                                t.getStatus() != null ? t.getStatus() : "unknown",
                                List.of(), 3);
                    }
                })
                .collect(Collectors.toList());

        return new AllTeamsReportResponse(teamList, LocalDate.now().toString(), teamList.size());
    }

    // =========================================================================
    // PDF REPORT GENERATION
    // =========================================================================

    @Transactional(readOnly = true)
    public byte[] generateAllTeamsReportPdf(long departmentId) {
        try {
            System.out.println("[CoordinatorService] 📄 Generating PDF report for department: " + departmentId);
            Department department = departmentrepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Department not found"));

            List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentId);
            
            org.apache.pdfbox.pdmodel.PDDocument document = new org.apache.pdfbox.pdmodel.PDDocument();
            org.apache.pdfbox.pdmodel.PDPage page = new org.apache.pdfbox.pdmodel.PDPage(org.apache.pdfbox.pdmodel.common.PDRectangle.A4);
            document.addPage(page);

            org.apache.pdfbox.pdmodel.PDPageContentStream contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page);

            float margin = 20;
            float yStart = page.getMediaBox().getHeight() - margin;
            float yPosition = yStart;
            float tableWidth = page.getMediaBox().getWidth() - 2 * margin;

            // Header Background
            contentStream.setNonStrokingColor(new java.awt.Color(217, 225, 242));
            contentStream.addRect(margin, yPosition - 40, tableWidth, 40);
            contentStream.fill();
            
            contentStream.setNonStrokingColor(java.awt.Color.BLACK);
            contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 12);
            
            String title1 = department.getDepartmentName() + " - Teams Report";
            String title2 = "Group, Mentor, Title of the project";
            
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 5, yPosition - 15);
            contentStream.showText(title1);
            contentStream.endText();
            
            contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 10);
            contentStream.beginText();
            contentStream.newLineAtOffset(margin + 5, yPosition - 30);
            contentStream.showText(title2);
            contentStream.endText();

            yPosition -= 55;

            // Table Header Background
            contentStream.setNonStrokingColor(new java.awt.Color(217, 225, 242));
            contentStream.addRect(margin, yPosition - 20, tableWidth, 20);
            contentStream.fill();

            // Table Header Borders & Text
            float[] colWidths = { 30, 50, 65, 50, 65, 50, 65, 100, 80 }; 
            String[] headers = { "Grp", "Roll 1", "Name 1", "Roll 2", "Name 2", "Roll 3", "Name 3", "Topic", "Guide" };
            
            float xPos = margin;
            contentStream.setNonStrokingColor(java.awt.Color.BLACK);
            contentStream.setStrokingColor(java.awt.Color.BLACK);
            contentStream.setLineWidth(1f);
            
            contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA_BOLD, 7);
            
            for (int i = 0; i < headers.length; i++) {
                contentStream.addRect(xPos, yPosition - 20, colWidths[i], 20);
                contentStream.stroke();
                contentStream.beginText();
                contentStream.newLineAtOffset(xPos + 2, yPosition - 13);
                contentStream.showText(headers[i]);
                contentStream.endText();
                xPos += colWidths[i];
            }
            yPosition -= 20;

            // Table Rows
            contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 6);
            
            for (int i = 0; i < allTeams.size(); i++) {
                if (yPosition < 40) {
                    contentStream.close();
                    page = new org.apache.pdfbox.pdmodel.PDPage(org.apache.pdfbox.pdmodel.common.PDRectangle.A4);
                    document.addPage(page);
                    contentStream = new org.apache.pdfbox.pdmodel.PDPageContentStream(document, page);
                    yPosition = yStart;
                    contentStream.setFont(org.apache.pdfbox.pdmodel.font.PDType1Font.HELVETICA, 6);
                }
                
                Team team = allTeams.get(i);
                List<com.zepro.model.Student> members = team.getMembers();
                if (members == null) members = new java.util.ArrayList<>();
                
                String r1="", n1="", r2="", n2="", r3="", n3="";
                if (members.size() > 0 && members.get(0).getUser() != null) { r1 = extractRoll(members.get(0).getUser().getEmail()); n1 = members.get(0).getUser().getName(); }
                if (members.size() > 1 && members.get(1).getUser() != null) { r2 = extractRoll(members.get(1).getUser().getEmail()); n2 = members.get(1).getUser().getName(); }
                if (members.size() > 2 && members.get(2).getUser() != null) { r3 = extractRoll(members.get(2).getUser().getEmail()); n3 = members.get(2).getUser().getName(); }
                
                String topic = team.getTeamName() != null ? team.getTeamName() : "";
                String guide = team.getFaculty() != null && team.getFaculty().getUser() != null ? team.getFaculty().getUser().getName() : "";
                
                String[] rowData = { String.valueOf(team.getTeamId()), limitText(r1, 50), limitText(n1, 65), limitText(r2, 50), limitText(n2, 65), limitText(r3, 50), limitText(n3, 65), limitText(topic, 100), limitText(guide, 80) };
                
                xPos = margin;
                for (int j = 0; j < rowData.length; j++) {
                    contentStream.setStrokingColor(java.awt.Color.BLACK);
                    contentStream.addRect(xPos, yPosition - 20, colWidths[j], 20);
                    contentStream.stroke();
                    contentStream.setNonStrokingColor(new java.awt.Color(192, 0, 0));
                    contentStream.beginText();
                    contentStream.newLineAtOffset(xPos + 2, yPosition - 13);
                    contentStream.showText(rowData[j]);
                    contentStream.endText();
                    xPos += colWidths[j];
                }
                yPosition -= 20;
            }

            contentStream.close();
            java.io.ByteArrayOutputStream baos = new java.io.ByteArrayOutputStream();
            document.save(baos);
            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Generated PDF Error: " + e.getMessage());
        }
    }

    private String limitText(String text, float widthConstraint) {
        if (text == null || text.trim().isEmpty()) return "";
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
        if(email == null) return "";
        return email.split("@")[0].toUpperCase();
    }

    // =========================================================================
    // RULES TAB
    // =========================================================================

    @Transactional
    public void saveRules(SaveRulesRequest request) {
        if (request.getMaxTeamSize() <= 0)
            throw new RuntimeException("Max team size must be greater than 0");
        if (request.getMaxStudentsPerFaculty() <= 0)
            throw new RuntimeException("Max students per faculty must be greater than 0");
        if (request.getMaxProjectsPerFaculty() <= 0)
            throw new RuntimeException("Max projects per faculty must be greater than 0");

        Long departmentId = request.getDepartmentId();
        Department dept = departmentrepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));

        System.out.println("[CoordinatorService] 💾 Saving rules for department: " + departmentId);
        System.out.println("[CoordinatorService] maxTeamSize: " + request.getMaxTeamSize());
        System.out.println("[CoordinatorService] maxStudentsPerFaculty: " + request.getMaxStudentsPerFaculty());
        System.out.println("[CoordinatorService] maxProjectsPerFaculty: " + request.getMaxProjectsPerFaculty());

        AllocationRules rules = allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println("[CoordinatorService] ⚠️  No existing rules found for department: "
                            + departmentId + ", creating new...");
                    AllocationRules newRules = new AllocationRules();
                    newRules.setMaxTeamSize(request.getMaxTeamSize());
                    newRules.setMaxStudentsPerFaculty(request.getMaxStudentsPerFaculty());
                    newRules.setMaxProjectsPerFaculty(request.getMaxProjectsPerFaculty());
                    return newRules;
                });
        rules.setMaxTeamSize(request.getMaxTeamSize());
        rules.setMaxStudentsPerFaculty(request.getMaxStudentsPerFaculty());
        rules.setMaxProjectsPerFaculty(request.getMaxProjectsPerFaculty());
        rules.setDepartment(dept);
        rules.setMaxSlotsPerProject(request.getMaxTeamSize());
        allocationRulesRepository.save(rules);

        System.out.println("[CoordinatorService] ✅ Rules saved for department: " + departmentId);

        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] 🔄 Updating " + departmentFaculties.size()
                + " faculties in department " + departmentId);

        departmentFaculties.forEach(f -> {
            f.setMaxStudents(request.getMaxStudentsPerFaculty());
            facultyRepository.save(f);
        });

        System.out.println(
                "[CoordinatorService] ✅ Updated " + departmentFaculties.size() + " faculties with maxStudents = "
                        + request.getMaxStudentsPerFaculty());
    }

    // =========================================================================
    // DEADLINES TAB
    // =========================================================================

    public DepartmentDeadlinesDTO getDeadlines(Long departmentId) {
        DepartmentDeadlines deadlines = departmentDeadlinesRepository.findByDepartment_DepartmentId(departmentId)
                .orElse(new DepartmentDeadlines());

        DepartmentDeadlinesDTO dto = new DepartmentDeadlinesDTO();
        dto.setTeamFormationDeadline(deadlines.getTeamFormationDeadline());
        dto.setMeetingSchedulingDeadline(deadlines.getMeetingSchedulingDeadline());
        return dto;
    }

    @Transactional
    public void saveDeadlines(Long departmentId, DepartmentDeadlinesDTO request) {
        Department dept = departmentrepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));

        DepartmentDeadlines deadlines = departmentDeadlinesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    DepartmentDeadlines newObj = new DepartmentDeadlines();
                    newObj.setDepartment(dept);
                    return newObj;
                });

        deadlines.setTeamFormationDeadline(request.getTeamFormationDeadline());
        deadlines.setMeetingSchedulingDeadline(request.getMeetingSchedulingDeadline());

        departmentDeadlinesRepository.save(deadlines);
        System.out.println("[CoordinatorService] ✅ Deadlines saved for department: " + departmentId);

        // ✅ ASYNC EMAIL DISPATCH
        if (request.getTeamFormationDeadline() != null) {
            List<String> studentEmails = studentRepository.findByDepartment_DepartmentId(departmentId)
                    .stream()
                    .filter(s -> s.getUser() != null && s.getUser().getEmail() != null)
                    .map(s -> s.getUser().getEmail())
                    .toList();

            emailService.sendDeadlineNotification(
                    studentEmails,
                    "Student",
                    "Team Formation Deadline",
                    "The Faculty Coordinator has set a strict deadline for forming your teams.",
                    request.getTeamFormationDeadline());
        }

        if (request.getMeetingSchedulingDeadline() != null) {
            List<String> facultyEmails = facultyRepository.findByDepartment_DepartmentId(departmentId)
                    .stream()
                    .filter(f -> f.getUser() != null && f.getUser().getEmail() != null)
                    .map(f -> f.getUser().getEmail())
                    .toList();

            emailService.sendDeadlineNotification(
                    facultyEmails,
                    "Faculty",
                    "Meeting Scheduling Deadline",
                    "The Faculty Coordinator has updated the latest allowed date for scheduling student meetings.",
                    request.getMeetingSchedulingDeadline());
        }
    }

    // =========================================================================
    // PRIVATE MAPPERS
    // =========================================================================

    private CoordinatorFacultyResponse mapToFacultyResponse(Faculty f) {
        String deptName = (f.getDepartment() != null) ? f.getDepartment().getDepartmentName() : "N/A";
        int allocatedCount = (int) studentRepository.countByAllocatedFaculty(f);

        Long departmentId = f.getDepartment() != null ? f.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);

        int totalCreatedSlots = projectRepository.findByFacultyFacultyId(f.getFacultyId()).size()
                * rules.getMaxTeamSize();

        return new CoordinatorFacultyResponse(f.getFacultyId(), f.getUser().getName(),
                f.getUser().getEmail(), deptName, rules.getMaxStudentsPerFaculty(), allocatedCount,
                totalCreatedSlots, f.getSpecialization());
    }

    private CoordinatorStudentResponse mapToStudentResponse(Student s) {
        Long allocatedFacultyId = null;
        String allocatedFacultyName = null;
        if (s.getAllocatedFaculty() != null) {
            allocatedFacultyId = s.getAllocatedFaculty().getFacultyId();
            allocatedFacultyName = s.getAllocatedFaculty().getUser().getName();
        }
        Long teamId = (s.getTeam() != null) ? s.getTeam().getTeamId() : null;
        String deptName = (s.getDepartment() != null) ? s.getDepartment().getDepartmentName() : "N/A";
        return new CoordinatorStudentResponse(s.getStudentId(), s.getUser().getName(),
                s.getRollNumber() != null ? s.getRollNumber() : "N/A", s.getUser().getEmail(),
                deptName, s.getYear(), s.getCgpa(), s.isAllocated(),
                allocatedFacultyId, allocatedFacultyName, teamId);
    }

    private CoordinatorTeamResponse mapToTeamResponse(Team t) {

        try {
            Project project = projectRepository.findByTeam(t);
            String projectTitle = (project != null) ? project.getTitle() : "N/A";

            Faculty faculty = t.getFaculty();
            Long facultyId = (faculty != null) ? faculty.getFacultyId() : null;
            String facultyName = (faculty != null) ? faculty.getUser().getName() : "Not Assigned";

            Long teamLeadId = (t.getTeamLead() != null) ? t.getTeamLead().getStudentId() : null;

            List<TeamMemberInfo> members = (t.getMembers() != null)
                    ? t.getMembers().stream()
                            .map(s -> new TeamMemberInfo(
                                    s.getUser().getName(),
                                    s.getRollNumber(),
                                    s.getUser().getEmail(),
                                    s.getCgpa(),
                                    s.getStudentId().equals(teamLeadId),
                                    facultyName))
                            .collect(Collectors.toList())
                    : new java.util.ArrayList<>();

            Long departmentId = faculty != null && faculty.getDepartment() != null
                    ? faculty.getDepartment().getDepartmentId()
                    : 1L;
            AllocationRules rules = getAllocationRulesByDepartment(departmentId);
            int teamSlots = rules.getMaxTeamSize();

            return new CoordinatorTeamResponse(
                    t.getTeamId(),
                    t.getTeamName(),
                    projectTitle,
                    facultyId,
                    facultyName,
                    t.getStatus(),
                    members,
                    teamSlots);
        } catch (Exception e) {
            System.out.println("Error mapping team " + t.getTeamId() + ": " + e.getMessage());
            return new CoordinatorTeamResponse(
                    t.getTeamId(),
                    t.getTeamName(),
                    "N/A", null, "N/A", t.getStatus(),
                    new java.util.ArrayList<>(), 3);
        }
    }

    private void updateFacultyAllocationCount(Faculty faculty) {
        int currentCount = (int) studentRepository.countByAllocatedFaculty(faculty);
        faculty.setAllocatedStudents(currentCount);
        facultyRepository.save(faculty);
    }

    // ✅ NEW: GET STUDENT AND TEAM DETAILS FOR DEPARTMENT
    @Transactional(readOnly = true)
    public StudentTeamDetailsDTO getStudentAndTeamDetails(Long departmentId) {
        System.out.println("[CoordinatorService] 📋 Fetching student and team details for department: " + departmentId);

        // Get all teams in department
        List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentId);
        List<CoordinatorTeamDetailDTO> teamDetails = allTeams.stream()
                .map(team -> {
                    Project project = projectRepository.findByTeam(team);
                    String projectTitle = (project != null) ? project.getTitle() : "N/A";

                    Faculty faculty = team.getFaculty();
                    Long facultyId = (faculty != null) ? faculty.getFacultyId() : null;
                    String facultyName = (faculty != null) ? faculty.getUser().getName() : "Not Assigned";

                    List<String> memberNames = (team.getMembers() != null)
                            ? team.getMembers().stream().map(s -> s.getUser().getName()).toList()
                            : List.of();

                    Long deptId = faculty != null && faculty.getDepartment() != null
                            ? faculty.getDepartment().getDepartmentId()
                            : 1L;
                    AllocationRules rules = getAllocationRulesByDepartment(deptId);

                    return new CoordinatorTeamDetailDTO(
                            team.getTeamId(),
                            team.getTeamName(),
                            projectTitle,
                            facultyId,
                            facultyName,
                            team.getStatus(),
                            memberNames,
                            team.getMembers() != null ? team.getMembers().size() : 0,
                            rules.getMaxTeamSize());
                }).collect(Collectors.toList());

        // Get all unallocated students in department (not in any team)
        List<CoordinatorStudentResponse> unallocatedStudents = studentRepository
                .findByDepartment_DepartmentId(departmentId)
                .stream()
                .filter(student -> student.getTeam() == null)
                .map(this::mapToStudentResponse)
                .collect(Collectors.toList());

        System.out.println("[CoordinatorService] ✅ Found " + teamDetails.size() + " teams and "
                + unallocatedStudents.size() + " unallocated students");

        return new StudentTeamDetailsDTO(teamDetails, unallocatedStudents);
    }

    // ✅ NEW: GET AVAILABLE TEAMS TO JOIN (NOT FULL)
    @Transactional(readOnly = true)
    public List<CoordinatorTeamDetailDTO> getAvailableTeamsToJoin(Long departmentId) {
        System.out.println("[CoordinatorService] 📋 Fetching available teams to join for department: " + departmentId);

        List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentId);

        List<CoordinatorTeamDetailDTO> availableTeams = allTeams.stream()
                .filter(team -> team.getMembers() != null && !team.getMembers().isEmpty())
                .map(team -> {
                    Long deptId = team.getFaculty() != null && team.getFaculty().getDepartment() != null
                            ? team.getFaculty().getDepartment().getDepartmentId()
                            : 1L;
                    AllocationRules rules = getAllocationRulesByDepartment(deptId);

                    int memberCount = team.getMembers().size();
                    int maxSlots = rules.getMaxTeamSize();

                    // Only map teams that are not full
                    if (memberCount < maxSlots) {
                        Project project = projectRepository.findByTeam(team);
                        String projectTitle = (project != null) ? project.getTitle() : "N/A";

                        Faculty faculty = team.getFaculty();
                        Long facultyId = (faculty != null) ? faculty.getFacultyId() : null;
                        String facultyName = (faculty != null) ? faculty.getUser().getName() : "Not Assigned";

                        List<String> memberNames = team.getMembers().stream()
                                .map(s -> s.getUser().getName())
                                .toList();

                        return new CoordinatorTeamDetailDTO(
                                team.getTeamId(),
                                team.getTeamName(),
                                projectTitle,
                                facultyId,
                                facultyName,
                                team.getStatus(),
                                memberNames,
                                memberCount,
                                maxSlots);
                    }
                    return null;
                })
                .filter(dto -> dto != null)
                .collect(Collectors.toList());

        System.out.println("[CoordinatorService] ✅ Found " + availableTeams.size() + " available teams to join");
        return availableTeams;
    }

    // ✅ NEW: GET FACULTY PROJECTS (OPEN OR IN_PROGRESS)
    @Transactional(readOnly = true)
    public List<FacultyProjectDTO> getFacultyProjects(Long facultyId) {
        System.out.println("[CoordinatorService] 📋 Fetching projects for faculty: " + facultyId);

        List<Project> projects = projectRepository.findByFacultyFacultyId(facultyId)
                .stream()
                .filter(p -> p.getIsActive() &&
                        ("OPEN".equals(p.getStatus()) || "IN_PROGRESS".equals(p.getStatus())))
                .collect(Collectors.toList());

        List<FacultyProjectDTO> projectDTOs = projects.stream()
                .map(p -> new FacultyProjectDTO(
                        p.getProjectId(),
                        p.getTitle(),
                        p.getStatus(),
                        p.getStudentSlots()))
                .collect(Collectors.toList());

        System.out.println("[CoordinatorService] ✅ Found " + projectDTOs.size() + " projects");
        return projectDTOs;
    }

    // ✅ NEW: ALLOCATE TEAM TO FACULTY AND PROJECT
    @Transactional
    public void allocateTeamToFacultyProject(AllocateTeamRequest request) {
        System.out.println("[CoordinatorService] 📌 Allocating team: " + request.getTeamId()
                + " to faculty: " + request.getFacultyId() + " and project: " + request.getProjectId());

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        Faculty faculty = facultyRepository.findById(request.getFacultyId())
                .orElseThrow(() -> new RuntimeException("Faculty not found"));

        Project project = projectRepository.findById(request.getProjectId())
                .orElseThrow(() -> new RuntimeException("Project not found"));

        // Set team faculty and status
        team.setFaculty(faculty);
        team.setStatus("ASSIGNED");
        teamRepository.save(team);

        // ✅ If project is IN_PROGRESS, cancel all pending requests for team members
        if ("IN_PROGRESS".equals(project.getStatus())) {
            System.out.println(
                    "[CoordinatorService] ⚠️  Project is IN_PROGRESS. Cancelling all pending team join requests for team members...");

            String rejectionReason = "Allocated to other team by FC";
            int rejectedCount = 0;

            // Get all team members
            if (team.getMembers() != null && !team.getMembers().isEmpty()) {
                for (Student teamMember : team.getMembers()) {
                    System.out.println(
                            "[CoordinatorService] 🧑 Processing team member: " + teamMember.getUser().getName());

                    // Find all PENDING requests for this student
                    List<TeamJoinRequest> pendingRequests = teamJoinRequestRepository
                            .findByStudentStudentIdAndStatus(teamMember.getStudentId(), "PENDING");

                    System.out.println("[CoordinatorService] 📋 Found " + pendingRequests.size()
                            + " pending requests for student: " + teamMember.getUser().getName());

                    for (TeamJoinRequest joinRequest : pendingRequests) {
                        joinRequest.setStatus("REJECTED");
                        joinRequest.setRejectionReason(rejectionReason);
                        teamJoinRequestRepository.save(joinRequest);

                        System.out.println("[CoordinatorService] ❌ Rejected request ID: " + joinRequest.getRequestId()
                                + " for team: " + joinRequest.getTeam().getTeamName()
                                + " | Reason: " + rejectionReason);

                        rejectedCount++;
                    }
                }
            }

            System.out.println("[CoordinatorService] ✅ Total rejected: " + rejectedCount + " pending requests");

            // Keep project status as IN_PROGRESS
            project.setStatus("IN_PROGRESS");
            projectRepository.save(project);

        } else if ("OPEN".equals(project.getStatus())) {
            System.out.println("[CoordinatorService] 🟢 Project is OPEN. Setting status to ASSIGNED");
            project.setStatus("ASSIGNED");
            projectRepository.save(project);

        } else {
            System.out.println(
                    "[CoordinatorService] ℹ️  Project status is: " + project.getStatus() + ". Keeping it unchanged");
            projectRepository.save(project);
        }

        // Mark all team members as allocated
        if (team.getMembers() != null && !team.getMembers().isEmpty()) {
            System.out.println(
                    "[CoordinatorService] 📊 Marking " + team.getMembers().size() + " team members as allocated");

            for (Student student : team.getMembers()) {
                student.setAllocated(true);
                student.setAllocatedFaculty(faculty);
                student.setAllocatedProject(project);
                studentRepository.save(student);

                System.out.println(
                        "[CoordinatorService] ✅ Student " + student.getUser().getName() + " marked as allocated");
            }
        }

        System.out.println("[CoordinatorService] ✅ Team allocated successfully to project: " + project.getTitle());
    }

    // ✅ NEW: CREATE TEAM FOR STUDENT
    @Transactional
    public CoordinatorTeamDetailDTO createTeamForStudent(CreateTeamRequest request, Long departmentId) {
        System.out.println("[CoordinatorService] 🆕 Creating new team: " + request.getTeamName());

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getTeam() != null) {
            throw new RuntimeException("Student is already in a team");
        }

        // Create new team
        Team newTeam = new Team();
        newTeam.setTeamName(request.getTeamName());
        newTeam.setStatus("ACTIVE");
        newTeam.setMembers(new java.util.ArrayList<>());
        newTeam.getMembers().add(student);
        newTeam.setTeamLead(student);
        Department dept = departmentrepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found"));
        newTeam.setDepartment(dept);
        Team savedTeam = teamRepository.save(newTeam);

        // Add student to team
        student.setTeam(savedTeam);
        studentRepository.save(student);

        System.out.println("[CoordinatorService] ✅ Team created: " + savedTeam.getTeamId());

        // Return team details
        Project project = projectRepository.findByTeam(savedTeam);
        String projectTitle = (project != null) ? project.getTitle() : "N/A";

        Long deptId = departmentId;
        AllocationRules rules = getAllocationRulesByDepartment(deptId);

        return new CoordinatorTeamDetailDTO(
                savedTeam.getTeamId(),
                savedTeam.getTeamName(),
                projectTitle,
                null,
                "Not Assigned",
                savedTeam.getStatus(),
                java.util.List.of(student.getUser().getName()),
                1,
                rules.getMaxTeamSize());
    }

    // ✅ NEW: JOIN EXISTING TEAM
    @Transactional
    public CoordinatorTeamDetailDTO joinTeam(JoinTeamRequest request, Long departmentId) {
        System.out.println("[CoordinatorService] 👥 Student " + request.getStudentId()
                + " joining team " + request.getTeamId());

        Student student = studentRepository.findById(request.getStudentId())
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (student.getTeam() != null) {
            throw new RuntimeException("Student is already in a team");
        }

        Team team = teamRepository.findById(request.getTeamId())
                .orElseThrow(() -> new RuntimeException("Team not found"));

        // Check if team is full
        Long deptId = departmentId;
        AllocationRules rules = getAllocationRulesByDepartment(deptId);

        int currentMembers = team.getMembers() != null ? team.getMembers().size() : 0;
        if (currentMembers >= rules.getMaxTeamSize()) {
            throw new RuntimeException("Team is full. Cannot add more members. (Max: " + rules.getMaxTeamSize() + ")");
        }

        // Add student to team
        if (team.getMembers() == null) {
            team.setMembers(new java.util.ArrayList<>());
        }
        team.getMembers().add(student);
        Team updatedTeam = teamRepository.save(team);

        student.setTeam(updatedTeam);
        studentRepository.save(student);

        System.out.println("[CoordinatorService] ✅ Student joined team: " + team.getTeamName());

        // Return updated team details
        Project project = projectRepository.findByTeam(updatedTeam);
        String projectTitle = (project != null) ? project.getTitle() : "N/A";

        Faculty faculty = updatedTeam.getFaculty();
        Long facultyId = (faculty != null) ? faculty.getFacultyId() : null;
        String facultyName = (faculty != null) ? faculty.getUser().getName() : "Not Assigned";

        List<String> memberNames = updatedTeam.getMembers().stream()
                .map(s -> s.getUser().getName())
                .toList();

        return new CoordinatorTeamDetailDTO(
                updatedTeam.getTeamId(),
                updatedTeam.getTeamName(),
                projectTitle,
                facultyId,
                facultyName,
                updatedTeam.getStatus(),
                memberNames,
                updatedTeam.getMembers().size(),
                rules.getMaxTeamSize());
    }
}