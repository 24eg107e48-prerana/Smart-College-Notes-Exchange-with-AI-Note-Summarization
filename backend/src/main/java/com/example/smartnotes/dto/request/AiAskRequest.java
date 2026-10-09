package com.example.smartnotes.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AiAskRequest {

    @NotNull(message = "Note ID is required")
    private Long noteId;

    @NotBlank(message = "Question cannot be blank")
    private String question;

    public AiAskRequest() {}

    public Long getNoteId() {
        return noteId;
    }

    public void setNoteId(Long noteId) {
        this.noteId = noteId;
    }

    public String getQuestion() {
        return question;
    }

    public void setQuestion(String question) {
        this.question = question;
    }
}
