package com.zepro.dto.faculty;
public class CreateProjectRequest {

    private String title;
    private String description;
    private Long domainId;
    private Long subDomainId;
    private Integer studentSlots; // ✅ NEW
    private String degree; // UG or PG

    public String getDegree() {
        return degree;
    }

    public void setDegree(String degree) {
        this.degree = degree;
    }
    

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

    public Integer getStudentSlots() { // ✅ NEW
        return studentSlots;
    }

    public void setStudentSlots(Integer studentSlots) { // ✅ NEW
        this.studentSlots = studentSlots;
    }
}