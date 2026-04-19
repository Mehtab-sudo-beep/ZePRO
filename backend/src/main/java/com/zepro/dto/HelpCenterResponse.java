package com.zepro.dto;

public class HelpCenterResponse {
    private String adminName;
    private String adminEmail;
    private String adminPhone;
    private String adminOffice;

    private String coordinatorName;
    private String coordinatorEmail;
    private String coordinatorPhone;
    private String coordinatorOffice;

    public HelpCenterResponse() {
    }

    public String getAdminName() { return adminName; }
    public void setAdminName(String adminName) { this.adminName = adminName; }

    public String getAdminEmail() { return adminEmail; }
    public void setAdminEmail(String adminEmail) { this.adminEmail = adminEmail; }

    public String getAdminPhone() { return adminPhone; }
    public void setAdminPhone(String adminPhone) { this.adminPhone = adminPhone; }

    public String getAdminOffice() { return adminOffice; }
    public void setAdminOffice(String adminOffice) { this.adminOffice = adminOffice; }

    public String getCoordinatorName() { return coordinatorName; }
    public void setCoordinatorName(String coordinatorName) { this.coordinatorName = coordinatorName; }

    public String getCoordinatorEmail() { return coordinatorEmail; }
    public void setCoordinatorEmail(String coordinatorEmail) { this.coordinatorEmail = coordinatorEmail; }

    public String getCoordinatorPhone() { return coordinatorPhone; }
    public void setCoordinatorPhone(String coordinatorPhone) { this.coordinatorPhone = coordinatorPhone; }

    public String getCoordinatorOffice() { return coordinatorOffice; }
    public void setCoordinatorOffice(String coordinatorOffice) { this.coordinatorOffice = coordinatorOffice; }
}
