package com.example.smartnotes.service;

import com.example.smartnotes.dto.response.AiAskResponse;
import com.example.smartnotes.dto.response.AiSummaryDto;
import com.example.smartnotes.entity.AiSummary;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.repository.AiSummaryRepository;
import com.example.smartnotes.repository.NoteRepository;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.util.JsonHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.util.Optional;

@Service
public class AiSummaryService {

    private final AiSummaryRepository aiSummaryRepository;
    private final NoteRepository noteRepository;
    private final FileStorageService fileStorageService;
    private final PdfExtractionService pdfExtractionService;
    private final GeminiService geminiService;

    public AiSummaryService(
            AiSummaryRepository aiSummaryRepository,
            NoteRepository noteRepository,
            FileStorageService fileStorageService,
            PdfExtractionService pdfExtractionService,
            GeminiService geminiService
    ) {
        this.aiSummaryRepository = aiSummaryRepository;
        this.noteRepository = noteRepository;
        this.fileStorageService = fileStorageService;
        this.pdfExtractionService = pdfExtractionService;
        this.geminiService = geminiService;
    }

    @Transactional
    public AiSummaryDto generateOrGetSummary(Long noteId, boolean forceRegenerate, UserPrincipal currentUser) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        // Check cache if regeneration is not requested
        if (!forceRegenerate) {
            Optional<AiSummary> existingOpt = aiSummaryRepository.findByNote(note);
            if (existingOpt.isPresent()) {
                return mapToDto(existingOpt.get());
            }
        }

        // 1. Locate PDF file
        File pdfFile = fileStorageService.getFile(note.getFilePath());

        // 2. Extract text using PDFBox
        String extractedText = pdfExtractionService.extractText(pdfFile);

        // 3. Call Gemini AI through backend service
        GeminiService.GeminiSummaryResult result = geminiService.generateSummaryAndQuestions(
                note.getTitle(),
                note.getSubject(),
                extractedText
        );

        // 4. Save or update AI summary in database
        AiSummary aiSummary = aiSummaryRepository.findByNote(note).orElse(new AiSummary());
        aiSummary.setNote(note);
        aiSummary.setSummary(result.summary());
        aiSummary.setKeyPoints(JsonHelper.toJson(result.keyPoints()));
        aiSummary.setImportantTopics(JsonHelper.toJson(result.importantTopics()));
        aiSummary.setKeywords(JsonHelper.toJson(result.keywords()));
        aiSummary.setOneMarkQuestions(JsonHelper.toJson(result.oneMarkQuestions()));
        aiSummary.setThreeMarkQuestions(JsonHelper.toJson(result.threeMarkQuestions()));
        aiSummary.setSixMarkQuestions(JsonHelper.toJson(result.sixMarkQuestions()));

        AiSummary saved = aiSummaryRepository.save(aiSummary);
        return mapToDto(saved);
    }

    public AiSummaryDto getSummaryByNoteId(Long noteId) {
        AiSummary aiSummary = aiSummaryRepository.findByNoteId(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("No AI Summary found for note id: " + noteId));
        return mapToDto(aiSummary);
    }

    public AiAskResponse askStudyAssistant(Long noteId, String question, UserPrincipal currentUser) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        // Always extract full PDF text from disk as the primary knowledge context
        String extractedPdfText = "";
        try {
            File pdfFile = fileStorageService.getFile(note.getFilePath());
            if (pdfFile != null && pdfFile.exists()) {
                extractedPdfText = pdfExtractionService.extractText(pdfFile);
            }
        } catch (Exception e) {
            // Log and continue with note metadata
        }

        StringBuilder contextBuilder = new StringBuilder();
        if (extractedPdfText != null && !extractedPdfText.isBlank()) {
            contextBuilder.append(extractedPdfText).append("\n\n");
        }

        Optional<AiSummary> summaryOpt = aiSummaryRepository.findByNote(note);
        if (summaryOpt.isPresent()) {
            AiSummary summary = summaryOpt.get();
            contextBuilder.append("DOCUMENT SUMMARY:\n").append(summary.getSummary()).append("\n\n");
            contextBuilder.append("KEY POINTS:\n").append(summary.getKeyPoints()).append("\n\n");
        }

        String context = contextBuilder.toString();
        if (context.isBlank()) {
            context = "Note Title: " + note.getTitle() + "\nSubject: " + note.getSubject() + "\nDepartment: " + note.getDepartment();
        }

        String answer = geminiService.askStudyAssistant(
                note.getTitle(),
                note.getSubject(),
                context,
                question
        );

        return new AiAskResponse(question, answer, note.getId(), note.getTitle());
    }

    private AiSummaryDto mapToDto(AiSummary s) {
        AiSummaryDto dto = new AiSummaryDto();
        dto.setId(s.getId());
        dto.setNoteId(s.getNote().getId());
        dto.setSummary(s.getSummary());
        dto.setKeyPoints(JsonHelper.fromJsonToList(s.getKeyPoints()));
        dto.setImportantTopics(JsonHelper.fromJsonToList(s.getImportantTopics()));
        dto.setKeywords(JsonHelper.fromJsonToList(s.getKeywords()));
        dto.setOneMarkQuestions(JsonHelper.fromJsonToList(s.getOneMarkQuestions()));
        dto.setThreeMarkQuestions(JsonHelper.fromJsonToList(s.getThreeMarkQuestions()));
        dto.setSixMarkQuestions(JsonHelper.fromJsonToList(s.getSixMarkQuestions()));
        dto.setCreatedAt(s.getCreatedAt());
        return dto;
    }
}
