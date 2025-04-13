# Interview Scheduler

A full-stack application for scheduling interviews between users. Built with Spring Boot, React, and Tailwind CSS.

## Features

- Add users with username and email
- Randomly pair users for interviews
- Schedule interviews with title, description, and time
- Create Google Meet links for interviews
- Send calendar invites to participants
- Modern and responsive UI
- Docker support for easy deployment

## Prerequisites

- Java 11 or higher
- Maven
- Node.js and npm
- Google Account with Calendar API enabled
- Docker (optional)

## Backend Setup

1. Navigate to the root directory
2. Configure email settings:

   - Copy `src/main/resources/application.properties.example` to `src/main/resources/application.properties`
   - Update the email configuration with your Gmail credentials
   - For Gmail, you'll need to use an App Password if 2-Step Verification is enabled

3. Configure Google Calendar API:

   - Go to the [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google Calendar API
   - Create OAuth 2.0 credentials (Desktop application)
   - Download the credentials JSON file
   - Save it as `src/main/resources/credentials.json`

4. Run the Spring Boot application:
   ```bash
   ./mvnw spring-boot:run
   ```
5. The backend will start on http://localhost:8080

## Frontend Setup

1. Navigate to the frontend directory:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```
4. The frontend will start on http://localhost:3000

## Docker Setup

1. Build the Docker images:

   ```bash
   docker-compose build
   ```

2. Start the containers:

   ```bash
   docker-compose up
   ```

3. The application will be available at:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8080

## Usage

1. Add users using the "Add Users" tab
2. Switch to the "Schedule Interviews" tab
3. Click "Get Random Pair" to get two random users
4. Fill in the interview details and schedule the interview
5. The system will:
   - Create a Google Meet link
   - Send calendar invites to the participants
   - Store the meeting details in the database

## API Endpoints

### Users

- POST /api/users - Create a new user
- GET /api/users - Get all users
- GET /api/users/random-pair - Get a random pair of users

### Interviews

- POST /api/interviews - Schedule a new interview
- GET /api/interviews/user/{userId} - Get interviews for a user
- GET /api/interviews/{id} - Get interview by ID

### Google Meet

- POST /api/google-meet/schedule - Schedule a Google Meet for an interview
- POST /api/google-meet/schedule-random-pair - Schedule a Google Meet for a random pair of users

## Health Check

The application includes a health check endpoint at `/actuator/health` to monitor the application's status.

## License

MIT
