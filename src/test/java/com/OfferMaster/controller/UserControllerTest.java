package com.OfferMaster.controller;

import com.OfferMaster.dto.LoginRequestDto;
import com.OfferMaster.dto.LoginResponseDto;
import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserProfileUpdateDto;
import com.OfferMaster.dto.UserRegistrationDto;
import com.OfferMaster.enums.PrimaryAreaOfWork;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.UserService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.http.MediaType;

import static org.mockito.BDDMockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UserController.class)
class UserControllerTest {
    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private UserService svc;

    @MockitoBean
    private JwtUtil jwt;

    @Autowired
    private ObjectMapper mapper;

    @Test
    void register_returnsTokenAndUser() throws Exception {
        // build DTO via setters
        var regDto = new UserRegistrationDto();
        regDto.setEmail("a@b");
        regDto.setPassword("pass");
        regDto.setFirstName("First");
        regDto.setLastName("Last");
        regDto.setPrimaryAreaOfWork(PrimaryAreaOfWork.ELEKTRIKA);

        var userDto = new UserDto();
        userDto.setEmail("a@b");
        userDto.setFirstName("First");
        userDto.setLastName("Last");
        userDto.setPrimaryAreaOfWork(PrimaryAreaOfWork.ELEKTRIKA);

        given(svc.registerUser(any(UserRegistrationDto.class))).willReturn(userDto);
        given(jwt.generateToken(anyString())).willReturn("tok");

        mvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(regDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("tok"))
                .andExpect(jsonPath("$.user.email").value("a@b"));
    }

    @Test
    void login_returnsLoginResponse() throws Exception {
        var loginReq = new LoginRequestDto();
        loginReq.setIdentifier("a@b");
        loginReq.setPassword("pw");

        var userDto = new UserDto();
        userDto.setEmail("a@b");
        var loginResp = new LoginResponseDto("tok", userDto);

        given(svc.loginUser(any(LoginRequestDto.class))).willReturn(loginResp);

        mvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("tok"))
                .andExpect(jsonPath("$.user.email").value("a@b"));
    }

    @Test
    void updateProfile_returnsUpdatedUser() throws Exception {
        var updDto = new UserProfileUpdateDto();
        updDto.setFirstName("F");
        updDto.setLastName("L");
        updDto.setEmail("e@x");
        updDto.setPrimaryAreaOfWork(PrimaryAreaOfWork.KERAMIKA);

        var userDto = new UserDto();
        userDto.setEmail("e@x");
        userDto.setFirstName("F");
        userDto.setLastName("L");
        userDto.setPrimaryAreaOfWork(PrimaryAreaOfWork.KERAMIKA);

        given(svc.updateUserProfile(any(UserProfileUpdateDto.class))).willReturn(userDto);

        mvc.perform(put("/api/auth/update")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(updDto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("e@x"));
    }
}
