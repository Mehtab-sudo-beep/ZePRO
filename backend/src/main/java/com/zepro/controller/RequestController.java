package com.zepro.controller;

import com.zepro.service.ProjectRequestService;

import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/requests")
public class RequestController {

    private final ProjectRequestService requestService;

    public RequestController(ProjectRequestService requestService) {
        this.requestService = requestService;
    }

    @PostMapping("/send")
    public String sendRequest(
            @RequestParam Long teamId,
            @RequestParam Long facultyId) {

        requestService.sendRequest(teamId, facultyId);
        return "Request sent";
    }

    @PostMapping("/accept")
    public String acceptRequest(@RequestParam Long requestId) {

        requestService.acceptRequest(requestId);
        return "Request accepted";
    }

    @PostMapping("/reject")
    public String rejectRequest(@RequestParam Long requestId) {

        requestService.rejectRequest(requestId);
        return "Request rejected";
    }
}