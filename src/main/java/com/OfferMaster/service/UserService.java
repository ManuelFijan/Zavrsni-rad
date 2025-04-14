package com.OfferMaster.service;

import com.OfferMaster.dto.LoginRequestDto;
import com.OfferMaster.dto.LoginResponseDto;
import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserRegistrationDto;

public interface UserService {
    UserDto registerUser(UserRegistrationDto userRegistrationDto);
    LoginResponseDto loginUser(LoginRequestDto loginRequest);
}