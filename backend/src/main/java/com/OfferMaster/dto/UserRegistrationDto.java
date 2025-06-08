package com.OfferMaster.dto;

import com.OfferMaster.enums.PrimaryAreaOfWork;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class UserRegistrationDto {
    @NotNull(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotNull(message = "Password is required")
    @Size(min = 6, message = "Password should be at least 6 characters")
    private String password;

    @NotNull(message = "First name is required")
    private String firstName;

    @NotNull(message = "Last name is required")
    private String lastName;

    @NotNull(message = "User type is required")
    private PrimaryAreaOfWork primaryAreaOfWork;

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

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

    public PrimaryAreaOfWork getPrimaryAreaOfWork() {
        return primaryAreaOfWork;
    }

    public void setPrimaryAreaOfWork(PrimaryAreaOfWork primaryAreaOfWork) {
        this.primaryAreaOfWork = primaryAreaOfWork;
    }
}