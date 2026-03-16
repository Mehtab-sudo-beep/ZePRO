package com.zepro.dto.faculty;


public class DomainResponse {

    private Long domainId;
    private String name;

    public DomainResponse() {}

    public DomainResponse(Long domainId, String name) {
        this.domainId = domainId;
        this.name = name;
    }

    public Long getDomainId() {
        return domainId;
    }

    public void setDomainId(Long domainId) {
        this.domainId = domainId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
} 
