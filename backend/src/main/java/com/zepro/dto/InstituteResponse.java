package com.zepro.dto;

public class InstituteResponse {

    private Long instituteId;
    private String instituteName;
    private String instituteCode;
    private String phoneNumber;
    private String address;
    private String city;
    private String state;
    private String email;
    private String website;
    private String tail;  // ✅ NEW FIELD

    // ✅ GETTERS AND SETTERS
    public Long getInstituteId() { return instituteId; }
    public void setInstituteId(Long instituteId) { this.instituteId = instituteId; }

    public String getInstituteName() { return instituteName; }
    public void setInstituteName(String instituteName) { this.instituteName = instituteName; }

    public String getInstituteCode() { return instituteCode; }
    public void setInstituteCode(String instituteCode) { this.instituteCode = instituteCode; }

    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

    public String getAddress() { return address; }
    public void setAddress(String address) { this.address = address; }

    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }

    public String getState() { return state; }
    public void setState(String state) { this.state = state; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getTail() { return tail; }  // ✅ NEW GETTER
    public void setTail(String tail) { this.tail = tail; }  // ✅ NEW SETTER
}