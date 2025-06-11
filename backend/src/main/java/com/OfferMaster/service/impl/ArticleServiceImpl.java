package com.OfferMaster.service.impl;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.mapper.ArticleMapper;
import com.OfferMaster.model.Article;
import com.OfferMaster.repository.ArticleRepository;
import com.OfferMaster.service.ArticleService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class ArticleServiceImpl implements ArticleService {

    private final ArticleRepository articleRepository;
    private final ArticleMapper articleMapper;

    public ArticleServiceImpl(ArticleRepository articleRepository, ArticleMapper articleMapper) {
        this.articleRepository = articleRepository;
        this.articleMapper = articleMapper;
    }

    @Override
    public Page<ArticleDto> getArticles(int page, int size, String name) {
        Pageable pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "articleId"));
        Page<Article> articlePage = (name != null && !name.isEmpty())
                ? articleRepository.findByNameContainingIgnoreCase(name, pageRequest)
                : articleRepository.findAll(pageRequest);

        return articlePage.map(articleMapper::toDto);
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

        return articleMapper.toDto(savedArticle);
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
        return articleMapper.toDto(updatedArticle);
    }
}