package com.OfferMaster.dto;

public class QuoteItemDto {
    private Long productId;
    private Integer quantity;

    public QuoteItemDto(Long productId, Integer quantity) {
        this.productId = productId;
        this.quantity = quantity;
    }

    public QuoteItemDto() {

    }

    public Long getProductId() {
        return productId;
    }

    public void setProductId(Long productId) {
        this.productId = productId;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }
}
