package com.interview.service;

import com.interview.model.GoogleMeet;
import com.interview.model.Interview;
import com.interview.model.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username:your-email@gmail.com}")
    private String fromEmail;

    public void sendCalendarInvite(Interview interview, GoogleMeet googleMeet, List<User> attendees) {
        try {
            logger.info("Preparing to send calendar invite for interview: {}", interview.getTitle());
            
            // Check if email configuration is valid
            if (fromEmail.equals("your-email@gmail.com")) {
                logger.warn("Email configuration is using default values. Emails will not be sent.");
                return;
            }
            
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            // Set email properties
            helper.setFrom(fromEmail);
            helper.setSubject("Calendar Invite: " + interview.getTitle());
            
            // Add only specific attendees as recipients
            for (User attendee : attendees) {
                if (shouldSendInviteToUser(attendee)) {
                    if (attendee != null && attendee.getEmail() != null && !attendee.getEmail().isEmpty()) {
                        helper.addTo(attendee.getEmail());
                        logger.info("Added recipient: {}", attendee.getEmail());
                    } else {
                        logger.warn("Skipping recipient with null or empty email");
                    }
                } else {
                    logger.info("Skipping recipient {} as they are not eligible for invites", 
                        attendee != null ? attendee.getEmail() : "null");
                }
            }

            // Create email content
            String content = createCalendarInviteContent(interview, googleMeet, attendees);
            helper.setText(content, true);

            // Send the email
            mailSender.send(message);
            logger.info("Calendar invite sent successfully");
        } catch (MessagingException e) {
            logger.error("Failed to send calendar invite: {}", e.getMessage(), e);
            // Don't throw the exception, just log it
        } catch (Exception e) {
            logger.error("Unexpected error while sending calendar invite: {}", e.getMessage(), e);
            // Don't throw the exception, just log it
        }
    }

    private boolean shouldSendInviteToUser(User user) {
        if (user == null) {
            return false;
        }

        // Add your specific conditions here
        // For example, only send to users with specific email domains
        String email = user.getEmail();
        if (email == null || email.isEmpty()) {
            return false;
        }

        // Only send to specific email addresses
        return email.equals("ashishnamdev119@gmail.com") ||
               email.equals("ashishyt0909@gmail.com");
    }

    private String createCalendarInviteContent(Interview interview, GoogleMeet googleMeet, List<User> attendees) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("EEEE, MMMM d, yyyy 'at' h:mm a");
        String formattedDate = interview.getScheduledTime().format(formatter);
        
        StringBuilder content = new StringBuilder();
        content.append("<html><body>");
        content.append("<h2>Calendar Invite: ").append(interview.getTitle()).append("</h2>");
        content.append("<p><strong>Description:</strong> ").append(interview.getDescription()).append("</p>");
        content.append("<p><strong>Date & Time:</strong> ").append(formattedDate).append("</p>");
        content.append("<p><strong>Google Meet Link:</strong> <a href='").append(googleMeet.getMeetLink()).append("'>").append(googleMeet.getMeetLink()).append("</a></p>");
        
        content.append("<h3>Attendees:</h3><ul>");
        for (User attendee : attendees) {
            if (attendee != null) {
                content.append("<li>").append(attendee.getUsername()).append(" (").append(attendee.getEmail()).append(")</li>");
            }
        }
        content.append("</ul>");
        
        content.append("<p>Please join the Google Meet at the scheduled time using the link above.</p>");
        content.append("<p>Thank you!</p>");
        content.append("</body></html>");
        
        return content.toString();
    }
} 