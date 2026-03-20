package com.zepro.dto.faculty;

public class CreateProjectRequest {

    private String title;
    private String description;
    private Long domainId;
    private Long subDomainId;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getDomainId() {
        return domainId;
    }

    public void setDomainId(Long domainId) {
        this.domainId = domainId;
    }

    public Long getSubDomainId() {
        return subDomainId;
    }

    public void setSubDomainId(Long subDomainId) {
        this.subDomainId = subDomainId;
    }
    private Long facultyId;

  
    public Long getFacultyId() { return facultyId; }
    public void setFacultyId(Long facultyId) { this.facultyId = facultyId; }
}