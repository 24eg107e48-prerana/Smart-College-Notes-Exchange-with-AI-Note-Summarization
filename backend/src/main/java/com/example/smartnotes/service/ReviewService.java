package com.example.smartnotes.service;

import com.example.smartnotes.dto.request.ReviewRequest;
import com.example.smartnotes.dto.response.ReviewDto;
import com.example.smartnotes.entity.Note;
import com.example.smartnotes.entity.Review;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.exception.BadRequestException;
import com.example.smartnotes.exception.ResourceNotFoundException;
import com.example.smartnotes.repository.NoteRepository;
import com.example.smartnotes.repository.ReviewRepository;
import com.example.smartnotes.repository.UserRepository;
import com.example.smartnotes.security.UserPrincipal;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final NoteRepository noteRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, NoteRepository noteRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.noteRepository = noteRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ReviewDto addOrUpdateReview(Long noteId, ReviewRequest request, UserPrincipal currentUser) {
        if (request.getRating() < 1 || request.getRating() > 5) {
            throw new BadRequestException("Rating must be an integer between 1 and 5.");
        }

        User user = userRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        Optional<Review> existingOpt = reviewRepository.findByUserAndNote(user, note);
        Review review;
        if (existingOpt.isPresent()) {
            review = existingOpt.get();
            review.setRating(request.getRating());
            review.setComment(request.getComment());
        } else {
            review = new Review(user, note, request.getRating(), request.getComment());
        }

        Review saved = reviewRepository.save(review);
        return new ReviewDto(
                saved.getId(),
                user.getId(),
                user.getName(),
                saved.getRating(),
                saved.getComment(),
                saved.getCreatedAt()
        );
    }

    public List<ReviewDto> getNoteReviews(Long noteId) {
        Note note = noteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Note not found with id: " + noteId));

        return reviewRepository.findByNoteOrderByCreatedAtDesc(note).stream()
                .map(r -> new ReviewDto(
                        r.getId(),
                        r.getUser().getId(),
                        r.getUser().getName(),
                        r.getRating(),
                        r.getComment(),
                        r.getCreatedAt()
                ))
                .collect(Collectors.toList());
    }
}
