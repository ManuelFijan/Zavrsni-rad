package com.OfferMaster.service;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.enums.ArticleCategory;
import com.OfferMaster.enums.MeasureUnit;
import com.OfferMaster.mapper.ArticleMapper;
import com.OfferMaster.model.Article;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.service.impl.ArticleServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
class ArticleServiceImplTest {
    @Mock
    ArticleRepository repo;
    @Mock
    ArticleMapper mapper;
    @InjectMocks
    ArticleServiceImpl svc;

    Article article1, article2;
    ArticleRequestDto requestDto;
    ArticleDto articleDto1, articleDto2;

    @BeforeEach
    void setup() {
        article1 = new Article();
        article1.setArticleId(1L);
        article1.setName("Cement");
        article1.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        article1.setPrice(25.50);
        article1.setDescription("Portland cement");
        article1.setMeasureUnit(MeasureUnit.KOM);

        article2 = new Article();
        article2.setArticleId(2L);
        article2.setName("Plitka");
        article2.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        article2.setPrice(45.00);

        articleDto1 = new ArticleDto();
        articleDto1.setArticleId(1L);
        articleDto1.setName("Cement");
        articleDto1.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        articleDto1.setPrice(25.50);

        articleDto2 = new ArticleDto();
        articleDto2.setArticleId(2L);
        articleDto2.setName("Plitka");
        articleDto2.setCategory(ArticleCategory.GRAĐEVINSKI_MATERIJAL);
        articleDto2.setPrice(45.00);

        requestDto = new ArticleRequestDto();
        requestDto.setName("Test Article");
        requestDto.setCategory(ArticleCategory.USLUGA);
        requestDto.setPrice(100.0);
        requestDto.setDescription("Test Description");
        requestDto.setMeasureUnit(MeasureUnit.KOM);
    }

    @Test
    void getArticles_noSearch_returnsAll() {
        Page<Article> page = new PageImpl<>(List.of(article1), PageRequest.of(0, 1), 1);
        given(repo.findAll(any(Pageable.class))).willReturn(page);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        Page<ArticleDto> result = svc.getArticles(0, 1, null);

        assertThat(result.getContent()).hasSize(1)
                .extracting(ArticleDto::getArticleId).containsExactly(1L);
        verify(mapper).toDto(article1);
    }

    @Test
    void getArticles_withSearch_usesFindByName() {
        Pageable pageable = PageRequest.of(0, 1);
        Page<Article> page = new PageImpl<>(List.of(article1), pageable, 1);
        given(repo.findByNameContainingIgnoreCase(anyString(), any(Pageable.class)))
                .willReturn(page);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        Page<ArticleDto> result = svc.getArticles(0, 1, "Cement");

        then(repo).should().findByNameContainingIgnoreCase(eq("Cement"), any(Pageable.class));
        assertThat(result.getContent().get(0).getName()).isEqualTo("Cement");
        verify(mapper).toDto(article1);
    }

    @Test
    void createArticle_savesAndReturnsDto() {
        given(repo.findByNameIgnoreCase(anyString())).willReturn(List.of());
        given(repo.save(any(Article.class))).willReturn(article1);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        ArticleDto result = svc.createArticle(requestDto);

        assertThat(result.getArticleId()).isEqualTo(1L);
        verify(mapper).toDto(article1);
    }

    @Test
    void updateArticle_found_savesAndReturns() {
        given(repo.findById(1L)).willReturn(Optional.of(article1));
        given(repo.findByNameIgnoreCase(anyString())).willReturn(List.of());
        given(repo.save(any(Article.class))).willReturn(article1);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        ArticleDto result = svc.updateArticle(1L, requestDto);

        assertThat(result.getArticleId()).isEqualTo(1L);
        verify(mapper).toDto(article1);
    }

    @Test
    void updateArticle_notFound_throws() {
        given(repo.findById(2L)).willReturn(Optional.empty());

        assertThatThrownBy(() -> svc.updateArticle(2L, requestDto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }

    @Test
    void getArticles_emptySearch_returnsAllSorted() {
        Page<Article> page = new PageImpl<>(List.of(article2, article1), PageRequest.of(0, 10), 2);
        given(repo.findAll(any(Pageable.class))).willReturn(page);
        given(mapper.toDto(article2)).willReturn(articleDto2);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        Page<ArticleDto> result = svc.getArticles(0, 10, "");

        assertThat(result.getContent()).hasSize(2);
        assertThat(result.getContent().get(0).getArticleId()).isEqualTo(2L);
        verify(mapper).toDto(article2);
        verify(mapper).toDto(article1);
    }

    @Test
    void createArticle_duplicateName_shouldThrow() {
        given(repo.findByNameIgnoreCase("Test Article")).willReturn(List.of(article1));

        assertThatThrownBy(() -> svc.createArticle(requestDto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void createArticle_uniqueName_shouldSaveAndReturn() {
        ArticleDto createdDto = new ArticleDto();
        createdDto.setArticleId(10L);
        createdDto.setName("Test Article");
        createdDto.setCategory(ArticleCategory.USLUGA);

        given(repo.findByNameIgnoreCase("Test Article")).willReturn(List.of());
        given(repo.save(any(Article.class))).willAnswer(inv -> {
            Article a = inv.getArgument(0);
            a.setArticleId(10L);
            return a;
        });
        given(mapper.toDto(any(Article.class))).willReturn(createdDto);

        ArticleDto result = svc.createArticle(requestDto);

        assertThat(result.getArticleId()).isEqualTo(10L);
        assertThat(result.getName()).isEqualTo("Test Article");
        assertThat(result.getCategory()).isEqualTo(ArticleCategory.USLUGA);
        verify(mapper).toDto(any(Article.class));
    }

    @Test
    void updateArticle_nameConflictWithOtherArticle_shouldThrow() {
        Article conflictArticle = new Article();
        conflictArticle.setArticleId(999L);
        conflictArticle.setName("Test Article");

        given(repo.findById(1L)).willReturn(Optional.of(article1));
        given(repo.findByNameIgnoreCase("Test Article")).willReturn(List.of(conflictArticle));

        assertThatThrownBy(() -> svc.updateArticle(1L, requestDto))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("already exists");
    }

    @Test
    void updateArticle_sameNameSameArticle_shouldUpdate() {
        requestDto.setName("Cement");

        given(repo.findById(1L)).willReturn(Optional.of(article1));
        given(repo.findByNameIgnoreCase("Cement")).willReturn(List.of(article1));
        given(repo.save(article1)).willReturn(article1);
        given(mapper.toDto(article1)).willReturn(articleDto1);

        ArticleDto result = svc.updateArticle(1L, requestDto);

        assertThat(result.getName()).isEqualTo("Cement");
        verify(repo).save(article1);
        verify(mapper).toDto(article1);
    }
}