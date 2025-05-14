package com.OfferMaster.dto;

import java.util.List;

public class QuoteCreateDto {
    private String logoBase64;
    private List<QuoteItemRequestDto> items;

    public <T> QuoteCreateDto(Object o, List<T> ts) {
    }

    public QuoteCreateDto() {

    }

    public String getLogoBase64() {
        return logoBase64;
    }

    public void setLogoBase64(String logoBase64) {
        this.logoBase64 = logoBase64;
    }

    public List<QuoteItemRequestDto> getItems() {
        return items;
    }

    public void setItems(List<QuoteItemRequestDto> items) {
        this.items = items;
    }
}
