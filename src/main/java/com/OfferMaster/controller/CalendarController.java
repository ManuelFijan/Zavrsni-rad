package com.OfferMaster.controller;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.service.CalendarService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/calendar-events")
public class CalendarController {

    private final CalendarService calendarService;

    @Autowired
    public CalendarController(CalendarService calendarService) {
        this.calendarService = calendarService;
    }

    @PostMapping
    public ResponseEntity<CalendarEventDto> createEvent(@Valid @RequestBody CalendarEventCreateDto createDto) {
        CalendarEventDto createdEvent = calendarService.createEvent(createDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdEvent);
    }

    @GetMapping
    public ResponseEntity<List<CalendarEventDto>> getUserEvents() {
        List<CalendarEventDto> events = calendarService.getUserEvents();
        return ResponseEntity.ok(events);
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable Long eventId) {
        calendarService.deleteEvent(eventId);
        return ResponseEntity.noContent().build();
    }
}