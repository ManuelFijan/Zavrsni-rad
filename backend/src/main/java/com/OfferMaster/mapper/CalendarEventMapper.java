package com.OfferMaster.mapper;

import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.model.CalendarEvent;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.factory.Mappers;

@Mapper(componentModel = "spring")
public interface CalendarEventMapper {
    CalendarEventMapper INSTANCE = Mappers.getMapper(CalendarEventMapper.class);

    @Mapping(source = "eventDate", target = "date")
    @Mapping(target = "quoteId", expression = "java(event.getQuote() != null ? event.getQuote().getId() : null)")
    CalendarEventDto toDto(CalendarEvent event);
}