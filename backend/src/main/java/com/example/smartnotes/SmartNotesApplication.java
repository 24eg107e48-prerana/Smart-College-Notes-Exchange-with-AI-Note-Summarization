package com.example.smartnotes;

import com.example.smartnotes.entity.Role;
import com.example.smartnotes.entity.Subject;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.repository.SubjectRepository;
import com.example.smartnotes.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class SmartNotesApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartNotesApplication.class, args);
    }

    @Bean
    public CommandLineRunner initDatabase(
            UserRepository userRepository,
            SubjectRepository subjectRepository,
            PasswordEncoder passwordEncoder
    ) {
        return args -> {
            // Seed default administrator if not present
            if (!userRepository.existsByEmail("admin@smartnotes.edu")) {
                User admin = new User(
                        "System Admin",
                        "admin@smartnotes.edu",
                        passwordEncoder.encode("admin123"),
                        Role.ADMIN,
                        "Administration",
                        4,
                        8
                );
                userRepository.save(admin);
                System.out.println(">>> Seeded default administrator: admin@smartnotes.edu / admin123");
            }

            // Seed default subjects if catalog is empty
            if (subjectRepository.count() == 0) {
                List<Subject> initialSubjects = List.of(
                        new Subject("Data Structures & Algorithms", "Computer Science", 3),
                        new Subject("Database Management Systems", "Computer Science", 4),
                        new Subject("Operating Systems", "Computer Science", 4),
                        new Subject("Computer Networks", "Computer Science", 5),
                        new Subject("Artificial Intelligence & Machine Learning", "Computer Science", 6),
                        new Subject("Software Engineering", "Computer Science", 5),
                        new Subject("Analog & Digital Electronics", "Electronics & Comm", 3),
                        new Subject("Signals and Systems", "Electronics & Comm", 4),
                        new Subject("Thermodynamics", "Mechanical Engineering", 3),
                        new Subject("Engineering Mathematics", "First Year Common", 1)
                );
                subjectRepository.saveAll(initialSubjects);
                System.out.println(">>> Seeded " + initialSubjects.size() + " academic syllabus subjects.");
            }
        };
    }
}
