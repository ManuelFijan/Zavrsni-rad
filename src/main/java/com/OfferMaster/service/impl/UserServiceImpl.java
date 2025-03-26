package com.OfferMaster.service.impl;

import com.OfferMaster.dto.LoginRequestDto;
import com.OfferMaster.dto.LoginResponseDto;
import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserRegistrationDto;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.UserService;
import org.springframework.stereotype.Service;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDto registerUser(UserRegistrationDto userRegistrationDto) {
        return null;
    }

    @Override
    public LoginResponseDto loginUser(LoginRequestDto loginRequest) {
        return null;
    }
}
