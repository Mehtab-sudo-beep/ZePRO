package com.zepro.dto.student;

import org.springframework.web.multipart.MultipartFile;

public class UpdateStudentProfileRequest {

    private String name;
    private String email;
    private MultipartFile resumeFile;
    private MultipartFile marksheetFile;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public MultipartFile getResumeFile() {
        return resumeFile;
    }

    public void setResumeFile(MultipartFile resumeFile) {
        this.resumeFile = resumeFile;
    }

    public MultipartFile getMarksheetFile() {
        return marksheetFile;
    }

    public void setMarksheetFile(MultipartFile marksheetFile) {
        this.marksheetFile = marksheetFile;
    }
}
