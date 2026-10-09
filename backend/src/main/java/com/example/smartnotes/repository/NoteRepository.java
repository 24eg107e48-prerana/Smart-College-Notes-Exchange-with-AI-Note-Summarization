package com.example.smartnotes.repository;

import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.NoteStatus;
import com.example.smartnotes.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NoteRepository extends JpaRepository<Note, Long> {

    Page<Note> findByStatus(NoteStatus status, Pageable pageable);

    Page<Note> findByUploadedBy(User uploadedBy, Pageable pageable);

    List<Note> findTop5ByUploadedByOrderByCreatedAtDesc(User uploadedBy);

    List<Note> findTop6ByStatusOrderByCreatedAtDesc(NoteStatus status);

    long countByStatus(NoteStatus status);

    long countByUploadedBy(User uploadedBy);

    @Query("SELECT COALESCE(SUM(n.downloadCount), 0) FROM Note n")
    long getTotalDownloads();

    @Query("SELECT COALESCE(SUM(n.downloadCount), 0) FROM Note n WHERE n.uploadedBy = :user")
    long getTotalDownloadsForUser(@Param("user") User user);

    @Query("SELECT n FROM Note n WHERE n.status = :status AND " +
           "(:keyword IS NULL OR LOWER(n.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           " OR LOWER(n.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           " OR LOWER(n.tags) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:subject IS NULL OR LOWER(n.subject) = LOWER(:subject)) AND " +
           "(:department IS NULL OR LOWER(n.department) = LOWER(:department)) AND " +
           "(:year IS NULL OR n.year = :year) AND " +
           "(:semester IS NULL OR n.semester = :semester) AND " +
           "(:unit IS NULL OR LOWER(n.unit) = LOWER(:unit))")
    Page<Note> searchAndFilterNotes(
            @Param("status") NoteStatus status,
            @Param("keyword") String keyword,
            @Param("subject") String subject,
            @Param("department") String department,
            @Param("year") Integer year,
            @Param("semester") Integer semester,
            @Param("unit") String unit,
            Pageable pageable
    );
}
