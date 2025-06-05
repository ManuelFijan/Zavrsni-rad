package com.OfferMaster.dto;

import java.time.Instant;
import java.util.List;

public class QuoteResponseDto {
    private Long id;
    private List<QuoteItemDto> items;
    private Instant createdAt;
    private String logoUrl;
    private Integer discount;
    private Long projectId;
    private String projectName;

    public QuoteResponseDto(Long id, List<QuoteItemDto> items, Instant createdAt, String logoUrl, Integer discount, Long projectId, String projectName) {
        this.id = id;
        this.items = items;
        this.createdAt = createdAt;
        this.logoUrl = logoUrl;
        this.discount = discount;
        this.projectId = projectId;
        this.projectName = projectName;
    }

    public QuoteResponseDto(Long id, List<QuoteItemDto> items, Instant createdAt, String logoUrl, Integer discount) {
        this.id = id;
        this.items = items;
        this.createdAt = createdAt;
        this.logoUrl = logoUrl;
        this.discount = discount;
    }

    public Long getProjectId() {
        return projectId;
    }

    public void setProjectId(Long projectId) {
        this.projectId = projectId;
    }

    public String getProjectName() {
        return projectName;
    }

    public void setProjectName(String projectName) {
        this.projectName = projectName;
    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
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
