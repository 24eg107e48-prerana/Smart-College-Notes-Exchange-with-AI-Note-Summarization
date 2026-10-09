package com.example.smartnotes.controller;

import com.example.smartnotes.dto.request.AiAskRequest;
import com.example.smartnotes.dto.response.AiAskResponse;
import com.example.smartnotes.dto.response.AiSummaryDto;
import com.example.smartnotes.dto.response.ApiResponse;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.service.AiSummaryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiSummaryService aiSummaryService;

    public AiController(AiSummaryService aiSummaryService) {
        this.aiSummaryService = aiSummaryService;
    }

    @PostMapping("/summarize/{noteId}")
    public ResponseEntity<ApiResponse<AiSummaryDto>> summarizeNote(
            @PathVariable Long noteId,
            @RequestParam(defaultValue = "false") boolean force,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AiSummaryDto summary = aiSummaryService.generateOrGetSummary(noteId, force, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("AI Summary generated successfully", summary));
    }

    @GetMapping("/summary/{noteId}")
    public ResponseEntity<ApiResponse<AiSummaryDto>> getNoteSummary(@PathVariable Long noteId) {
        AiSummaryDto summary = aiSummaryService.getSummaryByNoteId(noteId);
        return ResponseEntity.ok(ApiResponse.ok("AI Summary retrieved successfully", summary));
    }

    @PostMapping("/ask")
    public ResponseEntity<ApiResponse<AiAskResponse>> askStudyAssistant(
            @Valid @RequestBody AiAskRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        AiAskResponse response = aiSummaryService.askStudyAssistant(request.getNoteId(), request.getQuestion(), currentUser);
        return ResponseEntity.ok(ApiResponse.ok("AI response generated", response));
    }
}
