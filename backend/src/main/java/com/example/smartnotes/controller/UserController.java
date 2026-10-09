package com.example.smartnotes.controller;

import com.example.smartnotes.dto.request.ProfileUpdateRequest;
import com.example.smartnotes.dto.response.ApiResponse;
import com.example.smartnotes.dto.response.UserDto;
import com.example.smartnotes.security.UserPrincipal;
import com.example.smartnotes.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> getProfile(@AuthenticationPrincipal UserPrincipal currentUser) {
        UserDto profile = userService.getProfile(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Profile retrieved successfully", profile));
    }

    @PutMapping("/profile")
    public ResponseEntity<ApiResponse<UserDto>> updateProfile(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody ProfileUpdateRequest request
    ) {
        UserDto updated = userService.updateProfile(currentUser, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", updated));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard(@AuthenticationPrincipal UserPrincipal currentUser) {
        Map<String, Object> dashboard = userService.getStudentDashboard(currentUser);
        return ResponseEntity.ok(ApiResponse.ok("Student dashboard metrics loaded", dashboard));
    }
}
