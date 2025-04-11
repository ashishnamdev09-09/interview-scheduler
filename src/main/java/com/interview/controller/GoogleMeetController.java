package com.interview.controller;

import com.interview.model.GoogleMeet;
import com.interview.model.Interview;
import com.interview.model.User;
import com.interview.service.GoogleMeetService;
import com.interview.service.InterviewService;
import com.interview.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/google-meet")
@CrossOrigin(origins = "http://localhost:3000")
public class GoogleMeetController {

    @Autowired
    private GoogleMeetService googleMeetService;

    @Autowired
    private UserService userService;

    @Autowired
    private InterviewService interviewService;

    @PostMapping("/schedule")
    public ResponseEntity<GoogleMeet> scheduleGoogleMeet(
            @RequestParam Long interviewerId,
            @RequestParam Long intervieweeId,
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledTime) {
        
        // Create interview
        Interview interview = new Interview();
        interview.setTitle(title);
        interview.setDescription(description);
        interview.setScheduledTime(scheduledTime);
        
        // Set interviewer and interviewee
        User interviewer = new User();
        interviewer.setId(interviewerId);
        interview.setInterviewer(interviewer);
        
        User interviewee = new User();
        interviewee.setId(intervieweeId);
        interview.setInterviewee(interviewee);
        
        // Save interview
        interview = interviewService.scheduleInterview(interview);
        
        // Schedule Google Meet
        GoogleMeet googleMeet = googleMeetService.scheduleGoogleMeet(interview, scheduledTime);
        
        return ResponseEntity.ok(googleMeet);
    }

    @PostMapping("/schedule-random-pair")
    public ResponseEntity<GoogleMeet> scheduleGoogleMeetForRandomPair(
            @RequestParam String title,
            @RequestParam String description,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime scheduledTime) {
        
        // Get random pair
        User[] randomPair = userService.getRandomPair();
        
        // Create interview
        Interview interview = new Interview();
        interview.setTitle(title);
        interview.setDescription(description);
        interview.setScheduledTime(scheduledTime);
        
        // Set interviewer and interviewee
        interview.setInterviewer(randomPair[0]);
        interview.setInterviewee(randomPair[1]);
        
        // Save interview
        interview = interviewService.scheduleInterview(interview);
        
        // Schedule Google Meet
        GoogleMeet googleMeet = googleMeetService.scheduleGoogleMeet(interview, scheduledTime);
        
        return ResponseEntity.ok(googleMeet);
    }
} 