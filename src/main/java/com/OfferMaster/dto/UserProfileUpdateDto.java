package com.OfferMaster.dto;

import com.OfferMaster.enums.PrimaryAreaOfWork;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public class UserProfileUpdateDto {

    @NotBlank(message = "First name is required")
    private String firstName;

    @NotBlank(message = "Last name is required")
    private String lastName;

    @Email(message = "Enter a valid email")
    @NotBlank(message = "Email is required")
    private String email;

    private PrimaryAreaOfWork primaryAreaOfWork;

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public PrimaryAreaOfWork getPrimaryAreaOfWork() {
        return primaryAreaOfWork;
    }

    public void setPrimaryAreaOfWork(PrimaryAreaOfWork primaryAreaOfWork) {
        this.primaryAreaOfWork = primaryAreaOfWork;
    }
}