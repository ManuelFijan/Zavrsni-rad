package com.OfferMaster.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PasswordResetDto {
    @NotBlank
    private String token;
    @NotBlank
    private String newPassword;
}
