package com.zepro.dto.student;

import java.util.List;

public class ProjectRequestStatusResponse {

    private List<UpcomingRequestResponse> upcomingRequests;
    private List<CompletedRequestResponse> completedRequests;

    public List<UpcomingRequestResponse> getUpcomingRequests() {
        return upcomingRequests;
    }

    public void setUpcomingRequests(List<UpcomingRequestResponse> upcomingRequests) {
        this.upcomingRequests = upcomingRequests;
    }

    public List<CompletedRequestResponse> getCompletedRequests() {
        return completedRequests;
    }

    public void setCompletedRequests(List<CompletedRequestResponse> completedRequests) {
        this.completedRequests = completedRequests;
    }
}