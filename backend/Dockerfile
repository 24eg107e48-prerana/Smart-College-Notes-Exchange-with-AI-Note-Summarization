# ============================================================
# Stage 1: Build the Spring Boot application using Maven and Java 21
# ============================================================
FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy pom.xml and download dependencies to optimize caching
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy application source code and package executable JAR
COPY src ./src
RUN mvn clean package -DskipTests

# ============================================================
# Stage 2: Production Runtime Image using Java 21 JRE
# ============================================================
FROM eclipse-temurin:21-jre-jammy
WORKDIR /app

# Ensure upload directory exists for PDF file storage
RUN mkdir -p uploads/notes

# Copy built artifact from builder stage
COPY --from=build /app/target/*.jar app.jar

# Render assigns port dynamically via $PORT (defaults to 8080)
ENV PORT=8080
EXPOSE 8080

# Run Spring Boot application
ENTRYPOINT ["sh", "-c", "java -Djava.security.egd=file:/dev/./urandom -Dserver.port=${PORT} -jar app.jar"]
