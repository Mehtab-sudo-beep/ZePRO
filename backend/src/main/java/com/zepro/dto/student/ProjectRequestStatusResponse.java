package com.zepro.dto.student;

import java.util.List;

public class ProjectRequestStatusResponse {

    private List<String> upcomingRequests;
    private List<String> completedRequests;

    public ProjectRequestStatusResponse() {}

    public List<String> getUpcomingRequests() {
        return upcomingRequests;
    }

    public List<String> getCompletedRequests() {
        return completedRequests;
    }

    public void setUpcomingRequests(List<String> upcomingRequests) {
        this.upcomingRequests = upcomingRequests;
    }

    public void setCompletedRequests(List<String> completedRequests) {
        this.completedRequests = completedRequests;
    }
}