package com.example.smartnotes.dto.response;

import java.time.LocalDateTime;

public class AiAskResponse {
    private String question;
    private String answer;
    private Long noteId;
    private String noteTitle;
    private LocalDateTime timestamp;

    public AiAskResponse() {}

    public AiAskResponse(String question, String answer, Long noteId, String noteTitle) {
        this.question = question;
        this.answer = answer;
        this.noteId = noteId;
        this.noteTitle = noteTitle;
        this.timestamp = LocalDateTime.now();
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }

    public String getAnswer() {
        return answer;
    }

    public void setAnswer(String answer) {
        this.answer = answer;
    }

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getNoteTitle() {
        return noteTitle;
    }

    public void setNoteTitle(String noteTitle) {
        this.noteTitle = noteTitle;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }
}
