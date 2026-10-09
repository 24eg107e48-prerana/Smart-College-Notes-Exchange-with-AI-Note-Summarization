package com.example.smartnotes.service;

import com.example.smartnotes.dto.request.NoteUploadRequest;
import com.example.smartnotes.dto.response.*;
import com.example.smartnotes.entity.*;
import com.example.smartnotes.exception.BadRequestException;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.exception.UnauthorizedException;
import com.example.smartnotes.repository.*;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.util.JsonHelper;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class NoteService {

    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final BookmarkRepository bookmarkRepository;
    private final DownloadRepository downloadRepository;
    private final ReviewRepository reviewRepository;
    private final AiSummaryRepository aiSummaryRepository;
    private final FileStorageService fileStorageService;

    public NoteService(
            NoteRepository noteRepository,
            UserRepository userRepository,
            BookmarkRepository bookmarkRepository,
            DownloadRepository downloadRepository,
            ReviewRepository reviewRepository,
            AiSummaryRepository aiSummaryRepository,
            FileStorageService fileStorageService
    ) {
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.downloadRepository = downloadRepository;
        this.reviewRepository = reviewRepository;
        this.aiSummaryRepository = aiSummaryRepository;
        this.fileStorageService = fileStorageService;
    }

    @Transactional
    public NoteDto uploadNote(UserPrincipal currentUser, NoteUploadRequest request, MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Please select a PDF file to upload.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        String storedFileName = fileStorageService.storeFile(file);

        Note note = new Note();
        note.setTitle(request.getTitle().trim());
        note.setSubject(request.getSubject().trim());
        note.setDepartment(request.getDepartment().trim());
        note.setYear(request.getYear());
        note.setSemester(request.getSemester());
        note.setUnit(request.getUnit() != null ? request.getUnit().trim() : null);
        note.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        note.setTags(request.getTags() != null ? request.getTags().trim() : null);
        note.setFileName(file.getOriginalFilename());
        note.setFilePath(storedFileName);
        note.setFileSize(file.getSize());
        note.setUploadedBy(user);
        // Default status is PENDING awaiting Admin approval
        note.setStatus(NoteStatus.PENDING);
        note.setViewCount(0);
        note.setDownloadCount(0);

        Note saved = noteRepository.save(note);
        return mapToDto(saved, user);
    }

    public PagedResponse<NoteDto> searchAndFilterNotes(
            String keyword,
            String subject,
            String department,
            Integer year,
            Integer semester,
            String unit,
            Pageable pageable,
            UserPrincipal currentUser
    ) {
        String cleanKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;
        String cleanSubject = (subject != null && !subject.trim().isEmpty() && !subject.equalsIgnoreCase("All")) ? subject.trim() : null;
        String cleanDepartment = (department != null && !department.trim().isEmpty() && !department.equalsIgnoreCase("All")) ? department.trim() : null;
        String cleanUnit = (unit != null && !unit.trim().isEmpty() && !unit.equalsIgnoreCase("All")) ? unit.trim() : null;

        Page<Note> page = noteRepository.searchAndFilterNotes(
                NoteStatus.APPROVED,
                cleanKeyword,
                cleanSubject,
                cleanDepartment,
                year,
                semester,
                cleanUnit,
                pageable
        );

        User user = currentUser != null ? userRepository.findById(currentUser.getId()).orElse(null) : null;
        List<NoteDto> dtoList = page.getContent().stream()
                .map(note -> mapToDto(note, user))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    @Transactional
    public NoteDetailDto getNoteDetails(Long id, UserPrincipal currentUser) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        // If not approved, only the uploader or an ADMIN can view it
        if (note.getStatus() != NoteStatus.APPROVED) {
            if (currentUser == null || (!currentUser.getId().equals(note.getUploadedBy().getId()) && currentUser.getRole() != Role.ADMIN)) {
                throw new UnauthorizedException("This note is currently pending administrative review.");
            }
        }

        // Increment view count
        note.setViewCount(note.getViewCount() + 1);
        noteRepository.save(note);

        User user = currentUser != null ? userRepository.findById(currentUser.getId()).orElse(null) : null;
        NoteDto noteDto = mapToDto(note, user);

        // Fetch AI summary if present
        Optional<AiSummary> summaryOpt = aiSummaryRepository.findByNote(note);
        AiSummaryDto aiSummaryDto = summaryOpt.map(this::mapSummaryToDto).orElse(null);

        // Fetch reviews
        List<Review> reviews = reviewRepository.findByNoteOrderByCreatedAtDesc(note);
        List<ReviewDto> reviewDtos = reviews.stream().map(r -> new ReviewDto(
                r.getId(),
                r.getUser().getId(),
                r.getUser().getName(),
                r.getRating(),
                r.getComment(),
                r.getCreatedAt()
        )).collect(Collectors.toList());

        boolean userReviewed = user != null && reviewRepository.findByUserAndNote(user, note).isPresent();

        return new NoteDetailDto(noteDto, aiSummaryDto, reviewDtos, userReviewed);
    }

    @Transactional
    public Resource downloadNoteFile(Long id, UserPrincipal currentUser) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        // Increment note download count
        note.setDownloadCount(note.getDownloadCount() + 1);
        noteRepository.save(note);

        // Record download history if authenticated
        if (currentUser != null) {
            userRepository.findById(currentUser.getId()).ifPresent(user -> {
                Download download = new Download(user, note);
                downloadRepository.save(download);
            });
        }

        return fileStorageService.loadFileAsResource(note.getFilePath());
    }

    public Note getNoteEntity(Long id) {
        return noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));
    }

    @Transactional
    public void deleteNote(Long id, UserPrincipal currentUser) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        boolean isOwner = currentUser.getId().equals(note.getUploadedBy().getId());
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isOwner && !isAdmin) {
            throw new UnauthorizedException("You do not have permission to delete this note.");
        }

        // Delete underlying file
        fileStorageService.deleteFile(note.getFilePath());

        noteRepository.delete(note);
    }

    public PagedResponse<NoteDto> getUserNotes(UserPrincipal currentUser, Pageable pageable) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        Page<Note> page = noteRepository.findByUploadedBy(user, pageable);
        List<NoteDto> dtoList = page.getContent().stream()
                .map(n -> mapToDto(n, user))
                .collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    public NoteDto mapToDto(Note note, User currentUser) {
        NoteDto dto = new NoteDto();
        dto.setId(note.getId());
        dto.setTitle(note.getTitle());
        dto.setSubject(note.getSubject());
        dto.setDepartment(note.getDepartment());
        dto.setYear(note.getYear());
        dto.setSemester(note.getSemester());
        dto.setUnit(note.getUnit());
        dto.setDescription(note.getDescription());
        dto.setTags(note.getTags());
        dto.setFileName(note.getFileName());
        dto.setFileSize(note.getFileSize());
        dto.setUploadedById(note.getUploadedBy().getId());
        dto.setUploadedByName(note.getUploadedBy().getName());
        dto.setStatus(note.getStatus().name());
        dto.setViewCount(note.getViewCount());
        dto.setDownloadCount(note.getDownloadCount());
        dto.setCreatedAt(note.getCreatedAt());

        Double avgRating = reviewRepository.getAverageRatingForNote(note);
        dto.setAverageRating(avgRating != null ? Math.round(avgRating * 10.0) / 10.0 : 0.0);
        dto.setReviewCount(reviewRepository.getReviewCountForNote(note));

        if (currentUser != null) {
            dto.setIsBookmarked(bookmarkRepository.existsByUserAndNote(currentUser, note));
        } else {
            dto.setIsBookmarked(false);
        }

        dto.setHasAiSummary(aiSummaryRepository.existsByNote(note));

        return dto;
    }

    private AiSummaryDto mapSummaryToDto(AiSummary s) {
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
