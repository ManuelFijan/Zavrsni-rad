package com.OfferMaster.dto;

public class RegistrationResponseDto {
    private String accessToken;
    private final String tokenType = "Bearer";
    private UserDto user;

    public RegistrationResponseDto(String accessToken, UserDto user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    public String getAccessToken() {
        return accessToken;
    }
    public String getTokenType() {
        return tokenType;
    }
    public UserDto getUser() {
        return user;
    }
}
