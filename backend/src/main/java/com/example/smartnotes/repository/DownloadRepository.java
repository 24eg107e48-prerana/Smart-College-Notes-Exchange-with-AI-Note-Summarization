package com.example.smartnotes.repository;

import com.example.smartnotes.entity.Download;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DownloadRepository extends JpaRepository<Download, Long> {
    List<Download> findByUser(User user);
    long countByUser(User user);
    long countByNote(Note note);
}
