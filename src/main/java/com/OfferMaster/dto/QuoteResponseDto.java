package com.OfferMaster.dto;

import java.time.Instant;
import java.util.List;

public class QuoteResponseDto {
    private Long id;
    private List<QuoteItemDto> items;
    private Instant createdAt;
    private String logoUrl;

    public QuoteResponseDto(Long id, List<QuoteItemDto> items, Instant createdAt, String logoUrl) {
        this.id = id;
        this.items = items;
        this.createdAt = createdAt;
        this.logoUrl = logoUrl;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public List<QuoteItemDto> getItems() {
        return items;
    }

    public void setItems(List<QuoteItemDto> items) {
        this.items = items;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public String getLogoUrl() {
        return logoUrl;
    }

    public void setLogoUrl(String logoUrl) {
        this.logoUrl = logoUrl;
    }
}
