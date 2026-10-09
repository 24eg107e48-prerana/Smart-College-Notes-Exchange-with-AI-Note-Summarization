package com.example.smartnotes.controller;

import com.example.smartnotes.dto.request.NoteUploadRequest;
import com.example.smartnotes.dto.request.ReviewRequest;
import com.example.smartnotes.dto.response.*;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.service.BookmarkService;
import com.example.smartnotes.service.NoteService;
import com.example.smartnotes.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/notes")
public class NoteController {

    private final NoteService noteService;
    private final BookmarkService bookmarkService;
    private final ReviewService reviewService;

    public NoteController(NoteService noteService, BookmarkService bookmarkService, ReviewService reviewService) {
        this.noteService = noteService;
        this.bookmarkService = bookmarkService;
        this.reviewService = reviewService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto>>> getNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<NoteDto> notes = noteService.searchAndFilterNotes(null, null, null, null, null, null, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Notes retrieved successfully", notes));
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto>>> searchNotes(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer semester,
            @RequestParam(required = false) String unit,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "9") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<NoteDto> notes = noteService.searchAndFilterNotes(keyword, subject, department, year, semester, unit, pageable, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Filtered notes retrieved successfully", notes));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<NoteDetailDto>> getNoteById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        NoteDetailDto noteDetail = noteService.getNoteDetails(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Note details retrieved successfully", noteDetail));
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<NoteDto>> uploadNote(
            @RequestParam("title") String title,
            @RequestParam("subject") String subject,
            @RequestParam("department") String department,
            @RequestParam("year") Integer year,
            @RequestParam("semester") Integer semester,
            @RequestParam(value = "unit", required = false) String unit,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "tags", required = false) String tags,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        NoteUploadRequest request = new NoteUploadRequest();
        request.setTitle(title);
        request.setSubject(subject);
        request.setDepartment(department);
        request.setYear(year);
        request.setSemester(semester);
        request.setUnit(unit);
        request.setDescription(description);
        request.setTags(tags);

        NoteDto created = noteService.uploadNote(currentUser, request, file);
        return new ResponseEntity<>(ApiResponse.ok("Note uploaded successfully and submitted for approval.", created), HttpStatus.CREATED);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        noteService.deleteNote(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Note deleted successfully"));
    }

    @GetMapping("/{id}/download")
    public ResponseEntity<Resource> downloadNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Resource file = noteService.downloadNoteFile(id, currentUser);
        String fileName = noteService.getNoteEntity(id).getFileName();

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + fileName + "\"")
                .body(file);
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> bookmarkNote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        bookmarkService.addBookmark(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Note bookmarked successfully"));
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<ApiResponse<Void>> removeBookmark(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        bookmarkService.removeBookmark(id, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Bookmark removed successfully"));
    }

    @GetMapping("/saved")
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto>>> getSavedNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<NoteDto> savedNotes = bookmarkService.getUserBookmarks(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Saved notes retrieved successfully", savedNotes));
    }

    @GetMapping("/my-notes")
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto>>> getMyNotes(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        PagedResponse<NoteDto> myNotes = noteService.getUserNotes(currentUser, pageable);
        return ResponseEntity.ok(ApiResponse.ok("User notes retrieved successfully", myNotes));
    }

    @PostMapping("/{id}/review")
    public ResponseEntity<ApiResponse<ReviewDto>> reviewNote(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser
    ) {
        ReviewDto review = reviewService.addOrUpdateReview(id, request, currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Review submitted successfully", review));
    }

    @GetMapping("/{id}/reviews")
    public ResponseEntity<ApiResponse<List<ReviewDto>>> getNoteReviews(@PathVariable Long id) {
        List<ReviewDto> reviews = reviewService.getNoteReviews(id);
        return ResponseEntity.ok(ApiResponse.ok("Reviews retrieved successfully", reviews));
    }
}
