package com.OfferMaster.mapper;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.enums.ArticleCategory;
import com.OfferMaster.enums.MeasureUnit;
import com.OfferMaster.model.Article;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ArticleMapperTest {

    private final ArticleMapper articleMapper = ArticleMapper.INSTANCE;
    private Article article;

    @BeforeEach
    void setUp() {
        article = new Article();
        article.setArticleId(50L);
        article.setName("Premium Cement");
        article.setDescription("High-quality Portland cement for construction");
        article.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        article.setPrice(45.99);
        article.setMeasureUnit(MeasureUnit.KOM);
    }

    @Test
    void toDto_withCompleteArticle_shouldMapAllFields() {
        ArticleDto result = articleMapper.toDto(article);

        assertThat(result).isNotNull();
        assertThat(result.getArticleId()).isEqualTo(50L);
        assertThat(result.getName()).isEqualTo("Premium Cement");
        assertThat(result.getDescription()).isEqualTo("High-quality Portland cement for construction");
        assertThat(result.getCategory()).isEqualTo(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        assertThat(result.getPrice()).isEqualTo(45.99);
        assertThat(result.getMeasureUnit()).isEqualTo(MeasureUnit.KOM);
    }

    @Test
    void toDto_withNullArticle_shouldReturnNull() {
        ArticleDto result = articleMapper.toDto(null);

        assertThat(result).isNull();
    }

    @Test
    void toDto_withMinimalArticle_shouldMapRequiredFields() {
        Article minimalArticle = new Article();
        minimalArticle.setArticleId(60L);
        minimalArticle.setName("Basic Service");
        minimalArticle.setCategory(ArticleCategory.USLUGA);
        minimalArticle.setPrice(100.0);
        minimalArticle.setMeasureUnit(MeasureUnit.KOM);

        ArticleDto result = articleMapper.toDto(minimalArticle);

        assertThat(result).isNotNull();
        assertThat(result.getArticleId()).isEqualTo(60L);
        assertThat(result.getName()).isEqualTo("Basic Service");
        assertThat(result.getCategory()).isEqualTo(ArticleCategory.USLUGA);
        assertThat(result.getPrice()).isEqualTo(100.0);
        assertThat(result.getMeasureUnit()).isEqualTo(MeasureUnit.KOM);
        assertThat(result.getDescription()).isNull();
    }

    @Test
    void toDto_withNullOptionalFields_shouldHandleGracefully() {
        article.setDescription(null);

        ArticleDto result = articleMapper.toDto(article);

        assertThat(result).isNotNull();
        assertThat(result.getArticleId()).isEqualTo(50L);
        assertThat(result.getName()).isEqualTo("Premium Cement");
        assertThat(result.getDescription()).isNull();
        assertThat(result.getCategory()).isEqualTo(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
    }

    @Test
    void toDto_withDifferentCategories_shouldMapCorrectly() {
        article.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        ArticleDto result1 = articleMapper.toDto(article);
        assertThat(result1.getCategory()).isEqualTo(ArticleCategory.GRAĐEVINSKI_MATERIJAL);

        article.setCategory(ArticleCategory.USLUGA);
        ArticleDto result2 = articleMapper.toDto(article);
        assertThat(result2.getCategory()).isEqualTo(ArticleCategory.USLUGA);
    }

    @Test
    void toDto_withDifferentMeasureUnits_shouldMapCorrectly() {
        article.setMeasureUnit(MeasureUnit.M2);
        ArticleDto result1 = articleMapper.toDto(article);
        assertThat(result1.getMeasureUnit()).isEqualTo(MeasureUnit.M2);

        article.setMeasureUnit(MeasureUnit.KOM);
        ArticleDto result2 = articleMapper.toDto(article);
        assertThat(result2.getMeasureUnit()).isEqualTo(MeasureUnit.KOM);
    }

    @Test
    void toDto_withZeroPrice_shouldMapCorrectly() {
        article.setPrice(0.0);

        ArticleDto result = articleMapper.toDto(article);

        assertThat(result).isNotNull();
        assertThat(result.getPrice()).isEqualTo(0.0);
    }
}
