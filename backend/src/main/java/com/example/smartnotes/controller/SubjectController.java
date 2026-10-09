package com.example.smartnotes.controller;

import com.example.smartnotes.dto.response.ApiResponse;
import com.example.smartnotes.entity.Subject;
import com.example.smartnotes.repository.SubjectRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final SubjectRepository subjectRepository;

    public SubjectController(SubjectRepository subjectRepository) {
        this.subjectRepository = subjectRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Subject>>> getAllSubjects(
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer semester
    ) {
        List<Subject> subjects;
        if (department != null && semester != null) {
            subjects = subjectRepository.findByDepartmentAndSemester(department, semester);
        } else if (department != null) {
            subjects = subjectRepository.findByDepartment(department);
        } else {
            subjects = subjectRepository.findAll();
        }
        return ResponseEntity.ok(ApiResponse.ok("Subjects retrieved", subjects));
    }
}
