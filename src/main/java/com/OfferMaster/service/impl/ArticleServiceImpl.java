package com.OfferMaster.service.impl;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.model.Article;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;

    public ArticleServiceImpl(ArticleRepository articleRepository) {
        this.articleRepository = articleRepository;
    }

    @Override
    public Page<ArticleDto> getArticles(int page, int size, String name) {
        Pageable pageRequest = PageRequest.of(page, size);
        Page<Article> articlePage;

        if (name != null && !name.isEmpty()) {
            articlePage = articleRepository.findByNameContainingIgnoreCase(name, pageRequest);
        } else {
            articlePage = articleRepository.findAll(pageRequest);
        }

        return articlePage.map(this::convertToDto);
    }

    @Override
    public ArticleDto createArticle(ArticleRequestDto articleRequestDto) {
        List<Article> matches = articleRepository.findByNameIgnoreCase(articleRequestDto.getName());
        if (!matches.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This item already exists. Please choose a different name."
            );
        }
        Article article = new Article();
        article.setName(articleRequestDto.getName());
        article.setDescription(articleRequestDto.getDescription());
        article.setPrice(articleRequestDto.getPrice());
        article.setCategory(articleRequestDto.getCategory());
        article.setMeasureUnit(articleRequestDto.getMeasureUnit());

        Article savedArticle = articleRepository.save(article);

        return convertToDto(savedArticle);
    }

    @Override
    public ArticleDto updateArticle(Long articleId, ArticleRequestDto articleRequestDto) {
        Article article = articleRepository.findById(articleId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Article not found with id " + articleId));

        List<Article> matches = articleRepository.findByNameIgnoreCase(articleRequestDto.getName());
        boolean nameTakenByOther = matches.stream()
                .anyMatch(a -> !a.getArticleId().equals(articleId));
        if (nameTakenByOther) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "This item already exists. Please choose a different name."
            );
        }

        article.setName(articleRequestDto.getName());
        article.setCategory(articleRequestDto.getCategory());
        article.setPrice(articleRequestDto.getPrice());
        article.setDescription(articleRequestDto.getDescription());
        article.setMeasureUnit(articleRequestDto.getMeasureUnit());

        Article updatedArticle = articleRepository.save(article);
        return convertToDto(updatedArticle);
    }

    public ArticleDto convertToDto(Article article) {
        ArticleDto dto = new ArticleDto();
        dto.setArticleId(article.getArticleId());
        dto.setName(article.getName());
        dto.setDescription(article.getDescription());
        dto.setCategory(article.getCategory());
        dto.setPrice(article.getPrice());
        dto.setMeasureUnit(article.getMeasureUnit());
        return dto;
    }
}
