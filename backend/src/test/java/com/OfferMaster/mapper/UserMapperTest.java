package com.OfferMaster.mapper;

import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserRegistrationDto;
import com.OfferMaster.enums.PrimaryAreaOfWork;
import com.OfferMaster.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class UserMapperTest {

    private final UserMapper userMapper = UserMapper.INSTANCE;
    private User user;
    private UserRegistrationDto registrationDto;

    @BeforeEach
    void setUp() {
        user = new User();
        user.setUserId(1L);
        user.setFirstName("John");
        user.setLastName("Doe");
        user.setEmail("john.doe@example.com");
        user.setPrimaryAreaOfWork(PrimaryAreaOfWork.KERAMIKA);
        user.setPasswordHash("hashedPassword123");

        registrationDto = new UserRegistrationDto();
        registrationDto.setFirstName("Jane");
        registrationDto.setLastName("Smith");
        registrationDto.setEmail("jane.smith@example.com");
        registrationDto.setPrimaryAreaOfWork(PrimaryAreaOfWork.KERAMIKA);
        registrationDto.setPassword("plainPassword123");
    }

    @Test
    void toDto_withCompleteUser_shouldMapAllFields() {
        UserDto result = userMapper.toDto(user);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(1L);
        assertThat(result.getFirstName()).isEqualTo("John");
        assertThat(result.getLastName()).isEqualTo("Doe");
        assertThat(result.getEmail()).isEqualTo("john.doe@example.com");
        assertThat(result.getPrimaryAreaOfWork()).isEqualTo(PrimaryAreaOfWork.KERAMIKA);
    }

    @Test
    void toDto_withNullUser_shouldReturnNull() {
        UserDto result = userMapper.toDto(null);

        assertThat(result).isNull();
    }

    @Test
    void toEntity_withCompleteRegistrationDto_shouldMapAllFields() {
        User result = userMapper.toEntity(registrationDto);

        assertThat(result).isNotNull();
        assertThat(result.getFirstName()).isEqualTo("Jane");
        assertThat(result.getLastName()).isEqualTo("Smith");
        assertThat(result.getEmail()).isEqualTo("jane.smith@example.com");
        assertThat(result.getPrimaryAreaOfWork()).isEqualTo(PrimaryAreaOfWork.KERAMIKA);
        assertThat(result.getUserId()).isNull();
    }

    @Test
    void toEntity_withNullRegistrationDto_shouldReturnNull() {
        User result = userMapper.toEntity(null);

        assertThat(result).isNull();
    }

    @Test
    void toDto_withMinimalUser_shouldMapRequiredFields() {
        User minimalUser = new User();
        minimalUser.setUserId(2L);
        minimalUser.setEmail("minimal@example.com");

        UserDto result = userMapper.toDto(minimalUser);

        assertThat(result).isNotNull();
        assertThat(result.getUserId()).isEqualTo(2L);
        assertThat(result.getEmail()).isEqualTo("minimal@example.com");
        assertThat(result.getFirstName()).isNull();
        assertThat(result.getLastName()).isNull();
        assertThat(result.getPrimaryAreaOfWork()).isNull();
    }
}