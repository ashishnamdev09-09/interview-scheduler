CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS interviews (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    scheduled_time TIMESTAMP NOT NULL,
    interviewer_id BIGINT,
    interviewee_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    FOREIGN KEY (interviewer_id) REFERENCES users(id),
    FOREIGN KEY (interviewee_id) REFERENCES users(id)
);

CREATE TABLE IF NOT EXISTS google_meets (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    meet_link VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    interview_id BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED',
    FOREIGN KEY (interview_id) REFERENCES interviews(id)
); 