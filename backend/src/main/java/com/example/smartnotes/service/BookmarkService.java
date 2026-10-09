package com.example.smartnotes.service;

import com.example.smartnotes.dto.response.NoteDto;
import com.example.smartnotes.dto.response.PagedResponse;
import com.example.smartnotes.entity.Bookmark;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.exception.BadRequestException;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.repository.BookmarkRepository;
import com.example.smartnotes.repository.NoteRepository;
import com.example.smartnotes.repository.UserRepository;
import com.example.smartnotes.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BookmarkService {

    private final BookmarkRepository bookmarkRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;
    private final NoteService noteService;

    public BookmarkService(
            BookmarkRepository bookmarkRepository,
            NoteRepository noteRepository,
            UserRepository userRepository,
            NoteService noteService
    ) {
        this.bookmarkRepository = bookmarkRepository;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
        this.noteService = noteService;
    }

    @Transactional
    public void addBookmark(Long noteId, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        if (bookmarkRepository.existsByUserAndNote(user, note)) {
            throw new BadRequestException("You have already bookmarked this note.");
        }

        Bookmark bookmark = new Bookmark(user, note);
        bookmarkRepository.save(bookmark);
    }

    @Transactional
    public void removeBookmark(Long noteId, UserPrincipal currentUser) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        bookmarkRepository.deleteByUserAndNote(user, note);
    }

    public PagedResponse<NoteDto> getUserBookmarks(UserPrincipal currentUser, Pageable pageable) {
        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Page<Bookmark> page = bookmarkRepository.findByUser(user, pageable);
        List<NoteDto> dtoList = page.getContent().stream()
                .map(b -> {
                    NoteDto dto = noteService.mapToDto(b.getNote(), user);
                    dto.setIsBookmarked(true);
                    return dto;
                })
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
}
