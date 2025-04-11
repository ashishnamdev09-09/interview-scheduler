package com.interview.service;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.DateTime;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.CalendarScopes;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventAttendee;
import com.google.api.services.calendar.model.EventDateTime;
import com.interview.model.GoogleMeet;
import com.interview.model.Interview;
import com.interview.model.User;
import com.interview.repository.GoogleMeetRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Service
public class GoogleMeetService {

    private static final Logger logger = LoggerFactory.getLogger(GoogleMeetService.class);
    private static final String APPLICATION_NAME = "Interview Scheduler";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final List<String> SCOPES = Arrays.asList(
        CalendarScopes.CALENDAR,
        CalendarScopes.CALENDAR_EVENTS
    );

    @Value("${google.credentials.file.path}")
    private String credentialsFilePath;

    @Value("${google.tokens.directory.path}")
    private String tokensDirectoryPath;

    @Autowired
    private GoogleMeetRepository googleMeetRepository;

    @Autowired
    private InterviewService interviewService;
    
    @Autowired
    private EmailService emailService;

    private Credential getCredentials() throws IOException, GeneralSecurityException {
        // Build the calendar service
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        
        // Load client secrets
        GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY,
                new InputStreamReader(new FileInputStream(credentialsFilePath)));

        // Build flow and trigger user authorization request
        GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(tokensDirectoryPath)))
                .setAccessType("offline")
                .build();

        // Get credentials
        Credential credential = flow.loadCredential("user");
        
        // If credentials are null or expired, we need to authorize
        if (credential == null || credential.getExpiresInSeconds() != null && credential.getExpiresInSeconds() <= 60L) {
            String authorizationUrl = flow.newAuthorizationUrl()
                    .setRedirectUri("http://localhost:8080/oauth2callback")
                    .build();
            
            logger.info("Please authorize the application by visiting this URL: {}", authorizationUrl);
            // In a real application, you would redirect the user to this URL
            // For now, we'll throw an exception with the URL
            throw new RuntimeException("Please authorize the application by visiting: " + authorizationUrl);
        }
        
        return credential;
    }

    public GoogleMeet scheduleGoogleMeet(Interview interview, LocalDateTime scheduledTime) {
        try {
            logger.info("Scheduling Google Meet for interview: {}", interview.getTitle());
            
            if (interview == null) {
                logger.error("Interview object is null");
                throw new IllegalArgumentException("Interview cannot be null");
            }
            
            if (scheduledTime == null) {
                logger.error("Scheduled time is null");
                throw new IllegalArgumentException("Scheduled time cannot be null");
            }
            
            // Create real Google Meet event
            Event event = createGoogleMeetEvent(interview, scheduledTime);
            logger.info("Created Google Calendar event with ID: {}", event.getId());
            
            // Get the Meet link from the event
            String meetLink = event.getHangoutLink();
            if (meetLink == null) {
                logger.error("Failed to get Meet link from event");
                throw new RuntimeException("Failed to create Google Meet link");
            }
            logger.info("Generated Meet link: {}", meetLink);
            
            // Save the Google Meet details
            GoogleMeet googleMeet = new GoogleMeet();
            googleMeet.setMeetLink(meetLink);
            googleMeet.setScheduledTime(scheduledTime);
            googleMeet.setInterview(interview);
            googleMeet.setStatus("SCHEDULED");
            
            googleMeet = googleMeetRepository.save(googleMeet);
            logger.info("Saved Google Meet with ID: {}", googleMeet.getId());
            
            try {
                // Send calendar invite via email
                List<User> attendees = Arrays.asList(interview.getInterviewer(), interview.getInterviewee());
                logger.info("Sending calendar invite to {} attendees", attendees.size());
                emailService.sendCalendarInvite(interview, googleMeet, attendees);
                logger.info("Calendar invite sent successfully");
            } catch (Exception e) {
                // Log the email error but don't fail the whole operation
                logger.error("Failed to send calendar invite: {}", e.getMessage(), e);
            }
            
            return googleMeet;
        } catch (Exception e) {
            logger.error("Failed to schedule Google Meet: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to schedule Google Meet: " + e.getMessage());
        }
    }

    private Event createGoogleMeetEvent(Interview interview, LocalDateTime scheduledTime) throws IOException, GeneralSecurityException {
        // Get credentials
        Credential credential = getCredentials();
        
        // Build the calendar service
        final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
        Calendar service = new Calendar.Builder(HTTP_TRANSPORT, JSON_FACTORY, credential)
                .setApplicationName(APPLICATION_NAME)
                .build();

        // Create event
        Event event = new Event()
                .setSummary(interview.getTitle())
                .setDescription(interview.getDescription());

        // Format the date/time in RFC3339 format without timezone information
        String startDateTime = scheduledTime.format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z";
        String endDateTime = scheduledTime.plusHours(1).format(java.time.format.DateTimeFormatter.ISO_LOCAL_DATE_TIME) + "Z";

        // Set start time
        EventDateTime start = new EventDateTime();
        start.setDateTime(DateTime.parseRfc3339(startDateTime));
        event.setStart(start);

        // Set end time (1 hour after start)
        EventDateTime end = new EventDateTime();
        end.setDateTime(DateTime.parseRfc3339(endDateTime));
        event.setEnd(end);

        // Add attendees
        EventAttendee[] attendees = new EventAttendee[] {
                new EventAttendee().setEmail(interview.getInterviewer().getEmail()),
                new EventAttendee().setEmail(interview.getInterviewee().getEmail())
        };
        event.setAttendees(Arrays.asList(attendees));

        // Set conference data for Google Meet
        event.setConferenceData(new com.google.api.services.calendar.model.ConferenceData()
                .setCreateRequest(new com.google.api.services.calendar.model.CreateConferenceRequest()
                        .setRequestId(java.util.UUID.randomUUID().toString())
                        .setConferenceSolutionKey(new com.google.api.services.calendar.model.ConferenceSolutionKey()
                                .setType("hangoutsMeet"))));

        // Insert the event with conference data
        return service.events().insert("primary", event)
                .setConferenceDataVersion(1)
                .execute();
    }
} 