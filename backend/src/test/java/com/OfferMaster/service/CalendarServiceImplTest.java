package com.OfferMaster.service;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.mapper.CalendarEventMapper;
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
    @Mock
    private CalendarEventMapper calendarEventMapper;

    @InjectMocks
    private CalendarServiceImpl calendarService;

    private User testUser;
    private CalendarEvent testEvent;
    private CalendarEventDto testEventDto;

    @BeforeEach
    void setUp() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        testUser = new User();
        testUser.setUserId(1L);
        testUser.setEmail("test@example.com");

        testEvent = new CalendarEvent();
        testEvent.setId(1L);
        testEvent.setTitle("Test Event");
        testEvent.setEventDate(LocalDate.now());
        testEvent.setUser(testUser);

        testEventDto = new CalendarEventDto();
        testEventDto.setId(1L);
        testEventDto.setTitle("Test Event");
        testEventDto.setDate(LocalDate.now());

        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getName()).thenReturn(testUser.getEmail());
        when(authentication.getPrincipal()).thenReturn("test@example.com");
        when(userRepository.findByEmail(testUser.getEmail())).thenReturn(Optional.of(testUser));
    }

    @Test
    void getCurrentUser_notAuthenticated_shouldThrow() {
        Authentication auth = mock(Authentication.class);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(context);

        assertThatThrownBy(() -> {
            CalendarEventCreateDto dto = new CalendarEventCreateDto();
            calendarService.createEvent(dto);
        }).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not authenticated");
    }

    @Test
    void getCurrentUser_anonymousUser_shouldThrow() {
        Authentication auth = mock(Authentication.class);
        SecurityContext context = mock(SecurityContext.class);
        when(context.getAuthentication()).thenReturn(auth);
        when(auth.isAuthenticated()).thenReturn(true);
        when(auth.getPrincipal()).thenReturn("anonymousUser");
        SecurityContextHolder.setContext(context);

        assertThatThrownBy(() -> {
            CalendarEventCreateDto dto = new CalendarEventCreateDto();
            calendarService.createEvent(dto);
        }).isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not authenticated");
    }

    @Test
    void createEvent_withNonExistentQuote_shouldThrow() {
        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Meeting");
        createDto.setDate(LocalDate.now());
        createDto.setQuoteId(999L);

        when(quoteRepository.findById(999L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calendarService.createEvent(createDto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("Quote not found");
    }

    @Test
    void deleteEvent_belongsToAnotherUser_shouldThrow() {
        User otherUser = new User();
        otherUser.setUserId(999L);

        CalendarEvent event = new CalendarEvent();
        event.setId(1L);
        event.setUser(otherUser);

        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(event));

        assertThatThrownBy(() -> calendarService.deleteEvent(1L))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("cannot delete this event");
    }

    @Test
    void mapToDto_eventWithQuote_shouldMapQuoteId() {
        Quote quote = new Quote();
        quote.setId(100L);

        CalendarEvent event = new CalendarEvent();
        event.setId(1L);
        event.setTitle("Test Event");
        event.setEventDate(LocalDate.now());
        event.setQuote(quote);

        CalendarEventDto expectedDto = new CalendarEventDto();
        expectedDto.setId(1L);
        expectedDto.setTitle("Test Event");
        expectedDto.setDate(LocalDate.now());
        expectedDto.setQuoteId(100L);

        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(event);
        when(calendarEventMapper.toDto(event)).thenReturn(expectedDto);

        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Test Event");
        createDto.setDate(LocalDate.now());

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getQuoteId()).isEqualTo(100L);
    }

    @Test
    void mapToDto_eventWithoutQuote_shouldHaveNullQuoteId() {
        CalendarEvent event = new CalendarEvent();
        event.setId(1L);
        event.setTitle("Test Event");
        event.setEventDate(LocalDate.now());
        event.setQuote(null);

        CalendarEventDto expectedDto = new CalendarEventDto();
        expectedDto.setId(1L);
        expectedDto.setTitle("Test Event");
        expectedDto.setDate(LocalDate.now());
        expectedDto.setQuoteId(null);

        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(event);
        when(calendarEventMapper.toDto(event)).thenReturn(expectedDto);

        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Test Event");
        createDto.setDate(LocalDate.now());

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getQuoteId()).isNull();
    }

    @Test
    void createEvent_shouldSaveAndReturnDto() {
        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Sastanak");
        createDto.setDate(LocalDate.now());

        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);
        when(calendarEventMapper.toDto(testEvent)).thenReturn(testEventDto);

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(calendarEventRepository).save(any(CalendarEvent.class));
        verify(calendarEventMapper).toDto(testEvent);
    }

    @Test
    void createEvent_withValidQuoteId_shouldLinkQuote() {
        Quote quote = new Quote();
        quote.setId(100L);
        quote.setUser(testUser);

        CalendarEventCreateDto createDto = new CalendarEventCreateDto();
        createDto.setTitle("Quote Meeting");
        createDto.setDate(LocalDate.now());
        createDto.setQuoteId(100L);

        CalendarEventDto expectedDto = new CalendarEventDto();
        expectedDto.setId(1L);
        expectedDto.setQuoteId(100L);

        when(quoteRepository.findById(100L)).thenReturn(Optional.of(quote));
        when(calendarEventRepository.save(any(CalendarEvent.class))).thenReturn(testEvent);
        when(calendarEventMapper.toDto(any(CalendarEvent.class))).thenReturn(expectedDto);

        CalendarEventDto result = calendarService.createEvent(createDto);

        assertThat(result.getQuoteId()).isEqualTo(100L);
        verify(calendarEventMapper).toDto(any(CalendarEvent.class));
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
        when(calendarEventRepository.findByUserOrderByEventDateAsc(testUser)).thenReturn(List.of(testEvent));
        when(calendarEventMapper.toDto(testEvent)).thenReturn(testEventDto);

        List<CalendarEventDto> results = calendarService.getUserEvents();

        assertThat(results).isNotNull().hasSize(1);
        assertThat(results.get(0).getId()).isEqualTo(1L);
        verify(calendarEventMapper).toDto(testEvent);
    }

    @Test
    void deleteEvent_whenBelongsToUser_shouldDelete() {
        when(calendarEventRepository.findById(1L)).thenReturn(Optional.of(testEvent));
        doNothing().when(calendarEventRepository).delete(testEvent);

        calendarService.deleteEvent(1L);

        verify(calendarEventRepository).delete(testEvent);
    }

    @Test
    void deleteEvent_whenNotFound_shouldThrowNotFound() {
        when(calendarEventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> calendarService.deleteEvent(99L))
                .isInstanceOf(ResponseStatusException.class)
                .hasFieldOrPropertyWithValue("statusCode", HttpStatus.NOT_FOUND);
    }
}