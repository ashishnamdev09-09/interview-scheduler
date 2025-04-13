package com.interview.service;

import com.interview.model.Interview;
import com.interview.model.User;
import com.interview.repository.InterviewRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class InterviewService {
    @Autowired
    private InterviewRepository interviewRepository;

    public List<Interview> getAllInterviews() {
        return interviewRepository.findAll();
    }

    public Interview scheduleInterview(Interview interview) {
        return interviewRepository.save(interview);
    }

    public List<Interview> getInterviewsForUser(User user) {
        return interviewRepository.findByInterviewerOrInterviewee(user, user);
    }

    public Interview getInterviewById(Long id) {
        return interviewRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Interview not found"));
    }
} 