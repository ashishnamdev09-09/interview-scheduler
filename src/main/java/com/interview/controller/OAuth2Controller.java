package com.interview.controller;

import com.google.api.client.auth.oauth2.Credential;
import com.google.api.client.auth.oauth2.TokenResponse;
import com.google.api.client.googleapis.auth.oauth2.GoogleAuthorizationCodeFlow;
import com.google.api.client.googleapis.auth.oauth2.GoogleClientSecrets;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.client.util.store.FileDataStoreFactory;
import com.google.api.services.calendar.CalendarScopes;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.FileInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.List;

@RestController
public class OAuth2Controller {

    private static final Logger logger = LoggerFactory.getLogger(OAuth2Controller.class);
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();
    private static final List<String> SCOPES = Arrays.asList(
        CalendarScopes.CALENDAR,
        CalendarScopes.CALENDAR_EVENTS
    );

    @Value("${google.credentials.file.path}")
    private String credentialsFilePath;

    @Value("${google.tokens.directory.path}")
    private String tokensDirectoryPath;

    @GetMapping("/oauth2callback")
    public ResponseEntity<String> handleCallback(@RequestParam("code") String code) {
        try {
            // Build the calendar service
            final NetHttpTransport HTTP_TRANSPORT = GoogleNetHttpTransport.newTrustedTransport();
            
            // Load client secrets
            GoogleClientSecrets clientSecrets = GoogleClientSecrets.load(JSON_FACTORY,
                    new InputStreamReader(new FileInputStream(credentialsFilePath)));

            // Build flow
            GoogleAuthorizationCodeFlow flow = new GoogleAuthorizationCodeFlow.Builder(
                    HTTP_TRANSPORT, JSON_FACTORY, clientSecrets, SCOPES)
                    .setDataStoreFactory(new FileDataStoreFactory(new java.io.File(tokensDirectoryPath)))
                    .setAccessType("offline")
                    .build();

            // Exchange the authorization code for token response
            TokenResponse tokenResponse = flow.newTokenRequest(code)
                    .setRedirectUri("http://localhost:8080/oauth2callback")
                    .execute();

            // Store the credentials
            flow.createAndStoreCredential(tokenResponse, "user");

            return ResponseEntity.ok("Authorization successful! You can now close this window and return to the application.");
        } catch (Exception e) {
            logger.error("Failed to handle OAuth callback: {}", e.getMessage(), e);
            return ResponseEntity.badRequest().body("Authorization failed: " + e.getMessage());
        }
    }
} 