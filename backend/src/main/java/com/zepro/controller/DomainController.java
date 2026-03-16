package com.zepro.controller;

import com.zepro.dto.faculty.DomainResponse;
import com.zepro.dto.faculty.SubDomainResponse;
import com.zepro.model.Domain;
import com.zepro.model.SubDomain;
import com.zepro.service.DomainService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class DomainController {

    private final DomainService domainService;

    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @GetMapping("/domains")
    public List<DomainResponse> getDomains() {
        return domainService.getDomains();
    }

    @GetMapping("/subdomains/{domainId}")
public List<SubDomainResponse> getSubDomains(@PathVariable Long domainId) {
    return domainService.getSubDomains(domainId);
}
}