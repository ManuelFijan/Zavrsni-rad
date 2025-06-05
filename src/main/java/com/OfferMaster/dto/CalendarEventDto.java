package com.OfferMaster.dto;

import java.time.LocalDate;

public class CalendarEventDto {
    private Long id;
    private String title;
    private LocalDate date;
    private Long quoteId;

    public CalendarEventDto() {}

    public CalendarEventDto(Long id, String title, LocalDate date, Long quoteId) {
        this.id = id;
        this.title = title;
        this.date = date;
        this.quoteId = quoteId;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public LocalDate getDate() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public Long getQuoteId() {
        return quoteId;
    }

    public void setQuoteId(Long quoteId) {
        this.quoteId = quoteId;
    }
}