package com.example.smartnotes.repository;

import com.example.smartnotes.entity.Bookmark;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, Long> {

    Optional<Bookmark> findByUserAndNote(User user, Note note);

    boolean existsByUserAndNote(User user, Note note);

    void deleteByUserAndNote(User user, Note note);

    Page<Bookmark> findByUser(User user, Pageable pageable);

    long countByUser(User user);
}
