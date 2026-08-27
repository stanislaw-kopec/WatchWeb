package com.watchweb.app.domain.article.repository;

import com.watchweb.app.domain.article.entity.Article;
import com.watchweb.app.domain.article.entity.ArticleStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface ArticleRepository extends JpaRepository<Article, UUID> {

    @EntityGraph(attributePaths = "author")
    Page<Article> findByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Article> findByStatusAndDeletedAtIsNull(ArticleStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    @Query(
            """
            select a
            from Article a
            where a.status = :status
              and a.deletedAt is null
              and (lower(a.title) like concat('%', lower(:query), '%')
                   or lower(a.content) like concat('%', lower(:query), '%'))
            """
    )
    Page<Article> searchByText(
            @Param("status") ArticleStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "author")
    Page<Article> findByAuthorIdAndDeletedAtIsNull(UUID authorId, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Article> findByAuthorIdAndStatusAndDeletedAtIsNull(
            UUID authorId,
            ArticleStatus status,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "author")
    Optional<Article> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = "author")
    Optional<Article> findByIdAndStatusAndDeletedAtIsNull(UUID id, ArticleStatus status);
}
