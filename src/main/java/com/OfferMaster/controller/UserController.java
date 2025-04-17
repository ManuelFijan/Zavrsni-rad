package com.OfferMaster.controller;

import com.OfferMaster.dto.*;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;
    private final JwtUtil jwtUtil;

    @Autowired
    public UserController(UserService userService, JwtUtil jwtUtil) {
        this.userService = userService;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/register")
    public ResponseEntity<RegistrationResponseDto> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        UserDto userDto = userService.registerUser(registrationDto);
        String token = jwtUtil.generateToken(userDto.getEmail());
        return ResponseEntity.ok(new RegistrationResponseDto(token, userDto));
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponseDto> login(@Valid @RequestBody LoginRequestDto loginRequest) {
        LoginResponseDto loginResponse = userService.loginUser(loginRequest);
        return ResponseEntity.ok(loginResponse);
    }

    @PutMapping("/update")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody UserProfileUpdateDto profileUpdateDto) {
        UserDto updatedUser = userService.updateUserProfile(profileUpdateDto);
        return ResponseEntity.ok(updatedUser);
    }
}