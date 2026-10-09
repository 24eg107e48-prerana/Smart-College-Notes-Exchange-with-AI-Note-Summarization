package com.example.smartnotes.service;

import com.example.smartnotes.dto.request.LoginRequest;
import com.example.smartnotes.dto.request.RegisterRequest;
import com.example.smartnotes.dto.response.AuthResponse;
import com.example.smartnotes.entity.Role;
import com.example.smartnotes.entity.User;
import com.example.smartnotes.exception.BadRequestException;
import com.example.smartnotes.exception.UnauthorizedException;
import com.example.smartnotes.repository.UserRepository;
import com.example.smartnotes.security.JwtService;
import com.example.smartnotes.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            AuthenticationManager authenticationManager
    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail().trim().toLowerCase())) {
            throw new BadRequestException("An account with email " + request.getEmail() + " already exists.");
        }

        User user = new User();
        user.setName(request.getName().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(Role.STUDENT);
        user.setDepartment(request.getDepartment());
        user.setYear(request.getYear());
        user.setSemester(request.getSemester());

        User savedUser = userRepository.save(user);

        UserPrincipal principal = UserPrincipal.create(savedUser);
        String token = jwtService.generateToken(principal);

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getName(),
                savedUser.getEmail(),
                savedUser.getRole().name(),
                savedUser.getDepartment(),
                savedUser.getYear(),
                savedUser.getSemester()
        );
    }

    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail().trim().toLowerCase(),
                            request.getPassword()
                    )
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            User user = userRepository.findById(principal.getId())
                    .orElseThrow(() -> new UnauthorizedException("User account not found."));

            String token = jwtService.generateToken(principal);

            return new AuthResponse(
                    token,
                    user.getId(),
                    user.getName(),
                    user.getEmail(),
                    user.getRole().name(),
                    user.getDepartment(),
                    user.getYear(),
                    user.getSemester()
            );
        } catch (Exception e) {
            throw new UnauthorizedException("Invalid email or password");
        }
    }
}
