package com.example.smartnotes.service;

import com.example.smartnotes.dto.response.AdminStatsDto;
import com.example.smartnotes.dto.response.NoteDto;
import com.example.smartnotes.dto.response.PagedResponse;
import com.example.smartnotes.dto.response.UserDto;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.NoteStatus;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.repository.AiSummaryRepository;
import com.example.smartnotes.repository.NoteRepository;
import com.example.smartnotes.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional(readOnly = true)
public class AdminService {

    private final UserRepository userRepository;
    private final NoteRepository noteRepository;
    private final AiSummaryRepository aiSummaryRepository;
    private final NoteService noteService;
    private final FileStorageService fileStorageService;

    public AdminService(
            UserRepository userRepository,
            NoteRepository noteRepository,
            AiSummaryRepository aiSummaryRepository,
            NoteService noteService,
            FileStorageService fileStorageService
    ) {
        this.userRepository = userRepository;
        this.noteRepository = noteRepository;
        this.aiSummaryRepository = aiSummaryRepository;
        this.noteService = noteService;
        this.fileStorageService = fileStorageService;
    }

    public AdminStatsDto getAdminStats() {
        long totalUsers = userRepository.count();
        long totalNotes = noteRepository.count();
        long pendingNotes = noteRepository.countByStatus(NoteStatus.PENDING);
        long approvedNotes = noteRepository.countByStatus(NoteStatus.APPROVED);
        long rejectedNotes = noteRepository.countByStatus(NoteStatus.REJECTED);
        long totalDownloads = noteRepository.getTotalDownloads();
        long totalAiSummaries = aiSummaryRepository.count();

        return new AdminStatsDto(
                totalUsers,
                totalNotes,
                pendingNotes,
                approvedNotes,
                rejectedNotes,
                totalDownloads,
                totalAiSummaries
        );
    }

    public PagedResponse<UserDto> getAllUsers(Pageable pageable) {
        Page<User> page = userRepository.findAll(pageable);
        List<UserDto> dtoList = page.getContent().stream().map(u -> {
            UserDto dto = new UserDto();
            dto.setId(u.getId());
            dto.setName(u.getName());
            dto.setEmail(u.getEmail());
            dto.setRole(u.getRole().name());
            dto.setDepartment(u.getDepartment());
            dto.setYear(u.getYear());
            dto.setSemester(u.getSemester());
            dto.setCreatedAt(u.getCreatedAt());
            dto.setNotesCount(noteRepository.countByUploadedBy(u));
            dto.setDownloadsCount(noteRepository.getTotalDownloadsForUser(u));
            return dto;
        }).collect(Collectors.toList());

        return new PagedResponse<>(
                dtoList,
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast()
        );
    }

    public PagedResponse<NoteDto> getAllNotes(String statusStr, Pageable pageable) {
        Page<Note> page;
        if (statusStr != null && !statusStr.trim().isEmpty() && !statusStr.equalsIgnoreCase("ALL")) {
            try {
                NoteStatus status = NoteStatus.valueOf(statusStr.toUpperCase());
                page = noteRepository.findByStatus(status, pageable);
            } catch (IllegalArgumentException e) {
                page = noteRepository.findAll(pageable);
            }
        } else {
            page = noteRepository.findAll(pageable);
        }

        List<NoteDto> dtoList = page.getContent().stream()
                .map(n -> noteService.mapToDto(n, null))
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
    public NoteDto approveNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        note.setStatus(NoteStatus.APPROVED);
        Note updated = noteRepository.save(note);
        return noteService.mapToDto(updated, null);
    }

    @Transactional
    public NoteDto rejectNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        note.setStatus(NoteStatus.REJECTED);
        Note updated = noteRepository.save(note);
        return noteService.mapToDto(updated, null);
    }

    @Transactional
    public void deleteNote(Long id) {
        Note note = noteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + id));

        fileStorageService.deleteFile(note.getFilePath());
        noteRepository.delete(note);
    }
}
