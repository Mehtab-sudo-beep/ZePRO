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

    public DomainService(DomainRepository domainRepository,
                         SubDomainRepository subDomainRepository) {
        this.domainRepository = domainRepository;
        this.subDomainRepository = subDomainRepository;
    }

    // Create domain with faculty
    public Domain createDomain(String name, Faculty faculty) {
        Domain domain = new Domain();
        domain.setName(name);
        domain.setFaculty(faculty);

        return domainRepository.save(domain);
    }

    // Create domain directly
    public Domain createDomain(Domain domain) {
        return domainRepository.save(domain);
    }

    // Get all domains (for dropdown)
   public List<DomainResponse> getDomains() {
    return domainRepository.findAll()
            .stream()
            .map(domain -> new DomainResponse(
                    domain.getDomainId(),
                    domain.getName()
            ))
            .toList();
}

    // Get subdomains when domain is selected
   public List<SubDomainResponse> getSubDomains(Long domainId) {

    return subDomainRepository.findByDomainDomainId(domainId)
            .stream()
            .map(sd -> new SubDomainResponse(
                    sd.getSubDomainId(),
                    sd.getName()
            ))
            .toList();
}
}