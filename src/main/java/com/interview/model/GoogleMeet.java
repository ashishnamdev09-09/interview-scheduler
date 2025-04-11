package com.interview.model;

import lombok.Data;
import javax.persistence.*;
import java.time.LocalDateTime;

@Data
@Entity
@Table(name = "google_meets")
public class GoogleMeet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String meetLink;
    
    private LocalDateTime scheduledTime;
    
    @ManyToOne
    @JoinColumn(name = "interview_id")
    private Interview interview;
    
    private String status; // SCHEDULED, COMPLETED, CANCELLED
} 