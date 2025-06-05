package com.OfferMaster.service.impl;

import com.OfferMaster.dto.CalendarEventCreateDto;
import com.OfferMaster.dto.CalendarEventDto;
import com.OfferMaster.model.CalendarEvent;
import com.OfferMaster.model.Quote;
import com.OfferMaster.model.User;
import com.OfferMaster.repository.CalendarEventRepository;
import com.OfferMaster.repository.QuoteRepository;
import com.OfferMaster.repository.UserRepository;
import com.OfferMaster.service.CalendarService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CalendarServiceImpl implements CalendarService {

    private final CalendarEventRepository calendarEventRepository;
    private final UserRepository userRepository;
    private final QuoteRepository quoteRepository;

    @Autowired
    public CalendarServiceImpl(CalendarEventRepository calendarEventRepository,
                               UserRepository userRepository,
                               QuoteRepository quoteRepository) {
        this.calendarEventRepository = calendarEventRepository;
        this.userRepository = userRepository;
        this.quoteRepository = quoteRepository;
    }

    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not authenticated");
        }
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found for email: " + email));
    }

    @Override
    @Transactional
    public CalendarEventDto createEvent(CalendarEventCreateDto createDto) {
        User currentUser = getCurrentUser();
        CalendarEvent event = new CalendarEvent();
        event.setTitle(createDto.getTitle());
        event.setEventDate(createDto.getDate());
        event.setUser(currentUser);

        if (createDto.getQuoteId() != null) {
            Quote quote = quoteRepository.findById(createDto.getQuoteId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Quote not found with ID: " + createDto.getQuoteId()));
            if (!quote.getUser().getUserId().equals(currentUser.getUserId())) {
                throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User does not have access to this quote");
            }
            event.setQuote(quote);
        }

        CalendarEvent savedEvent = calendarEventRepository.save(event);
        return mapToDto(savedEvent);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalendarEventDto> getUserEvents() {
        User currentUser = getCurrentUser();
        return calendarEventRepository.findByUserOrderByEventDateAsc(currentUser).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void deleteEvent(Long eventId) {
        User currentUser = getCurrentUser();
        CalendarEvent event = calendarEventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found with ID: " + eventId));

        if (!event.getUser().getUserId().equals(currentUser.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "User cannot delete this event");
        }
        calendarEventRepository.delete(event);
    }

    private CalendarEventDto mapToDto(CalendarEvent event) {
        CalendarEventDto dto = new CalendarEventDto();
        dto.setId(event.getId());
        dto.setTitle(event.getTitle());
        dto.setDate(event.getEventDate());
        if (event.getQuote() != null) {
            dto.setQuoteId(event.getQuote().getId());
        }
        return dto;
    }
}