package com.example.smartnotes.repository;

import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.Review;
import com.example.smartnotes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {
    List<Review> findByNoteOrderByCreatedAtDesc(Note note);
    Optional<Review> findByUserAndNote(User user, Note note);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.note = :note")
    Double getAverageRatingForNote(@Param("note") Note note);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.note = :note")
    Long getReviewCountForNote(@Param("note") Note note);
}
