package com.OfferMaster.controller;

import com.OfferMaster.dto.*;
import com.OfferMaster.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class UserController {

    private final UserService userService;

    @Autowired
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<UserDto> register(@Valid @RequestBody UserRegistrationDto registrationDto) {
        UserDto userDto = userService.registerUser(registrationDto);
        return ResponseEntity.ok(userDto);
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