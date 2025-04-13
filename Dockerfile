# Build stage
FROM maven:3.8.4-openjdk-17-slim AS build
WORKDIR /app
COPY pom.xml .
COPY src ./src
RUN mvn clean package -DskipTests

# Run stage
FROM openjdk:17-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Create directories for Google Calendar credentials and tokens
RUN mkdir -p /app/credentials
RUN mkdir -p /app/tokens

# Environment variables
ENV SPRING_PROFILES_ACTIVE=prod
ENV GOOGLE_CREDENTIALS_FILE_PATH=/app/credentials/credentials.json
ENV GOOGLE_TOKENS_DIRECTORY_PATH=/app/tokens

# Expose the application port
EXPOSE 8080

# Run the application
ENTRYPOINT ["java", "-jar", "app.jar"] 