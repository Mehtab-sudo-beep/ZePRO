package com.zepro.model;

import jakarta.persistence.*;

@Entity
public class Department {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long departmentId;

    private String departmentName;
    private String departmentCode;
    private String description;

    private String coordinatorName;
    private String coordinatorEmail;
    private String coordinatorPhone;

    private String ugCoordinatorName;
    private String ugCoordinatorEmail;
    private String ugCoordinatorPhone;

    private String pgCoordinatorName;
    private String pgCoordinatorEmail;
    private String pgCoordinatorPhone;

    @ManyToOne
    private Institute institute;

    public Long getDepartmentId() {
        return departmentId;
    }

    public void setDepartmentId(Long departmentId) {
        this.departmentId = departmentId;
    }

    public String getDepartmentName() {
        return departmentName;
    }

    public void setDepartmentName(String departmentName) {
        this.departmentName = departmentName;
    }

    public String getDepartmentCode() { return departmentCode; }
    public void setDepartmentCode(String departmentCode) { this.departmentCode = departmentCode; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public String getCoordinatorEmail() { return coordinatorEmail; }
    public void setCoordinatorEmail(String coordinatorEmail) { this.coordinatorEmail = coordinatorEmail; }

    public String getCoordinatorPhone() { return coordinatorPhone; }
    public void setCoordinatorPhone(String coordinatorPhone) { this.coordinatorPhone = coordinatorPhone; }

    public String getUgCoordinatorName() { return ugCoordinatorName; }
    public void setUgCoordinatorName(String ugCoordinatorName) { this.ugCoordinatorName = ugCoordinatorName; }

    public String getUgCoordinatorEmail() { return ugCoordinatorEmail; }
    public void setUgCoordinatorEmail(String ugCoordinatorEmail) { this.ugCoordinatorEmail = ugCoordinatorEmail; }

    public String getUgCoordinatorPhone() { return ugCoordinatorPhone; }
    public void setUgCoordinatorPhone(String ugCoordinatorPhone) { this.ugCoordinatorPhone = ugCoordinatorPhone; }

    public String getPgCoordinatorName() { return pgCoordinatorName; }
    public void setPgCoordinatorName(String pgCoordinatorName) { this.pgCoordinatorName = pgCoordinatorName; }

    public String getPgCoordinatorEmail() { return pgCoordinatorEmail; }
    public void setPgCoordinatorEmail(String pgCoordinatorEmail) { this.pgCoordinatorEmail = pgCoordinatorEmail; }

    public String getPgCoordinatorPhone() { return pgCoordinatorPhone; }
    public void setPgCoordinatorPhone(String pgCoordinatorPhone) { this.pgCoordinatorPhone = pgCoordinatorPhone; }

    public Institute getInstitute() {
        return institute;
    }

    public void setInstitute(Institute institute) {
        this.institute = institute;
    }
}