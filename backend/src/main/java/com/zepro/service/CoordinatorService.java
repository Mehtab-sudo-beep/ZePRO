package com.zepro.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.ColorConstants;
import com.itextpdf.kernel.colors.DeviceRgb;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.geom.PageSize;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.borders.Border;
import com.itextpdf.layout.borders.SolidBorder;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import com.zepro.dto.facultycoordinator.AllTeamsReportResponse;
import com.zepro.dto.facultycoordinator.AllocateStudentRequest;
import com.zepro.dto.facultycoordinator.AllocationRulesResponse;
import com.zepro.dto.facultycoordinator.CoordinatorFacultyResponse;
import com.zepro.dto.facultycoordinator.CoordinatorStudentResponse;
import com.zepro.dto.facultycoordinator.CoordinatorTeamResponse;
import com.zepro.dto.facultycoordinator.DashboardStatsResponse;
import com.zepro.dto.facultycoordinator.OverrideAllocationRequest;
import com.zepro.dto.facultycoordinator.SaveRulesRequest;
import com.zepro.dto.facultycoordinator.TeamMemberInfo;
import com.zepro.model.*;
import com.zepro.repository.*;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CoordinatorService {

    private final StudentRepository studentRepository;
    private final FacultyRepository facultyRepository;
    private final TeamRepository teamRepository;
    private final ProjectRepository projectRepository;
    private final AllocationRulesRepository allocationRulesRepository;
        private final DepartmentRepository departmentrepository;

    public CoordinatorService(StudentRepository studentRepository,
            FacultyRepository facultyRepository,
            TeamRepository teamRepository,
            ProjectRepository projectRepository,
            AllocationRulesRepository allocationRulesRepository,
            DepartmentRepository departmentrepository) {
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
        this.teamRepository = teamRepository;
        this.projectRepository = projectRepository;
        this.allocationRulesRepository = allocationRulesRepository;
        this.departmentrepository = departmentrepository;
    }

    // ✅ GET ALLOCATION RULES BY DEPARTMENT
    private AllocationRules getAllocationRulesByDepartment(Long departmentId) {
        System.out.println("[CoordinatorService] 📋 Fetching allocation rules for department: " + departmentId);
        return allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println("[CoordinatorService] ⚠️  No rules found for dept " + departmentId + ", using defaults");
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
                    System.out.println("[CoordinatorService] ⚠️  No rules found for dept " + departmentId + ", using defaults");
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
            rules.getMaxProjectsPerFaculty()
        );
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

        // ✅ CHANGED: Get department-specific rule for department dashboard
        // AllocationRules rules = allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
        //         .orElseGet(() -> {
        //             System.out.println("[CoordinatorService] ⚠️  No rules found for dept " + departmentId + ", using defaults");
        //             AllocationRules defaults = new AllocationRules();
        //             defaults.setMaxStudentsPerFaculty(10);
        //             return defaults;
        //         });
        // int globalMaxPerFaculty = rules.getMaxStudentsPerFaculty();
        // long totalMaxSlots = totalFaculty * globalMaxPerFaculty;
        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] 📌 Fetching active projects for " + departmentFaculties.size() + " faculties");

        // Get all ACTIVE projects from these faculties and sum their student slots
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
        
        // ✅ Get all faculties in the department
        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] Total faculties in department: " + departmentFaculties.size());
        
        // ✅ Filter by search query
        List<CoordinatorFacultyResponse> results = departmentFaculties.stream()
                .filter(faculty -> 
                    faculty.getUser().getName().toLowerCase().contains(query.toLowerCase()) ||
                    faculty.getUser().getEmail().toLowerCase().contains(query.toLowerCase()) ||
                    faculty.getEmployeeId().toLowerCase().contains(query.toLowerCase())
                )
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

        // ✅ CHANGED: Use Department-specific rules
        Long departmentId = faculty.getDepartment() != null ? faculty.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);
        
        System.out.println("[CoordinatorService] 📊 Allocation rules for dept " + departmentId + ": maxStudents=" + rules.getMaxStudentsPerFaculty());

        if (faculty.getAllocatedStudents() >= rules.getMaxStudentsPerFaculty()) {
            throw new RuntimeException(
                    "No slots available for faculty: " + faculty.getUser().getName() +
                    " (Limit: " + rules.getMaxStudentsPerFaculty() + ")");
        }

        // ── Update student ───────────────────────────────────────────────────
        student.setAllocated(true);
        student.setAllocatedFaculty(faculty);
        studentRepository.save(student);

        // ── Update faculty slot count ────────────────────────────────────────
        updateFacultyAllocationCount(faculty);

        // ── Update team's guide if student is in a team ──────────────────────
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

        // ✅ CHANGED: Use Department-specific rules
        Long departmentId = newFaculty.getDepartment() != null ? newFaculty.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);
        
        System.out.println("[CoordinatorService] 📊 Override allocation rules for dept " + departmentId + ": maxStudents=" + rules.getMaxStudentsPerFaculty());

        if (newFaculty.getAllocatedStudents() >= rules.getMaxStudentsPerFaculty()) {
            throw new RuntimeException(
                    "No slots available for faculty: " + newFaculty.getUser().getName() +
                    " (Limit: " + rules.getMaxStudentsPerFaculty() + ")");
        }

        // ── Update faculty slot counts ───────────────────────────────────────
        updateFacultyAllocationCount(oldFaculty);
        updateFacultyAllocationCount(newFaculty);

        // ── Update student ───────────────────────────────────────────────────
        student.setAllocatedFaculty(newFaculty);
        studentRepository.save(student);

        // ── Update team's guide if student is in a team ──────────────────────
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
            
            // ✅ GET DEPARTMENT NAME
            Department department = departmentrepository.findById(departmentId)
                    .orElseThrow(() -> new RuntimeException("Department not found"));
            
            String departmentName = department.getDepartmentName();
            System.out.println("[CoordinatorService] 🏛️  Department: " + departmentName);

            DeviceRgb indigo = new DeviceRgb(79, 70, 229);
            DeviceRgb indigoLight = new DeviceRgb(238, 242, 255);
            DeviceRgb rowAlt = new DeviceRgb(249, 250, 251);
            DeviceRgb borderGray = new DeviceRgb(229, 231, 235);
            DeviceRgb textDark = new DeviceRgb(31, 41, 55);
            DeviceRgb textMuted = new DeviceRgb(107, 114, 128);

            PdfFont regular = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont bold = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfDocument pdfDoc = new PdfDocument(new PdfWriter(baos));
            Document document = new Document(pdfDoc, PageSize.A4);
            document.setMargins(36, 36, 36, 36);

            // ── Banner with Department Name ────────────────────────────────────
            Table banner = new Table(UnitValue.createPercentArray(new float[] { 1 }))
                    .useAllAvailableWidth().setBackgroundColor(indigo)
                    .setBorder(Border.NO_BORDER).setMarginBottom(20);
            banner.addCell(new Cell()
                    .add(new Paragraph("ALL TEAMS PROJECT REPORT")
                            .setFont(bold).setFontSize(20)
                            .setFontColor(ColorConstants.WHITE)
                            .setTextAlignment(TextAlignment.CENTER).setMarginBottom(4))
                    .add(new Paragraph("Department: " + departmentName)  // ✅ ADD DEPARTMENT NAME
                            .setFont(regular).setFontSize(11)
                            .setFontColor(ColorConstants.WHITE)
                            .setTextAlignment(TextAlignment.CENTER).setMarginBottom(4))
                    .add(new Paragraph("Generated on: " +
                            LocalDate.now().format(
                                    DateTimeFormatter.ofPattern("dd MMMM yyyy")))
                            .setFont(regular).setFontSize(10)
                            .setFontColor(ColorConstants.WHITE)
                            .setTextAlignment(TextAlignment.CENTER))
                    .setBorder(Border.NO_BORDER).setPadding(20));
            document.add(banner);

            // ── Get Department Teams ───────────────────────────────────────────
            List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentId);
            System.out.println("[CoordinatorService] 👥 Total teams in department: " + allTeams.size());

            List<CoordinatorTeamResponse> teams = allTeams.stream()
                    .map(this::mapToTeamResponse)
                    .collect(Collectors.toList());

            // ✅ CALCULATE DYNAMIC SUMMARY STATS
            long activeCount = teams.stream()
                    .filter(t -> "active".equalsIgnoreCase(t.getStatus()))
                    .count();
            
            long totalMembers = teams.stream()
                    .mapToLong(t -> t.getMembers() != null ? t.getMembers().size() : 0)
                    .sum();
            
            long allocatedCount = teams.stream()
                    .flatMap(t -> t.getMembers() != null ? t.getMembers().stream() : java.util.stream.Stream.empty())
                    .filter(m -> m.getAllocatedFacultyName() != null && !m.getAllocatedFacultyName().equals("Unallocated"))
                    .count();

            System.out.println("[CoordinatorService] 📊 Stats - Total: " + teams.size() + 
                             ", Active: " + activeCount + 
                             ", Members: " + totalMembers + 
                             ", Allocated: " + allocatedCount);

            // ── Summary Stats Table ────────────────────────────────────────────
            Table summary = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }))
                    .useAllAvailableWidth().setMarginBottom(24);
            summary.addCell(summaryCell("Total Teams", String.valueOf(teams.size()), bold, regular,
                    indigoLight, textDark));
            summary.addCell(summaryCell("Active Teams", String.valueOf(activeCount), bold, regular,
                    indigoLight, textDark));
            summary.addCell(summaryCell("Total Members", String.valueOf(totalMembers), bold, regular,
                    indigoLight, textDark));
            summary.addCell(summaryCell("Allocated", String.valueOf(allocatedCount), bold, regular,
                    indigoLight, textDark));
            document.add(summary);

            // ── One section per team ──────────────────────────────────────────
            for (int idx = 0; idx < teams.size(); idx++) {
                CoordinatorTeamResponse team = teams.get(idx);

                System.out.println("[CoordinatorService] 📌 Processing team " + (idx + 1) + ": " + team.getTeamName());

                Table teamHeader = new Table(UnitValue.createPercentArray(new float[] { 1 }))
                        .useAllAvailableWidth().setBackgroundColor(indigoLight)
                        .setBorder(new SolidBorder(indigo, 1)).setMarginTop(12)
                        .setMarginBottom(6);
                teamHeader.addCell(new Cell()
                        .add(new Paragraph("TEAM " + (idx + 1) + ":  " + team.getTeamName())
                                .setFont(bold).setFontSize(13).setFontColor(indigo))
                        .setBorder(Border.NO_BORDER).setPaddingLeft(10).setPaddingTop(8)
                        .setPaddingBottom(8));
                document.add(teamHeader);

                // ✅ DYNAMIC TEAM META DATA
                Table meta = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }))
                        .useAllAvailableWidth().setMarginBottom(6);
                meta.addCell(metaCell("Project Title", 
                        team.getProjectTitle() != null ? team.getProjectTitle() : "N/A", 
                        bold, regular, textDark, textMuted));
                meta.addCell(metaCell("Status",
                        team.getStatus() != null ? team.getStatus().toUpperCase() : "N/A", 
                        bold, regular, textDark, textMuted));
                meta.addCell(metaCell("Guide / Faculty",
                        team.getFacultyName() != null ? team.getFacultyName() : "Not Assigned", 
                        bold, regular, textDark, textMuted));
                meta.addCell(metaCell("Total Members",
                        String.valueOf(team.getMembers() != null ? team.getMembers().size() : 0),
                        bold, regular, textDark, textMuted));
                document.add(meta);

                // ✅ MEMBERS TABLE WITH DYNAMIC DATA
                List<TeamMemberInfo> members = team.getMembers();
                if (members != null && !members.isEmpty()) {
                    System.out.println("[CoordinatorService]    📝 Team has " + members.size() + " members");
                    
                    members.sort((a, b) -> Boolean.compare(b.isTeamLead(), a.isTeamLead()));

                    Table membersTable = new Table(UnitValue.createPercentArray(
                            new float[] { 0.4f, 2f, 1.2f, 2f, 0.8f, 2f }))
                            .useAllAvailableWidth().setMarginBottom(4);
                    
                    // ✅ HEADER ROW
                    for (String h : new String[] { "#", "Name", "Roll No", "Email", "CGPA",
                            "Allocated Faculty" }) {
                        membersTable.addHeaderCell(new Cell()
                                .add(new Paragraph(h).setFont(bold).setFontSize(9)
                                        .setFontColor(ColorConstants.WHITE))
                                .setBackgroundColor(indigo).setBorder(Border.NO_BORDER)
                                .setPadding(6));
                    }
                    
                    // ✅ DATA ROWS - DYNAMIC MEMBER DATA
                    DeviceRgb leaderBg = new DeviceRgb(255, 251, 235);
                    for (int mi = 0; mi < members.size(); mi++) {
                        TeamMemberInfo m = members.get(mi);
                        DeviceRgb rowBg = m.isTeamLead() ? leaderBg
                                : ((mi % 2 == 0) ? rowAlt : null);
                        
                        String nameDisplay = (m.getName() != null ? m.getName() : "N/A")
                                + (m.isTeamLead() ? "  ★ LEADER" : "");
                        
                        System.out.println("[CoordinatorService]       - Member " + (mi+1) + ": " + 
                                         m.getName() + " (Roll: " + m.getRollNo() + ")");
                        
                        membersTable.addCell(memberCell(String.valueOf(mi + 1), regular, 9,
                                textDark, borderGray, rowBg));
                        membersTable.addCell(
                                memberCell(nameDisplay, m.isTeamLead() ? bold : regular,
                                        9, textDark, borderGray, rowBg));
                        membersTable.addCell(memberCell(
                                m.getRollNo() != null ? m.getRollNo() : "N/A", 
                                regular, 9, textDark, borderGray, rowBg));
                        membersTable.addCell(memberCell(
                                m.getEmail() != null ? m.getEmail() : "N/A", 
                                regular, 8, textMuted, borderGray, rowBg));
                        membersTable.addCell(memberCell(
                                String.format("%.2f", m.getCgpa()), 
                                regular, 9, textDark, borderGray, rowBg));
                        membersTable.addCell(memberCell(
                                m.getAllocatedFacultyName() != null && !m.getAllocatedFacultyName().equals("Unallocated")
                                        ? m.getAllocatedFacultyName()
                                        : "⚠️  Unallocated",
                                regular, 9, 
                                m.getAllocatedFacultyName() != null && !m.getAllocatedFacultyName().equals("Unallocated") 
                                    ? textDark 
                                    : new DeviceRgb(220, 53, 69),  // Red for unallocated
                                borderGray, rowBg));
                    }
                    document.add(membersTable);
                } else {
                    System.out.println("[CoordinatorService]    ⚠️  No members in this team");
                    document.add(new Paragraph("No members assigned yet.")
                            .setFont(regular).setFontSize(9).setFontColor(textMuted)
                            .setMarginLeft(8).setMarginBottom(6));
                }
            }

            // ✅ FOOTER WITH GENERATION DETAILS
            document.add(new Paragraph("\n— End of Report —")
                    .setFont(regular).setFontSize(9).setFontColor(textMuted)
                    .setTextAlignment(TextAlignment.CENTER).setMarginTop(20));
            
            document.add(new Paragraph(
                    "This is an automatically generated report. " +
                    "Total Teams: " + teams.size() + 
                    " | Total Members: " + totalMembers +
                    " | Generated: " + LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                    .setFont(regular).setFontSize(8).setFontColor(textMuted)
                    .setTextAlignment(TextAlignment.CENTER));
            
            document.close();
            System.out.println("[CoordinatorService] ✅ PDF generated successfully for department: " + departmentName);
            return baos.toByteArray();

        } catch (Exception e) {
            System.out.println("[CoordinatorService] ❌ Error generating PDF: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    // ── PDF helper cells ──────────────────────────────────────────────────────

    private Cell summaryCell(String label, String value, PdfFont bold, PdfFont regular, DeviceRgb bg,
            DeviceRgb textDark) {
        return new Cell()
                .add(new Paragraph(value).setFont(bold).setFontSize(22).setFontColor(textDark))
                .add(new Paragraph(label).setFont(regular).setFontSize(10).setFontColor(textDark))
                .setBackgroundColor(bg).setBorder(Border.NO_BORDER).setPadding(14)
                .setTextAlignment(TextAlignment.CENTER);
    }

    private Cell metaCell(String label, String value, PdfFont bold, PdfFont regular, DeviceRgb textDark,
            DeviceRgb textMuted) {
        return new Cell()
                .add(new Paragraph(label).setFont(bold).setFontSize(9).setFontColor(textMuted))
                .add(new Paragraph(value).setFont(regular).setFontSize(11).setFontColor(textDark))
                .setBorder(Border.NO_BORDER).setPaddingLeft(4).setPaddingTop(4).setPaddingBottom(4);
    }

    private Cell memberCell(String text, PdfFont font, float size, DeviceRgb textColor, DeviceRgb borderColor,
            DeviceRgb bgColor) {
        Cell cell = new Cell()
                .add(new Paragraph(text != null ? text : "N/A").setFont(font).setFontSize(size)
                        .setFontColor(textColor))
                .setBorderBottom(new SolidBorder(borderColor, 0.5f))
                .setBorderTop(Border.NO_BORDER).setBorderLeft(Border.NO_BORDER)
                .setBorderRight(Border.NO_BORDER)
                .setPadding(5);
        if (bgColor != null)
            cell.setBackgroundColor(bgColor);
        return cell;
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

        // ✅ FIXED: Use department-specific rules instead of global ID=1
        Long departmentId = request.getDepartmentId();  // ✅ ADD THIS TO REQUEST
        Department dept=departmentrepository.findById(departmentId).orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));
        System.out.println("[CoordinatorService] 💾 Saving rules for department: " + departmentId);
        System.out.println("[CoordinatorService] maxTeamSize: " + request.getMaxTeamSize());
        System.out.println("[CoordinatorService] maxStudentsPerFaculty: " + request.getMaxStudentsPerFaculty());
        System.out.println("[CoordinatorService] maxProjectsPerFaculty: " + request.getMaxProjectsPerFaculty());

AllocationRules rules = allocationRulesRepository.findByDepartment_DepartmentId(departmentId)
                .orElseGet(() -> {
                    System.out.println("[CoordinatorService] ⚠️  No existing rules found for department: " + departmentId + ", creating new...");
                    AllocationRules newRules = new AllocationRules();
                    newRules.setMaxTeamSize(request.getMaxTeamSize());
                    newRules.setMaxStudentsPerFaculty(request.getMaxStudentsPerFaculty());
                    newRules.setMaxProjectsPerFaculty(request.getMaxProjectsPerFaculty());
                    return newRules;
                });        
        rules.setMaxTeamSize(request.getMaxTeamSize());
        rules.setMaxStudentsPerFaculty(request.getMaxStudentsPerFaculty());
        rules.setMaxProjectsPerFaculty(request.getMaxProjectsPerFaculty());
        rules.setDepartment(dept); // ✅ ASSOCIATE WITH DEPARTMENT
        allocationRulesRepository.save(rules);
        
        System.out.println("[CoordinatorService] ✅ Rules saved for department: " + departmentId);

        // ✅ Sync existing faculties in this department to the new slot limit
        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] 🔄 Updating " + departmentFaculties.size() + " faculties in department " + departmentId);
        
        departmentFaculties.forEach(f -> {
            f.setMaxStudents(request.getMaxStudentsPerFaculty());
            facultyRepository.save(f);
        });
        
        System.out.println("[CoordinatorService] ✅ Updated " + departmentFaculties.size() + " faculties with maxStudents = "
                + request.getMaxStudentsPerFaculty());
    }

    // =========================================================================
    // PRIVATE MAPPERS
    // =========================================================================

    private CoordinatorFacultyResponse mapToFacultyResponse(Faculty f) {
        String deptName = (f.getDepartment() != null) ? f.getDepartment().getDepartmentName() : "N/A";
        int allocatedCount = (int) studentRepository.countByAllocatedFaculty(f);
        
        // ✅ CHANGED: Use Department-specific rules instead of global
        Long departmentId = f.getDepartment() != null ? f.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);
        
        // ✅ Dynamic Created Slots count
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

            // Get team lead student id for comparison
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

            // ✅ CHANGED: Use Department-specific rules
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
}