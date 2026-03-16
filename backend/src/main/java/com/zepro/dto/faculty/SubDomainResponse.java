package com.zepro.dto.faculty;

public class SubDomainResponse {

    private Long subDomainId;
    private String name;

    public SubDomainResponse(Long subDomainId, String name) {
        this.subDomainId = subDomainId;
        this.name = name;
    }

    public Long getSubDomainId() {
        return subDomainId;
    }

    public String getName() {
        return name;
    }
}