package com.OfferMaster.service.impl;

import com.OfferMaster.dto.*;
import com.OfferMaster.mapper.UserMapper;
import com.OfferMaster.model.PasswordResetToken;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.PasswordResetTokenRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.EmailService;
import com.OfferMaster.service.UserService;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;
    private final PasswordResetTokenRepository tokenRepository;
    private final EmailService emailService;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           UserMapper userMapper, PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
        this.tokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    @Override
    public UserDto registerUser(UserRegistrationDto registrationDto) {
        Optional<User> existingUser = userRepository.findByEmail(registrationDto.getEmail());
        if (existingUser.isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This email is already registered. Please log in or use a different email."
            );
        }
        User user = userMapper.toEntity(registrationDto);
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public LoginResponseDto loginUser(LoginRequestDto loginRequest) {
        User user = userRepository.findByEmail(loginRequest.getIdentifier())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ili lozinka su pogrešni, pokušajte ponovno"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Email ili lozinka su pogrešni, pokušajte ponovno");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponseDto(token, userMapper.toDto(user));
    }

    @Override
    public UserDto updateUserProfile(UserProfileUpdateDto profileUpdateDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String currentEmail = authentication.getName();

        User user = userRepository.findByEmail(currentEmail)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with email " + currentEmail));

        userRepository.findByEmailIgnoreCase(profileUpdateDto.getEmail())
                .filter(u -> !u.getUserId().equals(user.getUserId()))
                .ifPresent(u -> {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "This email is already registered. Please use a different email."
                    );
                });

        user.setFirstName(profileUpdateDto.getFirstName());
        user.setLastName(profileUpdateDto.getLastName());
        user.setEmail(profileUpdateDto.getEmail());
        user.setPrimaryAreaOfWork(profileUpdateDto.getPrimaryAreaOfWork());

        User updatedUser = userRepository.save(user);
        return userMapper.toDto(updatedUser);
    }

    @Override
    public UserDto getCurrentUserProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String email = auth.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "User not found with email " + email
                ));
        return userMapper.toDto(user);
    }

    @Override
    public void forgotPassword(String email) {
        userRepository.findByEmail(email).ifPresent(user -> {
            String token = UUID.randomUUID().toString();
            tokenRepository.save(new PasswordResetToken(token, user, LocalDateTime.now().plusHours(1)));
            emailService.sendPasswordResetEmail(user.getEmail(), token);
        });
    }

    @Override
    public void resetPassword(String token, String newPassword) {
        PasswordResetToken prt = tokenRepository.findByToken(token)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nevažeći token"));
        if (prt.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Token je istekao");
        }
        User user = prt.getUser();
        user.setPasswordHash(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokenRepository.delete(prt);
    }
}