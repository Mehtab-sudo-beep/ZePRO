package com.zepro.controller;

import com.zepro.model.Domain;
import com.zepro.service.DomainService;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/domains")
public class DomainController {

    private final DomainService domainService;

    public DomainController(DomainService domainService) {
        this.domainService = domainService;
    }

    @PostMapping
    public Domain createDomain(@RequestBody Domain domain) {
        return domainService.createDomain(domain);
    }

    @GetMapping
    public List<Domain> getDomains() {
        return domainService.getDomains();
    }
}