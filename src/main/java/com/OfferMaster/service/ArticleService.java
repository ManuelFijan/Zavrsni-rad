package com.OfferMaster.service;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ArticleService {
    Page<ArticleDto> getArticles(int page, int size, String name);
    ArticleDto createArticle(ArticleRequestDto articleRequestDto);
    ArticleDto updateArticle(Long articleId, ArticleRequestDto articleRequestDto);
}
