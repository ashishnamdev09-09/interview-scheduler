package com.interview.repository;

import com.interview.model.Interview;
import com.interview.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByInterviewerOrInterviewee(User interviewer, User interviewee);
} 