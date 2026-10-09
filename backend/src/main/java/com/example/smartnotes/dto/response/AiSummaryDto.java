package com.example.smartnotes.dto.response;

import java.time.LocalDateTime;
import java.util.List;

public class AiSummaryDto {
    private Long id;
    private Long noteId;
    private String summary;
    private List<String> keyPoints;
    private List<String> importantTopics;
    private List<String> keywords;
    private List<String> oneMarkQuestions;
    private List<String> threeMarkQuestions;
    private List<String> sixMarkQuestions;
    private LocalDateTime createdAt;

    public AiSummaryDto() {}

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public List<String> getKeyPoints() {
        return keyPoints;
    }

    public void setKeyPoints(List<String> keyPoints) {
        this.keyPoints = keyPoints;
    }

    public List<String> getImportantTopics() {
        return importantTopics;
    }

    public void setImportantTopics(List<String> importantTopics) {
        this.importantTopics = importantTopics;
    }

    public List<String> getKeywords() {
        return keywords;
    }

    public void setKeywords(List<String> keywords) {
        this.keywords = keywords;
    }

    public List<String> getOneMarkQuestions() {
        return oneMarkQuestions;
    }

    public void setOneMarkQuestions(List<String> oneMarkQuestions) {
        this.oneMarkQuestions = oneMarkQuestions;
    }

    public List<String> getThreeMarkQuestions() {
        return threeMarkQuestions;
    }

    public void setThreeMarkQuestions(List<String> threeMarkQuestions) {
        this.threeMarkQuestions = threeMarkQuestions;
    }

    public List<String> getSixMarkQuestions() {
        return sixMarkQuestions;
    }

    public void setSixMarkQuestions(List<String> sixMarkQuestions) {
        this.sixMarkQuestions = sixMarkQuestions;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
