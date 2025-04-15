package com.OfferMaster.service.impl;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.model.Article;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

@Service
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleServiceImpl(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Override
    public Page<ArticleDto> getArticles(int page, int size) {
        PageRequest pageRequest = PageRequest.of(page, size);
        Page<Article> articlePage = articleRepository.findAll(pageRequest);
        Page<ArticleDto> dtoPage = articlePage.map(this::convertToDto);
        return dtoPage;
    }

    @Override
    public ArticleDto createArticle(ArticleRequestDto articleRequestDto) {
        Article article = new Article();
        article.setName(articleRequestDto.getName());
        article.setDescription(articleRequestDto.getDescription());
        article.setPrice(articleRequestDto.getPrice());
        article.setCategory(articleRequestDto.getCategory());

        Article savedArticle = articleRepository.save(article);

        return convertToDto(savedArticle);
    }

    public ArticleDto convertToDto(Article article) {
        ArticleDto dto = new ArticleDto();
        dto.setArticleId(article.getArticleId());
        dto.setName(article.getName());
        dto.setDescription(article.getDescription());
        dto.setCategory(article.getCategory());
        dto.setPrice(article.getPrice());
        return dto;
    }
}
