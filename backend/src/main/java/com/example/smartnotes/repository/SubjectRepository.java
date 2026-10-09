package com.example.smartnotes.repository;

import com.example.smartnotes.entity.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByDepartment(String department);
    List<Subject> findByDepartmentAndSemester(String department, Integer semester);
}
