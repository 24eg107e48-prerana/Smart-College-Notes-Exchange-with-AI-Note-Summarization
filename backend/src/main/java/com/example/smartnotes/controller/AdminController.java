package com.example.smartnotes.controller;

import com.example.smartnotes.dto.response.AdminStatsDto;
import com.example.smartnotes.dto.response.ApiResponse;
import com.example.smartnotes.dto.response.NoteDto;
import com.example.smartnotes.dto.response.PagedResponse;
import com.example.smartnotes.dto.response.UserDto;
import com.example.smartnotes.service.AdminService;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<AdminStatsDto>> getStats() {
        AdminStatsDto stats = adminService.getAdminStats();
        return ResponseEntity.ok(ApiResponse.ok("Admin statistics retrieved", stats));
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<PagedResponse<UserDto>>> getUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<UserDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", users));
    }

    @GetMapping("/notes")
    public ResponseEntity<ApiResponse<PagedResponse<NoteDto>>> getNotes(
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PagedResponse<NoteDto> notes = adminService.getAllNotes(status, pageable);
        return ResponseEntity.ok(ApiResponse.ok("Notes retrieved successfully", notes));
    }

    @PutMapping("/notes/{id}/approve")
    public ResponseEntity<ApiResponse<NoteDto>> approveNote(@PathVariable Long id) {
        NoteDto approved = adminService.approveNote(id);
        return ResponseEntity.ok(ApiResponse.ok("Note approved successfully", approved));
    }

    @PutMapping("/notes/{id}/reject")
    public ResponseEntity<ApiResponse<NoteDto>> rejectNote(@PathVariable Long id) {
        NoteDto rejected = adminService.rejectNote(id);
        return ResponseEntity.ok(ApiResponse.ok("Note rejected successfully", rejected));
    }

    @DeleteMapping("/notes/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteNote(@PathVariable Long id) {
        adminService.deleteNote(id);
        return ResponseEntity.ok(ApiResponse.ok("Note permanently deleted by administrator"));
    }
}
