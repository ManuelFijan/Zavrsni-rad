package com.OfferMaster.dto;

import com.OfferMaster.enums.ArticleCategory;
import com.OfferMaster.enums.MeasureUnit;

public class ArticleRequestDto {
    private String name;
    private ArticleCategory category;
    private Double price;
    private String description;
    private MeasureUnit measureUnit;

    public ArticleRequestDto() {}

    public ArticleRequestDto(String name, ArticleCategory category, Double price, String description) {
        this.name = name;
        this.category = category;
        this.price = price;
        this.description = description;
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

    public MeasureUnit getMeasureUnit() {
        return measureUnit;
    }

    public void setMeasureUnit(MeasureUnit measureUnit) {
        this.measureUnit = measureUnit;
    }
}
