package com.OfferMaster.mapper;

import com.OfferMaster.dto.QuoteItemDto;
import com.OfferMaster.dto.QuoteResponseDto;
import com.OfferMaster.enums.ArticleCategory;
import com.OfferMaster.enums.MeasureUnit;
import com.OfferMaster.model.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.Instant;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class QuoteMapperTest {

    private final QuoteMapper quoteMapper = QuoteMapper.INSTANCE;
    private Quote quote;
    private QuoteItem item1, item2;

    @BeforeEach
    void setUp() {
        User user = new User();
        user.setUserId(1L);
        user.setEmail("test@example.com");

        Project project = new Project();
        project.setId(100L);
        project.setName("Test Project");

        Article article1 = new Article();
        article1.setArticleId(10L);
        article1.setName("Cement");
        article1.setPrice(25.0);
        article1.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        article1.setMeasureUnit(MeasureUnit.KOM);

        Article article2 = new Article();
        article2.setArticleId(20L);
        article2.setName("Labour");
        article2.setPrice(50.0);
        article2.setCategory(ArticleCategory.USLUGA);
        article2.setMeasureUnit(MeasureUnit.KOM);

        item1 = new QuoteItem();
        item1.setArticle(article1);
        item1.setQuantity(100);

        item2 = new QuoteItem();
        item2.setArticle(article2);
        item2.setQuantity(8);

        quote = new Quote();
        quote.setId(500L);
        quote.setUser(user);
        quote.setProject(project);
        quote.setItems(Arrays.asList(item1, item2));
        quote.setCreatedAt(Instant.parse("2023-01-01T10:00:00Z"));
        quote.setLogoUrl("https://example.com/logo.png");
        quote.setDiscount(10);
        quote.setDescription("Test quote description");
    }

    @Test
    void toDto_withCompleteQuote_shouldMapAllFields() {
        QuoteResponseDto result = quoteMapper.toDto(quote);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(500L);
        assertThat(result.getProjectId()).isEqualTo(100L);
        assertThat(result.getProjectName()).isEqualTo("Test Project");
        assertThat(result.getCreatedAt()).isEqualTo(Instant.parse("2023-01-01T10:00:00Z"));
        assertThat(result.getLogoUrl()).isEqualTo("https://example.com/logo.png");
        assertThat(result.getDiscount()).isEqualTo(10);
        assertThat(result.getDescription()).isEqualTo("Test quote description");

        assertThat(result.getItems()).hasSize(2);
        assertThat(result.getItems().get(0).getProductId()).isEqualTo(10L);
        assertThat(result.getItems().get(0).getQuantity()).isEqualTo(100);
        assertThat(result.getItems().get(1).getProductId()).isEqualTo(20L);
        assertThat(result.getItems().get(1).getQuantity()).isEqualTo(8);
    }

    @Test
    void toDto_withNullQuote_shouldReturnNull() {
        QuoteResponseDto result = quoteMapper.toDto(null);

        assertThat(result).isNull();
    }

    @Test
    void toDto_withoutProject_shouldMapWithNullProjectFields() {
        quote.setProject(null);

        QuoteResponseDto result = quoteMapper.toDto(quote);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(500L);
        assertThat(result.getProjectId()).isNull();
        assertThat(result.getProjectName()).isNull();
        assertThat(result.getItems()).hasSize(2);
    }

    @Test
    void toDto_withEmptyItems_shouldMapWithEmptyItemsList() {
        quote.setItems(new ArrayList<>());

        QuoteResponseDto result = quoteMapper.toDto(quote);

        assertThat(result).isNotNull();
        assertThat(result.getItems()).isEmpty();
    }

    @Test
    void quoteItemToDto_shouldMapCorrectly() {
        QuoteItemDto result = quoteMapper.quoteItemToDto(item1);

        assertThat(result).isNotNull();
        assertThat(result.getProductId()).isEqualTo(10L);
        assertThat(result.getQuantity()).isEqualTo(100);
    }

    @Test
    void quoteItemsToDto_shouldMapList() {
        List<QuoteItemDto> result = quoteMapper.quoteItemsToDto(Arrays.asList(item1, item2));

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getProductId()).isEqualTo(10L);
        assertThat(result.get(0).getQuantity()).isEqualTo(100);
        assertThat(result.get(1).getProductId()).isEqualTo(20L);
        assertThat(result.get(1).getQuantity()).isEqualTo(8);
    }

    @Test
    void toDto_withNullOptionalFields_shouldHandleGracefully() {
        quote.setLogoUrl(null);
        quote.setDescription(null);
        quote.setDiscount(null);

        QuoteResponseDto result = quoteMapper.toDto(quote);

        assertThat(result).isNotNull();
        assertThat(result.getLogoUrl()).isNull();
        assertThat(result.getDescription()).isNull();
        assertThat(result.getDiscount()).isNull();
        assertThat(result.getId()).isEqualTo(500L);
    }

    @Test
    void toDto_withDefaultConstructor_shouldWork() {
        QuoteResponseDto dto = new QuoteResponseDto();
        dto.setId(123L);
        dto.setDescription("Test");

        assertThat(dto.getId()).isEqualTo(123L);
        assertThat(dto.getDescription()).isEqualTo("Test");
    }
}