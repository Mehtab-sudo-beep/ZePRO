package com.zepro.dto.facultycoordinator;


public class DashboardStatsResponse {

    private long totalStudents;       // students.length
    private long allocatedStudents;   // students.filter(s => s.isAllocated).length
    private long unallocatedStudents; // students.filter(s => !s.isAllocated).length
    private long totalTeams;          // teams.length
    private long totalFaculty;        // faculties.length
    private int  availableSlots;      // sum(maxStudents) - sum(allocatedStudents)

    public DashboardStatsResponse() {}

    public DashboardStatsResponse(long totalStudents, long allocatedStudents,
                                   long unallocatedStudents, long totalTeams,
                                   long totalFaculty, int availableSlots) {
        this.totalStudents      = totalStudents;
        this.allocatedStudents  = allocatedStudents;
        this.unallocatedStudents = unallocatedStudents;
        this.totalTeams         = totalTeams;
        this.totalFaculty       = totalFaculty;
        this.availableSlots     = availableSlots;
    }

    public long getTotalStudents()        { return totalStudents; }
    public long getAllocatedStudents()     { return allocatedStudents; }
    public long getUnallocatedStudents()  { return unallocatedStudents; }
    public long getTotalTeams()           { return totalTeams; }
    public long getTotalFaculty()         { return totalFaculty; }
    public int  getAvailableSlots()       { return availableSlots; }

    public void setTotalStudents(long v)       { this.totalStudents = v; }
    public void setAllocatedStudents(long v)   { this.allocatedStudents = v; }
    public void setUnallocatedStudents(long v) { this.unallocatedStudents = v; }
    public void setTotalTeams(long v)          { this.totalTeams = v; }
    public void setTotalFaculty(long v)        { this.totalFaculty = v; }
    public void setAvailableSlots(int v)       { this.availableSlots = v; }
}
