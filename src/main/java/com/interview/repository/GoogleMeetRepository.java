package com.interview.repository;

import com.interview.model.GoogleMeet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GoogleMeetRepository extends JpaRepository<GoogleMeet, Long> {
} 