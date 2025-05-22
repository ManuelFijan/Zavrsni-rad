package com.OfferMaster.dto;

import java.util.List;

public class QuoteCreateDto {
    private String logoBase64;
    private List<QuoteItemRequestDto> items;
    private Integer discount;

    public <T> QuoteCreateDto(Object o, List<T> ts) {
    }

    public QuoteCreateDto() {

    }

    public Integer getDiscount() {
        return discount;
    }

    public void setDiscount(Integer discount) {
        this.discount = discount;
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
