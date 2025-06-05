package com.OfferMaster.service;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.model.CalendarEvent;
import com.OfferMaster.model.Quote;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.CalendarEventRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.impl.CalendarServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class CalendarServiceImplTest {

    @Mock
    private CalendarEventRepository calendarEventRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private QuoteRepository quoteRepository;

    @InjectMocks
    private CalendarServiceImpl calendarService;

    private User testUser;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(testUser.getEmail());

        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
    }

    @Test
    void createEvent_shouldSaveAndReturnDto() {
        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Sastanak");
        createDto.setDate(LocalDate.now());

        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(inv -> {
            CalendarEvent event = inv.getArgument(0);
            event.setId(1L);
            return event;
        });

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getTitle()).isEqualTo("Sastanak");
        assertThat(result.getId()).isEqualTo(1L);
        verify(calendarEventRepository, times(1)).save(any(CalendarEvent.class));
    }

    @Test
    void createEvent_withValidQuoteId_shouldLinkQuote() {
        Quote quote = new Quote();
        quote.setId(100L);
        quote.setUser(testUser);

        when(quoteRepository.findById(100L)).thenReturn(Optional.of(quote));

        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Provjera ponude");
        createDto.setDate(LocalDate.now());
        createDto.setQuoteId(100L);

        when(calendarEventRepository.save(any(CalendarEvent.class))).thenAnswer(inv -> inv.getArgument(0));

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result.getQuoteId()).isEqualTo(100L);
    }

    @Test
    void createEvent_withQuoteFromAnotherUser_shouldThrowForbidden() {
        User otherUser = new User();
        otherUser.setUserId(99L);

        Quote quote = new Quote();
        quote.setId(100L);
        quote.setUser(otherUser);

        when(quoteRepository.findById(100L)).thenReturn(Optional.of(quote));

        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Pokušaj pristupa");
        createDto.setDate(LocalDate.now());
        createDto.setQuoteId(100L);

        assertThatThrownBy(() -> calendarService.createEvent(createDto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("User does not have access to this quote");
    }

    @Test
    void getUserEvents_shouldReturnEventsForCurrentUser() {
        CalendarEvent event = new CalendarEvent();
        event.setId(1L);
        event.setUser(testUser);
        event.setEventDate(LocalDate.now());

        when(calendarEventRepository.findByUserOrderByEventDateAsc(testUser)).thenReturn(List.of(event));

        List<CalendarEventDto> results = calendarService.getUserEvents();

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
    }

    @Test
    void deleteEvent_whenBelongsToUser_shouldDelete() {
        CalendarEvent event = new CalendarEvent();
        event.setId(1L);
        event.setUser(testUser);

        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(event));
        doNothing().when(calendarEventRepository).delete(event);

        calendarService.deleteEvent(1L);

        verify(calendarEventRepository, times(1)).delete(event);
    }

    @Test
    void deleteEvent_whenNotFound_shouldThrowNotFound() {
        when(calendarEventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calendarService.deleteEvent(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("statusCode", HttpStatus.NOT_FOUND);
    }
}