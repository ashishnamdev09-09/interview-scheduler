package com.interview.controller;

import com.interview.model.GoogleMeet;
import com.interview.model.Interview;
import com.interview.model.User;
import com.interview.service.EmailService;
import com.interview.service.GoogleMeetService;
import com.interview.service.InterviewService;
import com.interview.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @Autowired
    private EmailService emailService;

    @Autowired
    private UserService userService;

    @Autowired
    private InterviewService interviewService;

    @Autowired
    private GoogleMeetService googleMeetService;

    @GetMapping("/send-test-email")
    public ResponseEntity<String> sendTestEmail() {
        try {
            // Get the first two users
            List<User> users = userService.getAllUsers();
            if (users.size() < 2) {
                return ResponseEntity.badRequest().body("Not enough users in the database");
            }

            User interviewer = users.get(0);
            User interviewee = users.get(1);

            // Create an interview
            Interview interview = new Interview();
            interview.setTitle("Test Interview");
            interview.setDescription("This is a test interview for email functionality");
            interview.setScheduledTime(LocalDateTime.now().plusDays(1));
            interview.setInterviewer(interviewer);
            interview.setInterviewee(interviewee);

            interview = interviewService.scheduleInterview(interview);

            // Create a Google Meet
            GoogleMeet googleMeet = new GoogleMeet();
            googleMeet.setMeetLink("https://meet.google.com/test-meet-id");
            googleMeet.setScheduledTime(interview.getScheduledTime());
            googleMeet.setInterview(interview);
            googleMeet.setStatus("SCHEDULED");

            // Send the email
            emailService.sendCalendarInvite(interview, googleMeet, Arrays.asList(interviewer, interviewee));

            return ResponseEntity.ok("Test email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to send test email: " + e.getMessage());
        }
    }
} 