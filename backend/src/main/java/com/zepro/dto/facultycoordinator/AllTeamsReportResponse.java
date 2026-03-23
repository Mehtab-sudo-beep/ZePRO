package com.zepro.dto.facultycoordinator;

import java.util.List;

public class AllTeamsReportResponse {
    
    private List<CoordinatorTeamResponse> teams;
    private String generatedOn; // LocalDate.now().toString()
    private int totalTeams;
 
    public AllTeamsReportResponse() {}
 
    public AllTeamsReportResponse(List<CoordinatorTeamResponse> teams,
                                   String generatedOn, int totalTeams) {
        this.teams       = teams;
        this.generatedOn = generatedOn;
        this.totalTeams  = totalTeams;
    }
 
    public List<CoordinatorTeamResponse> getTeams()     { return teams; }
    public String                         getGeneratedOn() { return generatedOn; }
    public int                            getTotalTeams()  { return totalTeams; }
 
    public void setTeams(List<CoordinatorTeamResponse> v) { this.teams = v; }
    public void setGeneratedOn(String v)                  { this.generatedOn = v; }
    public void setTotalTeams(int v)                      { this.totalTeams = v; }
}
