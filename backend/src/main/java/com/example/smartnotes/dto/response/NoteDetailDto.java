package com.example.smartnotes.dto.response;

import java.util.List;

public class NoteDetailDto {
    private NoteDto note;
    private AiSummaryDto aiSummary;
    private List<ReviewDto> reviews;
    private Boolean userReviewed;

    public NoteDetailDto() {}

    public NoteDetailDto(NoteDto note, AiSummaryDto aiSummary, List<ReviewDto> reviews, Boolean userReviewed) {
        this.note = note;
        this.aiSummary = aiSummary;
        this.reviews = reviews;
        this.userReviewed = userReviewed;
    }

    public NoteDto getNote() {
        return note;
    }

    public void setNote(NoteDto note) {
        this.note = note;
    }

    public AiSummaryDto getAiSummary() {
        return aiSummary;
    }

    public void setAiSummary(AiSummaryDto aiSummary) {
        this.aiSummary = aiSummary;
    }

    public List<ReviewDto> getReviews() {
        return reviews;
    }

    public void setReviews(List<ReviewDto> reviews) {
        this.reviews = reviews;
    }

    public Boolean getUserReviewed() {
        return userReviewed;
    }

    public void setUserReviewed(Boolean userReviewed) {
        this.userReviewed = userReviewed;
    }
}
