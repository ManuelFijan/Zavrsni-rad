package com.OfferMaster.mapper;

import com.OfferMaster.dto.UserDto;
import com.OfferMaster.dto.UserRegistrationDto;
import com.OfferMaster.model.User;
import org.mapstruct.Mapper;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface UserMapper {
    UserMapper INSTANCE = Mappers.getMapper(UserMapper.class);
    User toEntity(UserRegistrationDto userRegistrationDto);
    UserDto toDto(User user);
}