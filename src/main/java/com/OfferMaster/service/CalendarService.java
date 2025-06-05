package com.OfferMaster.service;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;

import java.util.List;

public interface CalendarService {
    CalendarEventDto createEvent(CalendarEventCreateDto createDto);
    List<CalendarEventDto> getUserEvents();
    void deleteEvent(Long eventId);
}