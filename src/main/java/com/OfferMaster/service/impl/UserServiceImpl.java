package com.OfferMaster.service.impl;

import com.OfferMaster.dto.LoginRequestDto;
import com.OfferMaster.dto.LoginResponseDto;
import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserRegistrationDto;
import com.OfferMaster.mapper.UserMapper;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.UserService;

import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final UserMapper userMapper;

    @Autowired
    public UserServiceImpl(UserRepository userRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil,
                           UserMapper userMapper) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.userMapper = userMapper;
    }

    @Override
    public UserDto registerUser(UserRegistrationDto registrationDto) {
        Optional<User> existingUser = userRepository.findByEmail(registrationDto.getEmail());
        if (existingUser.isPresent()) {
            throw new RuntimeException("User with email " + registrationDto.getEmail() + " already exists.");
        }
        User user = userMapper.toEntity(registrationDto);
        user.setPasswordHash(passwordEncoder.encode(registrationDto.getPassword()));
        User savedUser = userRepository.save(user);
        return userMapper.toDto(savedUser);
    }

    @Override
    public LoginResponseDto loginUser(LoginRequestDto loginRequest) {
        Optional<User> userOpt = userRepository.findByEmail(loginRequest.getIdentifier());
        if (userOpt.isEmpty()) {
            throw new RuntimeException("User not found with identifier: " + loginRequest.getIdentifier());
        }
        User user = userOpt.get();
        if (!passwordEncoder.matches(loginRequest.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid password");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new LoginResponseDto(token, userMapper.toDto(user));
    }
}
