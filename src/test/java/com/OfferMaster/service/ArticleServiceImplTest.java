package com.OfferMaster.service;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.enums.ArticleCategory;
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
    @Mock ArticleRepository repo;

    @InjectMocks
    ArticleServiceImpl svc;

    Article a1;
    ArticleRequestDto req;

    @BeforeEach
    void setup() {
        a1 = new Article();
        a1.setArticleId(1L);
        a1.setName("X");
        a1.setCategory(ArticleCategory.USLUGA);
        a1.setPrice(5.0);
        a1.setDescription("D");
        req = new ArticleRequestDto("X",ArticleCategory.USLUGA,5.0,"D");
    }

    @Test
    void getArticles_noSearch_returnsAll() {
        Page<Article> page = new PageImpl<>(java.util.List.of(a1), PageRequest.of(0,1), 1);
        given(repo.findAll(any(Pageable.class))).willReturn(page);

        Page<ArticleDto> result = svc.getArticles(0,1,null);
        assertThat(result.getContent()).hasSize(1)
                .extracting(ArticleDto::getArticleId).containsExactly(1L);
    }

    @Test
    void getArticles_withSearch_usesFindByName() {
        Pageable pageable = PageRequest.of(0, 1);
        Page<Article> page = new PageImpl<>(List.of(a1), pageable, 1);
        given(repo.findByNameContainingIgnoreCase(anyString(), any(Pageable.class)))
                .willReturn(page);

        Page<ArticleDto> result = svc.getArticles(0, 1, "X");

        then(repo).should().findByNameContainingIgnoreCase(eq("X"), any(Pageable.class));
        assertThat(result.getContent().get(0).getName()).isEqualTo("X");
    }

    @Test
    void createArticle_savesAndReturnsDto() {
        given(repo.save(any())).willReturn(a1);
        ArticleDto dto = svc.createArticle(req);
        assertThat(dto.getArticleId()).isEqualTo(1L);
    }

    @Test
    void updateArticle_found_savesAndReturns() {
        given(repo.findById(1L)).willReturn(Optional.of(a1));
        given(repo.save(any())).willReturn(a1);

        ArticleDto dto = svc.updateArticle(1L, req);
        assertThat(dto.getArticleId()).isEqualTo(1L);
    }

    @Test
    void updateArticle_notFound_throws() {
        given(repo.findById(2L)).willReturn(Optional.empty());
        assertThatThrownBy(() -> svc.updateArticle(2L, req))
                .isInstanceOf(ResponseStatusException.class)
                .hasMessageContaining("not found");
    }
}
