package com.OfferMaster.dto;

import com.OfferMaster.enums.ArticleCategory;

public class ArticleDto {
    private Long articleId;
    private String name;
    private ArticleCategory category;
    private Double price;
    private String description;

    public ArticleDto() {}

    public ArticleDto(Long articleId, String name, ArticleCategory category, Double price, String description) {
        this.articleId = articleId;
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
    }

    public Long getArticleId() {
        return articleId;
    }

    public void setArticleId(Long articleId) {
        this.articleId = articleId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public ArticleCategory getCategory() {
        return category;
    }

    public void setCategory(ArticleCategory category) {
        this.category = category;
    }

    public Double getPrice() {
        return price;
    }

    public void setPrice(Double price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
