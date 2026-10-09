package com.example.smartnotes.repository;

import com.example.smartnotes.entity.AiSummary;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AiSummaryRepository extends JpaRepository<AiSummary, Long> {
    Optional<AiSummary> findByNote(Note note);
    Optional<AiSummary> findByNoteId(Long noteId);
    boolean existsByNote(Note note);

    @Query("SELECT s FROM AiSummary s WHERE s.note.uploadedBy = :user ORDER BY s.createdAt DESC")
    List<AiSummary> findTop5ByUserNotes(@Param("user") User user);

    @Query("SELECT COUNT(s) FROM AiSummary s WHERE s.note.uploadedBy = :user")
    long countByUserNotes(@Param("user") User user);
}
