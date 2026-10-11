# ============================================================
# Root Multi-stage Dockerfile for Spring Boot Backend (Java 21)
# Allows building directly from repository root context
# ============================================================

# Stage 1: Build application with Maven and Java 21
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and cache dependencies
COPY backend/pom.xml .
RUN mvn dependency:go-offline -B

# Copy backend source code and build jar
COPY backend/src ./src
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Minimal Java 21 JRE Runtime
# ============================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Ensure local upload storage directory exists
RUN mkdir -p uploads/notes

# Copy executable jar from build stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns port dynamically via $PORT
ENV PORT=8080
EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
