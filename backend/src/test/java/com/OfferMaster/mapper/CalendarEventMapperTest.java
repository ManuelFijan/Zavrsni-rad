package com.OfferMaster.mapper;

import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.model.CalendarEvent;
import com.OfferMaster.model.Quote;
import com.OfferMaster.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class CalendarEventMapperTest {

    private final CalendarEventMapper calendarEventMapper = CalendarEventMapper.INSTANCE;
    private CalendarEvent event;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");

        Quote quote = new Quote();
        quote.setId(500L);
        quote.setUser(user);

        event = new CalendarEvent();
        event.setId(10L);
        event.setTitle("Important Meeting");
        event.setEventDate(LocalDate.of(2023, 12, 25));
        event.setUser(user);
        event.setQuote(quote);
    }

    @Test
    void toDto_withCompleteEvent_shouldMapAllFields() {
        CalendarEventDto result = calendarEventMapper.toDto(event);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo("Important Meeting");
        assertThat(result.getDate()).isEqualTo(LocalDate.of(2023, 12, 25));
        assertThat(result.getQuoteId()).isEqualTo(500L);
    }

    @Test
    void toDto_withNullEvent_shouldReturnNull() {
        CalendarEventDto result = calendarEventMapper.toDto(null);

        assertThat(result).isNull();
    }

    @Test
    void toDto_withoutQuote_shouldMapWithNullQuoteId() {
        event.setQuote(null);

        CalendarEventDto result = calendarEventMapper.toDto(event);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(10L);
        assertThat(result.getTitle()).isEqualTo("Important Meeting");
        assertThat(result.getDate()).isEqualTo(LocalDate.of(2023, 12, 25));
        assertThat(result.getQuoteId()).isNull();
    }

    @Test
    void toDto_withMinimalEvent_shouldMapRequiredFields() {
        CalendarEvent minimalEvent = new CalendarEvent();
        minimalEvent.setId(20L);
        minimalEvent.setTitle("Simple Event");
        minimalEvent.setEventDate(LocalDate.of(2023, 6, 15));

        CalendarEventDto result = calendarEventMapper.toDto(minimalEvent);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(20L);
        assertThat(result.getTitle()).isEqualTo("Simple Event");
        assertThat(result.getDate()).isEqualTo(LocalDate.of(2023, 6, 15));
        assertThat(result.getQuoteId()).isNull();
    }

    @Test
    void toDto_withEmptyTitle_shouldMapCorrectly() {
        event.setTitle("");

        CalendarEventDto result = calendarEventMapper.toDto(event);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("");
        assertThat(result.getId()).isEqualTo(10L);
    }
}
