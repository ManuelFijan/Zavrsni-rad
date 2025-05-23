package com.OfferMaster.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class PasswordResetRequestDto {
    @NotBlank @Email
    private String email;
}
