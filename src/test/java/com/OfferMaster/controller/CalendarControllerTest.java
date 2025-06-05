package com.OfferMaster.controller;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.service.CalendarService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(CalendarController.class)
@AutoConfigureMockMvc(addFilters = false)
class CalendarControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private CalendarService calendarService;

    @MockitoBean
    private com.OfferMaster.security.JwtUtil jwtUtil;

    private CalendarEventDto calendarEventDto;
    private CalendarEventCreateDto calendarEventCreateDto;

    @BeforeEach
    void setUp() {
        calendarEventDto = new CalendarEventDto();
        calendarEventDto.setId(1L);
        calendarEventDto.setTitle("Test Event");
        calendarEventDto.setDate(LocalDate.now());
        calendarEventDto.setQuoteId(101L);

        calendarEventCreateDto = new CalendarEventCreateDto();
        calendarEventCreateDto.setTitle("New Test Event");
        calendarEventCreateDto.setDate(LocalDate.now().plusDays(1));
        calendarEventCreateDto.setQuoteId(102L);
    }

    @Test
    void createEvent_shouldReturn201Created() throws Exception {
        given(calendarService.createEvent(any(CalendarEventCreateDto.class))).willReturn(calendarEventDto);

        mockMvc.perform(post("/api/calendar-events")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(calendarEventCreateDto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").value(calendarEventDto.getId()))
                .andExpect(jsonPath("$.title").value(calendarEventDto.getTitle()));
    }

    @Test
    void getUserEvents_shouldReturnListOfEvents() throws Exception {
        given(calendarService.getUserEvents()).willReturn(List.of(calendarEventDto));

        mockMvc.perform(get("/api/calendar-events"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].id").value(calendarEventDto.getId()));
    }

    @Test
    void deleteEvent_shouldReturn204NoContent() throws Exception {
        Long eventIdToDelete = 1L;

        mockMvc.perform(delete("/api/calendar-events/{eventId}", eventIdToDelete))
                .andExpect(status().isNoContent());

        verify(calendarService, times(1)).deleteEvent(eventIdToDelete);
    }
}