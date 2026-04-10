package com.zepro.service;

import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.colors.Color;
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

import java.io.ByteArrayOutputStream;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

        List<Faculty> departmentFaculties = facultyRepository.findByDepartment_DepartmentId(departmentId);
        System.out.println("[CoordinatorService] 📌 Fetching active projects for " + departmentFaculties.size() + " faculties");

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

        Long departmentId = faculty.getDepartment() != null ? faculty.getDepartment().getDepartmentId() : 1L;
        AllocationRules rules = getAllocationRulesByDepartment(departmentId);
        
        System.out.println("[CoordinatorService] 📊 Allocation rules for dept " + departmentId + ": maxStudents=" + rules.getMaxStudentsPerFaculty());

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
        
        System.out.println("[CoordinatorService] 📊 Override allocation rules for dept " + departmentId + ": maxStudents=" + rules.getMaxStudentsPerFaculty());

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
            
            System.out.println("[CoordinatorService]   Department: " + department.getDepartmentName());
            
            List<Team> allTeams = teamRepository.findAllwithDetailsandDepartment_DepartmentId(departmentId);
            System.out.println("[CoordinatorService]  Total teams in department: " + allTeams.size());

            ByteArrayOutputStream baos = new ByteArrayOutputStream();
            PdfWriter writer = new PdfWriter(baos);
            PdfDocument pdfDocument = new PdfDocument(writer);
            Document document = new Document(pdfDocument, PageSize.A4);
            
            PdfFont titleFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);
            PdfFont regularFont = PdfFontFactory.createFont(StandardFonts.HELVETICA);
            PdfFont boldFont = PdfFontFactory.createFont(StandardFonts.HELVETICA_BOLD);

            DateTimeFormatter dateFormatter = DateTimeFormatter.ofPattern("dd-MM-yyyy");
            String generatedDate = LocalDate.now().format(dateFormatter);

            Color lightBlue = new DeviceRgb(230, 245, 255);
            Color darkText = new DeviceRgb(33, 33, 33);

            Paragraph header = new Paragraph("Teams Report")
                    .setFont(titleFont)
                    .setFontSize(24)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginBottom(10);
            document.add(header);

            Paragraph deptInfo = new Paragraph("Department: " + department.getDepartmentName())
                    .setFont(regularFont)
                    .setFontSize(12)
                    .setMarginBottom(5);
            document.add(deptInfo);

            Paragraph dateInfo = new Paragraph("Generated on: " + generatedDate)
                    .setFont(regularFont)
                    .setFontSize(10)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setMarginBottom(20);
            document.add(dateInfo);

            Table summaryTable = new Table(UnitValue.createPercentArray(new float[]{1, 1, 1, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            summaryTable.addCell(summaryCell("Total Teams", String.valueOf(allTeams.size()), 
                    boldFont, regularFont, lightBlue, darkText));
            
            int totalMembers = (int) allTeams.stream()
                    .mapToLong(team -> team.getMembers() != null ? team.getMembers().size() : 0)
                    .sum();
            summaryTable.addCell(summaryCell("Total Members", String.valueOf(totalMembers), 
                    boldFont, regularFont, lightBlue, darkText));
            
            long allocatedTeams = allTeams.stream()
                    .filter(team -> team.getFaculty() != null)
                    .count();
            summaryTable.addCell(summaryCell("Allocated Teams", String.valueOf(allocatedTeams), 
                    boldFont, regularFont, lightBlue, darkText));
            
            long unallocatedTeams = allTeams.size() - allocatedTeams;
            summaryTable.addCell(summaryCell("Unallocated Teams", String.valueOf(unallocatedTeams), 
                    boldFont, regularFont, lightBlue, darkText));
            
            document.add(summaryTable);

            Table teamTable = new Table(UnitValue.createPercentArray(new float[]{1, 2, 2, 2, 1}))
                    .useAllAvailableWidth()
                    .setMarginBottom(20);

            Color headerBg = new DeviceRgb(41, 128, 185);
            Color headerText = ColorConstants.WHITE;

            teamTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Team ID").setFont(boldFont).setFontColor(headerText))
                    .setBackgroundColor(headerBg)
                    .setPadding(10)
                    .setTextAlignment(TextAlignment.CENTER));

            teamTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Team Name").setFont(boldFont).setFontColor(headerText))
                    .setBackgroundColor(headerBg)
                    .setPadding(10));

            teamTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Guide").setFont(boldFont).setFontColor(headerText))
                    .setBackgroundColor(headerBg)
                    .setPadding(10));

            teamTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Members").setFont(boldFont).setFontColor(headerText))
                    .setBackgroundColor(headerBg)
                    .setPadding(10)
                    .setTextAlignment(TextAlignment.CENTER));

            teamTable.addHeaderCell(new Cell()
                    .add(new Paragraph("Status").setFont(boldFont).setFontColor(headerText))
                    .setBackgroundColor(headerBg)
                    .setPadding(10)
                    .setTextAlignment(TextAlignment.CENTER));

            Color altBg = new DeviceRgb(245, 248, 250);
            int rowCount = 0;
            
            for (Team team : allTeams) {
                rowCount++;
                Color rowBg = (rowCount % 2 == 0) ? altBg : null;

                Cell teamIdCell = new Cell()
                        .add(new Paragraph(String.valueOf(team.getTeamId()))
                                .setFont(regularFont)
                                .setFontSize(10))
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(8);
                if (rowBg != null) teamIdCell.setBackgroundColor(rowBg);
                teamTable.addCell(teamIdCell);

                Cell teamNameCell = new Cell()
                        .add(new Paragraph(team.getTeamName() != null ? team.getTeamName() : "N/A")
                                .setFont(regularFont)
                                .setFontSize(10))
                        .setPadding(8);
                if (rowBg != null) teamNameCell.setBackgroundColor(rowBg);
                teamTable.addCell(teamNameCell);

                String guideName = (team.getFaculty() != null) 
                        ? team.getFaculty().getUser().getName() 
                        : "Not Assigned";
                Cell guideCell = new Cell()
                        .add(new Paragraph(guideName)
                                .setFont(regularFont)
                                .setFontSize(10))
                        .setPadding(8);
                if (rowBg != null) guideCell.setBackgroundColor(rowBg);
                teamTable.addCell(guideCell);

                int memberCount = (team.getMembers() != null) ? team.getMembers().size() : 0;
                Cell memberCell = new Cell()
                        .add(new Paragraph(String.valueOf(memberCount))
                                .setFont(regularFont)
                                .setFontSize(10))
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(8);
                if (rowBg != null) memberCell.setBackgroundColor(rowBg);
                teamTable.addCell(memberCell);

                String status = team.getStatus() != null ? team.getStatus() : "UNKNOWN";
                Color statusColor = getStatusColor(status);
                Cell statusCell = new Cell()
                        .add(new Paragraph(status)
                                .setFont(regularFont)
                                .setFontSize(9)
                                .setFontColor(statusColor))
                        .setTextAlignment(TextAlignment.CENTER)
                        .setPadding(8);
                if (rowBg != null) statusCell.setBackgroundColor(rowBg);
                teamTable.addCell(statusCell);
            }

            document.add(teamTable);

            Paragraph footer = new Paragraph("This is an auto-generated report from ZePRO System")
                    .setFont(regularFont)
                    .setFontSize(8)
                    .setFontColor(ColorConstants.DARK_GRAY)
                    .setTextAlignment(TextAlignment.CENTER)
                    .setMarginTop(30);
            document.add(footer);

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            System.out.println("[CoordinatorService]  Error generating PDF: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to generate PDF report: " + e.getMessage(), e);
        }
    }

    // ✅ Helper method to get status color
    private Color getStatusColor(String status) {
        return switch (status) {
            case "ACTIVE" -> new DeviceRgb(46, 204, 113); // Green
            case "INACTIVE" -> new DeviceRgb(231, 76, 60); // Red
            case "PENDING" -> new DeviceRgb(241, 196, 15); // Yellow
            default -> new DeviceRgb(52, 152, 219); // Blue
        };
    }

    // ✅ Helper method: summaryCell
    private Cell summaryCell(String label, String value, PdfFont bold, PdfFont regular, Color bg,
            Color textDark) {
        return new Cell()
                .add(new Paragraph(value).setFont(bold).setFontSize(22).setFontColor(textDark))
                .add(new Paragraph(label).setFont(regular).setFontSize(10).setFontColor(textDark))
                .setBackgroundColor(bg)
                .setBorder(Border.NO_BORDER)
                .setPadding(14)
                .setTextAlignment(TextAlignment.CENTER);
    }

    // ✅ Helper method: metaCell
    private Cell metaCell(String label, String value, PdfFont bold, PdfFont regular, Color textDark,
            Color textMuted) {
        return new Cell()
                .add(new Paragraph(label).setFont(bold).setFontSize(9).setFontColor(textMuted))
                .add(new Paragraph(value).setFont(regular).setFontSize(11).setFontColor(textDark))
                .setBorder(Border.NO_BORDER).setPaddingLeft(4).setPaddingTop(4).setPaddingBottom(4);
    }

    // ✅ Helper method: memberCell
    private Cell memberCell(String text, PdfFont font, float size, Color textColor, Color borderColor,
            Color bgColor) {
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

        Long departmentId = request.getDepartmentId();
        Department dept = departmentrepository.findById(departmentId)
                .orElseThrow(() -> new RuntimeException("Department not found with ID: " + departmentId));
        
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
        rules.setDepartment(dept);
        allocationRulesRepository.save(rules);
        
        System.out.println("[CoordinatorService] ✅ Rules saved for department: " + departmentId);

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
}