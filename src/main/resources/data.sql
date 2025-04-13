-- Insert Users
INSERT INTO users (username, email) VALUES
('john_doe', 'ashishnamdev119@gmail.com'),
('jane_smith', 'ashishyt0909@gmail.com'),
('mike_wilson', 'mike.wilson@example.com'),
('sarah_jones', 'sarah.jones@example.com'),
('alex_brown', 'alex.brown@example.com');

-- Insert Interviews with status
INSERT INTO interviews (title, description, scheduled_time, interviewer_id, interviewee_id, status) VALUES
('Frontend Developer Interview', 'Technical interview for frontend position', '2025-04-15 10:00:00', 1, 2, 'SCHEDULED'),
('Backend Developer Interview', 'Technical interview for backend position', '2025-04-16 14:00:00', 2, 3, 'SCHEDULED'),
('System Design Interview', 'System design discussion for senior position', '2025-04-17 11:00:00', 3, 4, 'SCHEDULED'),
('Code Review Session', 'Code review and best practices discussion', '2025-04-18 15:00:00', 4, 5, 'SCHEDULED'),
('Technical Assessment', 'Practical coding assessment', '2024-04-19 13:00:00', 5, 1, 'SCHEDULED');

-- Insert Google Meets with status and meet links
INSERT INTO google_meets (meet_link, scheduled_time, interview_id, status) VALUES
('https://meet.google.com/abc-defg-hij', '2024-04-15 10:00:00', 1, 'SCHEDULED'),
('https://meet.google.com/xyz-uvw-rst', '2024-04-16 14:00:00', 2, 'SCHEDULED'); 