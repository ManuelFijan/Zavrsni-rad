package com.OfferMaster.service;

import com.OfferMaster.dto.*;
import com.OfferMaster.mapper.UserMapper;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.security.JwtUtil;
import com.OfferMaster.service.impl.UserServiceImpl;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.server.ResponseStatusException;

import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {
    @Mock
    UserRepository repo;
    @Mock
    PasswordEncoder enc;
    @Mock
    JwtUtil jwt;
    @Mock
    UserMapper mapper;
    @InjectMocks
    UserServiceImpl svc;

    @Test
    void registerUser_succeeds() {
        var reg = new UserRegistrationDto(/*…*/);
        var user = new User();
        var dto = new UserDto(/*…*/);
        given(repo.findByEmail(any())).willReturn(Optional.empty());
        given(mapper.toEntity(eq(reg))).willReturn(user);
        given(enc.encode(any())).willReturn("hash");
        given(repo.save(eq(user))).willReturn(user);
        given(mapper.toDto(eq(user))).willReturn(dto);

        assertThat(svc.registerUser(reg)).isEqualTo(dto);
    }

    @Test
    void registerUser_duplicate_throws() {
        var reg = new UserRegistrationDto(/*…*/);
        given(repo.findByEmail(any())).willReturn(Optional.of(new User()));

        assertThatThrownBy(() -> svc.registerUser(reg))
                .isInstanceOf(RuntimeException.class);
    }

    @Test
    void loginUser_invalidPassword_throws() {
        var req = new LoginRequestDto();
        req.setIdentifier("e");
        req.setPassword("pw");
        var user = new User();
        user.setPasswordHash("h");
        given(repo.findByEmail(any())).willReturn(Optional.of(user));
        given(enc.matches(any(), any())).willReturn(false);

        assertThatThrownBy(() -> svc.loginUser(req))
                .isInstanceOf(RuntimeException.class)
                .hasMessageContaining("Invalid");
    }

    @Test
    void loginUser_succeeds() {
        var req = new LoginRequestDto();
        req.setIdentifier("e");
        req.setPassword("pw");
        var user = new User();
        user.setPasswordHash("h");
        var dto = new UserDto(/*…*/);
        var resp = new LoginResponseDto("t", dto);
        given(repo.findByEmail(any())).willReturn(Optional.of(user));
        given(enc.matches(any(), any())).willReturn(true);
        given(jwt.generateToken(any())).willReturn("t");
        given(mapper.toDto(any())).willReturn(dto);

        LoginResponseDto out = svc.loginUser(req);
        assertThat(out.getAccessToken()).isEqualTo("t");
    }

    @Test
    void updateUserProfile_notFound_throws() {
        given(repo.findByEmail(any())).willReturn(Optional.empty());
        assertThatThrownBy(() -> svc.updateUserProfile(new UserProfileUpdateDto()))
                .isInstanceOf(ResponseStatusException.class);
    }
}
