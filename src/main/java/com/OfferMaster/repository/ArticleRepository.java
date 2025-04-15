package com.OfferMaster.repository;

import com.OfferMaster.model.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface ArticleRepository extends JpaRepository<Article, Long> {
    Optional<Article> findByName(String name);
    Page<Article> findByNameStartingWith(String name, Pageable pageable);
}