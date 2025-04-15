package com.OfferMaster.service;

import com.OfferMaster.dto.*;

public interface UserService {
    UserDto registerUser(UserRegistrationDto userRegistrationDto);
    LoginResponseDto loginUser(LoginRequestDto loginRequest);
    UserDto updateUserProfile(UserProfileUpdateDto profileUpdateDto);
}