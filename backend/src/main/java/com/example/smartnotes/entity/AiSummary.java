package com.example.smartnotes.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "ai_summaries")
public class AiSummary {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "note_id", nullable = false, unique = true)
    private Note note;

    @Column(columnDefinition = "MEDIUMTEXT", nullable = false)
    private String summary;

    @Column(name = "key_points", columnDefinition = "LONGTEXT", nullable = false)
    private String keyPoints;

    @Column(name = "important_topics", columnDefinition = "LONGTEXT", nullable = false)
    private String importantTopics;

    @Column(columnDefinition = "LONGTEXT", nullable = false)
    private String keywords;

    @Column(name = "one_mark_questions", columnDefinition = "LONGTEXT", nullable = false)
    private String oneMarkQuestions;

    @Column(name = "three_mark_questions", columnDefinition = "LONGTEXT", nullable = false)
    private String threeMarkQuestions;

    @Column(name = "six_mark_questions", columnDefinition = "LONGTEXT", nullable = false)
    private String sixMarkQuestions;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    public AiSummary() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Note getNote() {
        return note;
    }

    public void setNote(Note note) {
        this.note = note;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(String keyPoints) {
        this.keyPoints = keyPoints;
    }

    public String getImportantTopics() {
        return importantTopics;
    }

    public void setImportantTopics(String importantTopics) {
        this.importantTopics = importantTopics;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getOneMarkQuestions() {
        return oneMarkQuestions;
    }

    public void setOneMarkQuestions(String oneMarkQuestions) {
        this.oneMarkQuestions = oneMarkQuestions;
    }

    public String getThreeMarkQuestions() {
        return threeMarkQuestions;
    }

    public void setThreeMarkQuestions(String threeMarkQuestions) {
        this.threeMarkQuestions = threeMarkQuestions;
    }

    public String getSixMarkQuestions() {
        return sixMarkQuestions;
    }

    public void setSixMarkQuestions(String sixMarkQuestions) {
        this.sixMarkQuestions = sixMarkQuestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
