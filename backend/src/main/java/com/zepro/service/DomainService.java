package com.zepro.service;

import com.zepro.dto.faculty.DomainResponse;
import com.zepro.dto.faculty.SubDomainResponse;
import com.zepro.model.Domain;
import com.zepro.model.Faculty;
import com.zepro.model.SubDomain;
import com.zepro.repository.DomainRepository;
import com.zepro.repository.SubDomainRepository;

import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DomainService {

    private final DomainRepository domainRepository;
    private final SubDomainRepository subDomainRepository;
    private final com.zepro.repository.StudentRepository studentRepository;
    private final com.zepro.repository.FacultyRepository facultyRepository;

    public DomainService(DomainRepository domainRepository,
                         SubDomainRepository subDomainRepository,
                         com.zepro.repository.StudentRepository studentRepository,
                         com.zepro.repository.FacultyRepository facultyRepository) {
        this.domainRepository = domainRepository;
        this.subDomainRepository = subDomainRepository;
        this.studentRepository = studentRepository;
        this.facultyRepository = facultyRepository;
    }

    // Create domain with faculty
    public Domain createDomain(String name, Faculty faculty) {
        Domain domain = new Domain();
        domain.setName(name);
        domain.setFaculty(faculty);
        if (faculty.getDepartment() != null) {
            domain.setDepartment(faculty.getDepartment());
        }

        return domainRepository.save(domain);
    }

    // Create domain directly
    public Domain createDomain(Domain domain) {
        return domainRepository.save(domain);
    }

    // Get all domains by user's department (for dropdown)
    public List<DomainResponse> getDomains(org.springframework.security.core.Authentication authentication) {
        Long departmentId = extractDepartmentId(authentication);

        if (departmentId == null) {
            // Fallback for edge cases, though it shouldn't hit if authenticated
            return domainRepository.findAll()
                   .stream()
                   .map(domain -> new DomainResponse(domain.getDomainId(), domain.getName()))
                   .toList();
        }

        return domainRepository.findByDepartment_DepartmentId(departmentId)
                .stream()
                .map(domain -> new DomainResponse(
                        domain.getDomainId(),
                        domain.getName()
                ))
                .toList();
    }

    // Get subdomains when domain is selected
    public List<SubDomainResponse> getSubDomains(Long domainId, org.springframework.security.core.Authentication authentication) {
        // Technically domainId assumes we are already restricted, but we can double check department just in case
        return subDomainRepository.findByDomainDomainId(domainId)
                .stream()
                .map(sd -> new SubDomainResponse(
                        sd.getSubDomainId(),
                        sd.getName()
                ))
                .toList();
    }

    private Long extractDepartmentId(org.springframework.security.core.Authentication authentication) {
        if (authentication == null || authentication.getName() == null) return null;
        String email = authentication.getName();

        // Check if student
        var studentOpt = studentRepository.findByUser_Email(email);
        if (studentOpt.isPresent() && studentOpt.get().getDepartment() != null) {
            return studentOpt.get().getDepartment().getDepartmentId();
        }

        // Check if faculty
        var facultyOpt = facultyRepository.findByUser_Email(email);
        if (facultyOpt.isPresent() && facultyOpt.get().getDepartment() != null) {
            return facultyOpt.get().getDepartment().getDepartmentId();
        }

        return null;
    }
}