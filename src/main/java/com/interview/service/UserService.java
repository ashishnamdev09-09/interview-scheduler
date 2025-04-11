package com.interview.service;

import com.interview.model.User;
import com.interview.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Random;

@Service
public class UserService {
    @Autowired
    private UserRepository userRepository;

    public User createUser(User user) {
        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        return userRepository.save(user);
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User[] getRandomPair() {
        List<User> users = userRepository.findAll();
        if (users.size() < 2) {
            throw new RuntimeException("Not enough users to create a pair");
        }
        
        Random random = new Random();
        int firstIndex = random.nextInt(users.size());
        int secondIndex;
        do {
            secondIndex = random.nextInt(users.size());
        } while (secondIndex == firstIndex);
        
        return new User[]{users.get(firstIndex), users.get(secondIndex)};
    }
} 