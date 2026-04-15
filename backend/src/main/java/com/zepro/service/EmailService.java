package com.zepro.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    @Async
    public void sendDeadlineNotification(List<String> bccRecipients, String roleName, String title, String description, LocalDateTime deadlineDate) {
        if (bccRecipients == null || bccRecipients.isEmpty()) {
            System.out.println("[EmailService] 🛑 No recipients found for deadline notification.");
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("zepro205@gmail.com"); // Normally set to your configured mail proxy
            helper.setSubject("ZePRO Notification: " + title);

            // Bcc everyone so emails stay private
            String[] bccArray = bccRecipients.toArray(new String[0]);
            helper.setBcc(bccArray);

            String htmlContent = buildSupersetTemplate(roleName, title, description, deadlineDate);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[EmailService] ✅ Successfully sent deadline email to " + bccRecipients.size() + " recipients.");

        } catch (MessagingException e) {
            System.err.println("[EmailService] ❌ Failed to send deadline email: " + e.getMessage());
        }
    }

    @Async
    public void sendProjectAcceptanceEmail(List<String> bccRecipients, String projectName, String facultyName) {
        if (bccRecipients == null || bccRecipients.isEmpty()) {
            System.out.println("[EmailService] 🛑 No recipients found for project acceptance notification.");
            return;
        }

        try {
            System.out.println("[EmailService] 📧 Preparing email for recipients: " + bccRecipients);
            System.out.println("[EmailService] 📧 Project: " + projectName + " | Faculty: " + facultyName);
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom("zepro205@gmail.com");
            helper.setSubject("ZePRO Notification: Project Request Accepted!");

            String[] bccArray = bccRecipients.toArray(new String[0]);
            helper.setBcc(bccArray);

            String htmlContent = buildAcceptanceTemplate("student", projectName, facultyName);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("[EmailService] ✅ Successfully sent project acceptance email to " + bccRecipients.size() + " recipients.");

        } catch (MessagingException e) {
            System.err.println("[EmailService] ❌ MessagingException: " + e.getMessage());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("[EmailService] ❌ Exception: " + e.getMessage());
            e.printStackTrace();
        }
    }

    private String buildSupersetTemplate(String roleName, String title, String description, LocalDateTime deadlineDate) {
        String greetingRole = (roleName == null || roleName.isEmpty()) ? "User" : roleName.toLowerCase();
        // Capitalize first letter
        greetingRole = greetingRole.substring(0, 1).toUpperCase() + greetingRole.substring(1);
        
        String formattedDate = "N/A";
        if (deadlineDate != null) {
            DateTimeFormatter formatter = DateTimeFormatter.ofPattern("MMM dd, yyyy 'at' hh:mm a");
            formattedDate = deadlineDate.format(formatter);
        }

        String safeDescription = (description != null && !description.isEmpty()) ? description : "No additional details provided.";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { background-color: #f5f5f5; padding: 20px; font-family: 'Inter', Helvetica, Arial, sans-serif; }" +
                "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }" +
                "  .header { padding: 30px; text-align: center; border-bottom: 1px solid #eeeeee; }" +
                "  .header h1 { margin: 0; color: #2b3990; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }" +
                "  .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 15px; }" +
                "  .content p { margin-bottom: 20px; }" +
                "  .highlight { margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #2b3990; font-size: 15px; }" +
                "  .highlight strong { color: #1a1a1a; display: inline-block; width: 100px; }" +
                "  .footer-container { padding: 30px; text-align: center; color: #888888; font-size: 12px; }" +
                "  .footer-container p { margin: 5px 0; }" +
                "  .footer-unsubscribe { margin-top: 15px; }" +
                "  .footer-unsubscribe a { color: #2b3990; text-decoration: underline; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>ZePRO</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Dear " + greetingRole + ",</p>" +
                "      <p>This is to inform you about a system deadline update regarding <b>" + title + "</b>.</p>" +
                "      <div class='highlight'>" +
                "        <div><strong>Deadline:</strong> " + formattedDate + "</div>" +
                "        <div style='margin-top: 10px;'><strong>Details:</strong> " + safeDescription + "</div>" +
                "      </div>" +
                "      <p>Please ensure you complete any required tasks before the specified time.</p>" +
                "    </div>" +
                "  </div>" +
                "  <div class='footer-container'>" +
                "    <p>*** This is a system generated email. Please do not reply to this email. ***</p>" +
                "    <p class='footer-unsubscribe'>You are receiving this email because you are registered as a " + greetingRole + " in our system.<br>To <a href='#'>unsubscribe</a> or change your email preferences please visit your profile.</p>" +
                "    <p style='margin-top: 20px;'><b>ZePRO Project Management System</b><br>Level 3, Global HQ, Bangalore, 560102<br>© 2026 ZePRO Tech</p>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }

    private String buildAcceptanceTemplate(String roleName, String projectName, String facultyName) {
        String greetingRole = (roleName == null || roleName.isEmpty()) ? "User" : roleName.toLowerCase();
        greetingRole = greetingRole.substring(0, 1).toUpperCase() + greetingRole.substring(1);

        String safeFaculty = (facultyName != null && !facultyName.isEmpty()) ? facultyName : "your reviewing faculty";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head>" +
                "<style>" +
                "  body { background-color: #f5f5f5; padding: 20px; font-family: 'Inter', Helvetica, Arial, sans-serif; }" +
                "  .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; overflow: hidden; }" +
                "  .header { padding: 30px; text-align: center; border-bottom: 1px solid #eeeeee; }" +
                "  .header h1 { margin: 0; color: #2b3990; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }" +
                "  .content { padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 15px; }" +
                "  .content p { margin-bottom: 20px; }" +
                "  .highlight { margin: 25px 0; padding: 20px; background-color: #f8f9fa; border-left: 4px solid #4CAF50; font-size: 15px; }" +
                "  .highlight strong { color: #1a1a1a; display: inline-block; width: 100px; }" +
                "  .footer-container { padding: 30px; text-align: center; color: #888888; font-size: 12px; }" +
                "  .footer-container p { margin: 5px 0; }" +
                "  .footer-unsubscribe { margin-top: 15px; }" +
                "  .footer-unsubscribe a { color: #2b3990; text-decoration: underline; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "  <div class='container'>" +
                "    <div class='header'>" +
                "      <h1>ZePRO</h1>" +
                "    </div>" +
                "    <div class='content'>" +
                "      <p>Dear " + greetingRole + ",</p>" +
                "      <p>Congratulations! We are glad to inform you that your project request has been <b>ACCEPTED</b> by " + safeFaculty + ".</p>" +
                "      <div class='highlight'>" +
                "        <div><strong>Project:</strong> " + projectName + "</div>" +
                "        <div style='margin-top: 10px;'><strong>Faculty:</strong> " + safeFaculty + "</div>" +
                "      </div>" +
                "      <p>Your team is now officially assigned to this project. Best of luck!</p>" +
                "    </div>" +
                "  </div>" +
                "  <div class='footer-container'>" +
                "    <p>*** This is a system generated email. Please do not reply to this email. ***</p>" +
                "    <p class='footer-unsubscribe'>You are receiving this email because you are registered as a " + greetingRole + " in our system.<br>To <a href='#'>unsubscribe</a> or change your email preferences please visit your profile.</p>" +
                "    <p style='margin-top: 20px;'><b>ZePRO Project Management System</b><br>Level 3, Global HQ, Bangalore, 560102<br>© 2026 ZePRO Tech</p>" +
                "  </div>" +
                "</body>" +
                "</html>";
    }
}
