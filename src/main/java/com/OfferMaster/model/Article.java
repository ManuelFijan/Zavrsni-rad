package com.OfferMaster.model;

import com.OfferMaster.enums.ArticleCategory;
import jakarta.persistence.*;

import java.util.Objects;

@Entity
@Table(name = "articles", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
public class Article {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id")
    private Long articleId;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ArticleCategory category;

    @Column(nullable = false)
    private Double price;

    @Column
    private String description;

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

    @Override
    public boolean equals(Object o) {
        if (o == null || getClass() != o.getClass()) return false;
        Article article = (Article) o;
        return Objects.equals(articleId, article.articleId) && Objects.equals(name, article.name) && category == article.category && Objects.equals(price, article.price) && Objects.equals(description, article.description);
    }

    @Override
    public int hashCode() {
        return Objects.hash(articleId, name, category, price, description);
    }
}
