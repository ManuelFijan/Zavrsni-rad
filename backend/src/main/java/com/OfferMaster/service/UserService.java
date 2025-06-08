package com.OfferMaster.service;

import com.OfferMaster.dto.*;

public interface UserService {
    UserDto registerUser(UserRegistrationDto userRegistrationDto);
    LoginResponseDto loginUser(LoginRequestDto loginRequest);
    UserDto updateUserProfile(UserProfileUpdateDto profileUpdateDto);
    UserDto getCurrentUserProfile();
    void forgotPassword(String email);
    void resetPassword(String token, String newPassword);
}