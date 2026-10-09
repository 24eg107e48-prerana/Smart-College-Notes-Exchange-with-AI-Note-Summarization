package com.example.smartnotes.dto.response;

public class AdminStatsDto {
    private long totalUsers;
    private long totalNotes;
    private long pendingNotes;
    private long approvedNotes;
    private long rejectedNotes;
    private long totalDownloads;
    private long totalAiSummaries;

    public AdminStatsDto() {}

    public AdminStatsDto(long totalUsers, long totalNotes, long pendingNotes, long approvedNotes, long rejectedNotes, long totalDownloads, long totalAiSummaries) {
        this.totalUsers = totalUsers;
        this.totalNotes = totalNotes;
        this.pendingNotes = pendingNotes;
        this.approvedNotes = approvedNotes;
        this.rejectedNotes = rejectedNotes;
        this.totalDownloads = totalDownloads;
        this.totalAiSummaries = totalAiSummaries;
    }

    public long getTotalUsers() {
        return totalUsers;
    }

    public void setTotalUsers(long totalUsers) {
        this.totalUsers = totalUsers;
    }

    public long getTotalNotes() {
        return totalNotes;
    }

    public void setTotalNotes(long totalNotes) {
        this.totalNotes = totalNotes;
    }

    public long getPendingNotes() {
        return pendingNotes;
    }

    public void setPendingNotes(long pendingNotes) {
        this.pendingNotes = pendingNotes;
    }

    public long getApprovedNotes() {
        return approvedNotes;
    }

    public void setApprovedNotes(long approvedNotes) {
        this.approvedNotes = approvedNotes;
    }

    public long getRejectedNotes() {
        return rejectedNotes;
    }

    public void setRejectedNotes(long rejectedNotes) {
        this.rejectedNotes = rejectedNotes;
    }

    public long getTotalDownloads() {
        return totalDownloads;
    }

    public void setTotalDownloads(long totalDownloads) {
        this.totalDownloads = totalDownloads;
    }

    public long getTotalAiSummaries() {
        return totalAiSummaries;
    }

    public void setTotalAiSummaries(long totalAiSummaries) {
        this.totalAiSummaries = totalAiSummaries;
    }
}
