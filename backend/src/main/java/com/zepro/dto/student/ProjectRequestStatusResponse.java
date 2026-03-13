package com.zepro.dto.student;

import java.util.List;

public class ProjectRequestStatusResponse {
    private List<ProjectStatusDTO> upcoming;
    private List<ProjectStatusDTO> completed;

    // getters and setters
    public List<ProjectStatusDTO> getUpcoming() { return upcoming; }
    public void setUpcoming(List<ProjectStatusDTO> upcoming) { this.upcoming = upcoming; }
    public List<ProjectStatusDTO> getCompleted() { return completed; }
    public void setCompleted(List<ProjectStatusDTO> completed) { this.completed = completed; }
}