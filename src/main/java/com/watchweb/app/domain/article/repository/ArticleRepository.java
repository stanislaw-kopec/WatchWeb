package com.watchweb.app.domain.article.repository;

import com.watchweb.app.domain.article.entity.Article;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {

    @EntityGraph(attributePaths = "author")
    Page<Article> findByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Optional<Article> findByIdAndDeletedAtIsNull(UUID id);
}
