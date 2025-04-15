package com.OfferMaster.service;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import org.springframework.data.domain.Page;

public interface ArticleService {
    Page<ArticleDto> getArticles(int page, int size);
    ArticleDto createArticle(ArticleRequestDto articleRequestDto);
}
