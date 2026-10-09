package com.example.smartnotes.service;

import com.example.smartnotes.dto.request.ProfileUpdateRequest;
import com.example.smartnotes.dto.response.AiSummaryDto;
import com.example.smartnotes.dto.response.NoteDto;
import com.example.smartnotes.dto.response.UserDto;
import com.example.smartnotes.entity.AiSummary;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.repository.AiSummaryRepository;
import com.example.smartnotes.repository.BookmarkRepository;
import com.example.smartnotes.repository.NoteRepository;
import com.example.smartnotes.repository.UserRepository;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.util.JsonHelper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final BookmarkRepository bookmarkRepository;
    private final AiSummaryRepository aiSummaryRepository;

    public UserService(
            UserRepository userRepository,
            NoteRepository noteRepository,
            BookmarkRepository bookmarkRepository,
            AiSummaryRepository aiSummaryRepository
    ) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.aiSummaryRepository = aiSummaryRepository;
    }

    public UserDto getProfile(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        UserDto dto = mapToDto(user);
        dto.setNotesCount(noteRepository.countByUploadedBy(user));
        dto.setDownloadsCount(noteRepository.getTotalDownloadsForUser(user));
        return dto;
    }

    @Transactional
    public UserDto updateProfile(UserPrincipal currentUser, ProfileUpdateRequest request) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        user.setName(request.getName().trim());
        user.setDepartment(request.getDepartment());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());

        User updated = userRepository.save(user);
        UserDto dto = mapToDto(updated);
        dto.setNotesCount(noteRepository.countByUploadedBy(updated));
        dto.setDownloadsCount(noteRepository.getTotalDownloadsForUser(updated));
        return dto;
    }

    public Map<String, Object> getStudentDashboard(UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + currentUser.getId()));

        long notesUploaded = noteRepository.countByUploadedBy(user);
        long totalDownloads = noteRepository.getTotalDownloadsForUser(user);
        long savedNotes = bookmarkRepository.countByUser(user);
        long aiSummaries = aiSummaryRepository.countByUserNotes(user);

        List<Note> recentNotes = noteRepository.findTop5ByUploadedByOrderByCreatedAtDesc(user);
        List<AiSummary> recentSummaries = aiSummaryRepository.findTop5ByUserNotes(user);

        Map<String, Object> dashboard = new HashMap<>();
        dashboard.put("stats", Map.of(
                "notesUploaded", notesUploaded,
                "totalDownloads", totalDownloads,
                "savedNotes", savedNotes,
                "aiSummaries", aiSummaries
        ));

        List<NoteDto> recentNotesDto = recentNotes.stream().map(note -> {
            NoteDto dto = new NoteDto();
            dto.setId(note.getId());
            dto.setTitle(note.getTitle());
            dto.setSubject(note.getSubject());
            dto.setDepartment(note.getDepartment());
            dto.setStatus(note.getStatus().name());
            dto.setDownloadCount(note.getDownloadCount());
            dto.setViewCount(note.getViewCount());
            dto.setCreatedAt(note.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        dashboard.put("recentNotes", recentNotesDto);

        List<AiSummaryDto> recentSummariesDto = recentSummaries.stream().map(s -> {
            AiSummaryDto dto = new AiSummaryDto();
            dto.setId(s.getId());
            dto.setNoteId(s.getNote().getId());
            dto.setSummary(s.getSummary().length() > 200 ? s.getSummary().substring(0, 200) + "..." : s.getSummary());
            dto.setKeyPoints(JsonHelper.fromJsonToList(s.getKeyPoints()));
            dto.setCreatedAt(s.getCreatedAt());
            return dto;
        }).collect(Collectors.toList());
        dashboard.put("recentSummaries", recentSummariesDto);

        return dashboard;
    }

    private UserDto mapToDto(User user) {
        UserDto dto = new UserDto();
        dto.setId(user.getId());
        dto.setName(user.getName());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole().name());
        dto.setDepartment(user.getDepartment());
        dto.setYear(user.getYear());
        dto.setSemester(user.getSemester());
        dto.setCreatedAt(user.getCreatedAt());
        return dto;
    }
}
