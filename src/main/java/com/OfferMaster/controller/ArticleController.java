package com.OfferMaster.controller;

import com.OfferMaster.dto.ArticleDto;
import com.OfferMaster.dto.ArticleRequestDto;
import com.OfferMaster.service.ArticleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/articles")
public class ArticleController {

    private final ArticleService articleService;

    @Autowired
    public ArticleController(ArticleService articleService) {
        this.articleService = articleService;
    }

    @GetMapping()
    public ResponseEntity<Page<ArticleDto>> getArticles(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "20") int size, @RequestParam(required = false) String search) {
        Page<ArticleDto> articlesPage = articleService.getArticles(page, size, search);
        return ResponseEntity.ok(articlesPage);
    }

    @PostMapping
    public ResponseEntity<ArticleDto> createArticle(@RequestBody ArticleRequestDto articleRequestDto) {
        ArticleDto createdArticle = articleService.createArticle(articleRequestDto);
        return ResponseEntity.ok(createdArticle);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ArticleDto> updateArticle(@PathVariable("id") Long articleId, @RequestBody ArticleRequestDto articleRequestDto) {
        ArticleDto updatedArticle = articleService.updateArticle(articleId, articleRequestDto);
        return ResponseEntity.ok(updatedArticle);
    }
}
