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

        public CoordinatorService(StudentRepository studentRepository,
                        FacultyRepository facultyRepository,
                        TeamRepository teamRepository,
                        ProjectRepository projectRepository,
                        AllocationRulesRepository allocationRulesRepository) {
                this.studentRepository = studentRepository;
                this.facultyRepository = facultyRepository;
                this.teamRepository = teamRepository;
                this.projectRepository = projectRepository;
                this.allocationRulesRepository = allocationRulesRepository;
        }

        // =========================================================================
        // OVERVIEW TAB
        // =========================================================================

        public DashboardStatsResponse getDashboardStats() {
                long totalStudents = studentRepository.count();
                long allocated = studentRepository.countByIsAllocatedTrue();
                long unallocated = studentRepository.countByIsAllocatedFalse();
                long totalTeams = teamRepository.count();
                long totalFaculty = facultyRepository.count();

                Integer totalMaxSlotsInt = facultyRepository.sumMaxStudents();

                long totalMaxSlots = (totalMaxSlotsInt != null) ? totalMaxSlotsInt : 0;
                long totalUsedSlots = studentRepository.countByIsAllocatedTrue(); // Use student count directly
                int availableSlots = (int) (totalMaxSlots - totalUsedSlots);

                return new DashboardStatsResponse(
                                totalStudents, allocated, unallocated,
                                totalTeams, totalFaculty, availableSlots);
        }

        // =========================================================================
        // FACULTIES TAB
        // =========================================================================

        public List<CoordinatorFacultyResponse> getAllFaculties() {
                return facultyRepository.findAll().stream()
                                .map(this::mapToFacultyResponse)
                                .collect(Collectors.toList());
        }

        public List<CoordinatorFacultyResponse> searchFaculties(String query) {
                return facultyRepository.searchFaculties(query).stream()
                                .map(this::mapToFacultyResponse)
                                .collect(Collectors.toList());
        }

        // =========================================================================
        // STUDENTS TAB
        // =========================================================================

        public List<CoordinatorStudentResponse> getAllStudents() {
                return studentRepository.findAll().stream()
                                .map(this::mapToStudentResponse)
                                .collect(Collectors.toList());
        }

        public List<CoordinatorStudentResponse> searchStudents(String query) {
                return studentRepository.searchStudents(query).stream()
                                .map(this::mapToStudentResponse)
                                .collect(Collectors.toList());
        }

        public List<CoordinatorStudentResponse> getAllocatedStudents() { // ✅ NEW
                return studentRepository.findByIsAllocatedTrue().stream()
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

                if (faculty.getAllocatedStudents() >= faculty.getMaxStudents()) {
                        throw new RuntimeException(
                                        "No slots available for faculty: " + faculty.getUser().getName());
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
                        team.setFaculty(faculty); // ← SET GUIDE ON TEAM
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

                if (newFaculty.getAllocatedStudents() >= newFaculty.getMaxStudents()) {
                        throw new RuntimeException(
                                        "No slots available for faculty: " + newFaculty.getUser().getName());
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

                        // Only update team guide if the old guide matches the old faculty
                        // This prevents overwriting a different faculty assigned at team level
                        Faculty currentTeamFaculty = team.getFaculty();

                        if (currentTeamFaculty == null ||
                                        currentTeamFaculty.getFacultyId().equals(oldFaculty.getFacultyId())) {

                                team.setFaculty(newFaculty); // ← UPDATE GUIDE ON TEAM
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
        public List<CoordinatorTeamResponse> getAllTeams() {
                List<Team> allTeams = teamRepository.findAllWithDetails(); // ✅ FIXED
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
                                                                List.of());
                                        }
                                })
                                .collect(Collectors.toList());
        }

        // =========================================================================
        // DOWNLOAD ALL TEAMS REPORT
        // =========================================================================

        @Transactional(readOnly = true)
        public AllTeamsReportResponse getAllTeamsReport() {
                List<Team> allTeams = teamRepository.findAllWithDetails(); // ✅ FIXED
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
                                                                List.of());
                                        }
                                })
                                .collect(Collectors.toList());

                return new AllTeamsReportResponse(teamList, LocalDate.now().toString(), teamList.size());
        }

        // =========================================================================
        // PDF REPORT GENERATION
        // =========================================================================

        @Transactional(readOnly = true)
        public byte[] generateAllTeamsReportPdf() {
                try {
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

                        // ── Banner ────────────────────────────────────────────────────────
                        Table banner = new Table(UnitValue.createPercentArray(new float[] { 1 }))
                                        .useAllAvailableWidth().setBackgroundColor(indigo)
                                        .setBorder(Border.NO_BORDER).setMarginBottom(20);
                        banner.addCell(new Cell()
                                        .add(new Paragraph("ALL TEAMS PROJECT REPORT")
                                                        .setFont(bold).setFontSize(20)
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

                        // ── Summary ───────────────────────────────────────────────────────
                        List<Team> allTeams = teamRepository.findAllWithDetails();

                        List<CoordinatorTeamResponse> teams = allTeams.stream()
                                        .map(this::mapToTeamResponse)
                                        .toList();
                        Table summary = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }))
                                        .useAllAvailableWidth().setMarginBottom(24);
                        summary.addCell(summaryCell("Total Teams", String.valueOf(teams.size()), bold, regular,
                                        indigoLight, textDark));
                        long activeCount = teams.stream().filter(t -> "active".equalsIgnoreCase(t.getStatus())).count();
                        summary.addCell(summaryCell("Active Teams", String.valueOf(activeCount), bold, regular,
                                        indigoLight, textDark));
                        document.add(summary);

                        // ── One section per team ──────────────────────────────────────────
                        for (int idx = 0; idx < teams.size(); idx++) {
                                CoordinatorTeamResponse team = teams.get(idx);

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

                                Table meta = new Table(UnitValue.createPercentArray(new float[] { 1, 1 }))
                                                .useAllAvailableWidth().setMarginBottom(6);
                                meta.addCell(metaCell("Project Title", team.getProjectTitle(), bold, regular, textDark,
                                                textMuted));
                                meta.addCell(metaCell("Status",
                                                team.getStatus() != null ? team.getStatus().toUpperCase() : "N/A", bold,
                                                regular, textDark, textMuted));
                                meta.addCell(metaCell("Guide / Faculty",
                                                team.getFacultyName() != null ? team.getFacultyName() : "N/A", bold,
                                                regular, textDark, textMuted));
                                meta.addCell(metaCell("Members",
                                                String.valueOf(team.getMembers() == null ? 0
                                                                : team.getMembers().size()),
                                                bold, regular, textDark, textMuted));
                                document.add(meta);

                                List<TeamMemberInfo> members = team.getMembers();
                                if (members != null && !members.isEmpty()) {
                                        members.sort((a, b) -> Boolean.compare(b.isTeamLead(), a.isTeamLead()));

                                        Table membersTable = new Table(UnitValue.createPercentArray(
                                                        new float[] { 0.4f, 2f, 1.2f, 2f, 0.8f, 2f }))
                                                        .useAllAvailableWidth().setMarginBottom(4);
                                        for (String h : new String[] { "#", "Name", "Roll No", "Email", "CGPA",
                                                        "Allocated Faculty" }) {
                                                membersTable.addHeaderCell(new Cell()
                                                                .add(new Paragraph(h).setFont(bold).setFontSize(9)
                                                                                .setFontColor(ColorConstants.WHITE))
                                                                .setBackgroundColor(indigo).setBorder(Border.NO_BORDER)
                                                                .setPadding(6));
                                        }
                                        DeviceRgb leaderBg = new DeviceRgb(255, 251, 235);
                                        for (int mi = 0; mi < members.size(); mi++) {
                                                TeamMemberInfo m = members.get(mi);
                                                DeviceRgb rowBg = m.isTeamLead() ? leaderBg
                                                                : ((mi % 2 == 0) ? rowAlt : null);
                                                String nameDisplay = (m.getName() != null ? m.getName() : "N/A")
                                                                + (m.isTeamLead() ? "  ★ LEADER" : "");
                                                membersTable.addCell(memberCell(String.valueOf(mi + 1), regular, 9,
                                                                textDark, borderGray, rowBg));
                                                membersTable.addCell(
                                                                memberCell(nameDisplay, m.isTeamLead() ? bold : regular,
                                                                                9, textDark, borderGray, rowBg));
                                                membersTable.addCell(memberCell(m.getRollNo(), regular, 9, textDark,
                                                                borderGray, rowBg));
                                                membersTable.addCell(memberCell(m.getEmail(), regular, 8, textMuted,
                                                                borderGray, rowBg));
                                                membersTable.addCell(memberCell(m.getCgpa(), regular, 9, textDark,
                                                                borderGray, rowBg));
                                                membersTable.addCell(memberCell(
                                                                m.getAllocatedFacultyName() != null
                                                                                ? m.getAllocatedFacultyName()
                                                                                : "Unallocated",
                                                                regular, 9, textDark, borderGray, rowBg));
                                        }
                                        document.add(membersTable);
                                } else {
                                        document.add(new Paragraph("No members assigned yet.")
                                                        .setFont(regular).setFontSize(9).setFontColor(textMuted)
                                                        .setMarginLeft(8).setMarginBottom(6));
                                }
                        }

                        document.add(new Paragraph("\n— End of Report —")
                                        .setFont(regular).setFontSize(9).setFontColor(textMuted)
                                        .setTextAlignment(TextAlignment.CENTER).setMarginTop(20));
                        document.close();
                        return baos.toByteArray();

                } catch (Exception e) {
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

        public AllocationRulesResponse getRules() {
                AllocationRules rules = allocationRulesRepository.findFirstByOrderByIdAsc()
                                .orElseGet(() -> {
                                        AllocationRules defaults = new AllocationRules();
                                        defaults.setMaxTeamSize(4);
                                        defaults.setMaxStudentsPerFaculty(10);
                                        defaults.setMaxProjectsPerFaculty(3);
                                        return defaults;
                                });
                return new AllocationRulesResponse(rules.getMaxTeamSize(), rules.getMaxStudentsPerFaculty(), rules.getMaxProjectsPerFaculty());
        }

        @Transactional
        public void saveRules(SaveRulesRequest request) {
                if (request.getMaxTeamSize() <= 0)
                        throw new RuntimeException("Max team size must be greater than 0");
                if (request.getMaxStudentsPerFaculty() <= 0)
                        throw new RuntimeException("Max students per faculty must be greater than 0");
                if (request.getMaxProjectsPerFaculty() <= 0)
                        throw new RuntimeException("Max projects per faculty must be greater than 0");

                AllocationRules rules = allocationRulesRepository.findFirstByOrderByIdAsc()
                                .orElse(new AllocationRules());
                rules.setMaxTeamSize(request.getMaxTeamSize());
                rules.setMaxStudentsPerFaculty(request.getMaxStudentsPerFaculty());
                rules.setMaxProjectsPerFaculty(request.getMaxProjectsPerFaculty());
                allocationRulesRepository.save(rules);
        }

        // =========================================================================
        // PRIVATE MAPPERS
        // =========================================================================

        private CoordinatorFacultyResponse mapToFacultyResponse(Faculty f) {
                String deptName = (f.getDepartment() != null) ? f.getDepartment().getDepartmentName() : "N/A";
                int allocatedCount = (int) studentRepository.countByAllocatedFaculty(f);
                return new CoordinatorFacultyResponse(f.getFacultyId(), f.getUser().getName(),
                                f.getUser().getEmail(), deptName, f.getMaxStudents(), allocatedCount,
                                f.getSpecialization());
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
                                s.getRollNo() != null ? s.getRollNo() : "N/A", s.getUser().getEmail(),
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
                                                                        s.getRollNo(),
                                                                        s.getUser().getEmail(),
                                                                        s.getCgpa(),
                                                                        s.getStudentId().equals(teamLeadId),
                                                                        facultyName)) // ←
                                                        // isTeamLead
                                                        .collect(Collectors.toList())
                                        : new java.util.ArrayList<>();

                        return new CoordinatorTeamResponse(
                                        t.getTeamId(),
                                        t.getTeamName(),
                                        projectTitle,
                                        facultyId,
                                        facultyName,
                                        t.getStatus(),
                                        members);
                } catch (Exception e) {
                        System.out.println("Error mapping team " + t.getTeamId() + ": " + e.getMessage());
                        return new CoordinatorTeamResponse(
                                        t.getTeamId(),
                                        t.getTeamName(),
                                        "N/A", null, "N/A", t.getStatus(),
                                        new java.util.ArrayList<>());
                }
        }

        private void updateFacultyAllocationCount(Faculty faculty) {
            int currentCount = (int) studentRepository.countByAllocatedFaculty(faculty);
            faculty.setAllocatedStudents(currentCount);
            facultyRepository.save(faculty);
        }
}