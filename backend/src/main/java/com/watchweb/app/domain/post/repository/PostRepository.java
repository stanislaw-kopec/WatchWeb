package com.watchweb.app.domain.post.repository;

import com.watchweb.app.domain.post.entity.Post;
import com.watchweb.app.domain.post.entity.PostStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import java.util.UUID;

public interface PostRepository extends JpaRepository<Post, UUID> {

    @EntityGraph(attributePaths = "author")
    Page<Post> findByDeletedAtIsNull(Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Post> findByStatusAndDeletedAtIsNull(PostStatus status, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    @Query(
            value = """
                    select distinct p
                    from Post p
                    where p.status = :status
                      and p.deletedAt is null
                      and (lower(p.title) like concat('%', lower(:query), '%')
                           or lower(p.content) like concat('%', lower(:query), '%'))
                    """,
            countQuery = """
                    select count(distinct p)
                    from Post p
                    where p.status = :status
                      and p.deletedAt is null
                      and (lower(p.title) like concat('%', lower(:query), '%')
                           or lower(p.content) like concat('%', lower(:query), '%'))
                    """
    )
    Page<Post> searchApprovedByText(
            @Param("status") PostStatus status,
            @Param("query") String query,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "author")
    @Query(
            value = """
                    select distinct p
                    from Post p
                    join p.hashtags h
                    where p.status = :status
                      and p.deletedAt is null
                      and h.name = :hashtag
                    """,
            countQuery = """
                    select count(distinct p)
                    from Post p
                    join p.hashtags h
                    where p.status = :status
                      and p.deletedAt is null
                      and h.name = :hashtag
                    """
    )
    Page<Post> searchApprovedByHashtag(
            @Param("status") PostStatus status,
            @Param("hashtag") String hashtag,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "author")
    @Query(
            value = """
                    select distinct p
                    from Post p
                    join p.hashtags h
                    where p.status = :status
                      and p.deletedAt is null
                      and (lower(p.title) like concat('%', lower(:query), '%')
                           or lower(p.content) like concat('%', lower(:query), '%'))
                      and h.name = :hashtag
                    """,
            countQuery = """
                    select count(distinct p)
                    from Post p
                    join p.hashtags h
                    where p.status = :status
                      and p.deletedAt is null
                      and (lower(p.title) like concat('%', lower(:query), '%')
                           or lower(p.content) like concat('%', lower(:query), '%'))
                      and h.name = :hashtag
                    """
    )
    Page<Post> searchApprovedByTextAndHashtag(
            @Param("status") PostStatus status,
            @Param("query") String query,
            @Param("hashtag") String hashtag,
            Pageable pageable
    );

    @EntityGraph(attributePaths = "author")
    Page<Post> findByAuthorIdAndDeletedAtIsNull(UUID authorId, Pageable pageable);

    @EntityGraph(attributePaths = "author")
    Page<Post> findByAuthorIdAndStatusAndDeletedAtIsNull(UUID authorId, PostStatus status, Pageable pageable);

    @EntityGraph(attributePaths = {"author", "hashtags"})
    Optional<Post> findByIdAndDeletedAtIsNull(UUID id);

    @EntityGraph(attributePaths = {"author", "hashtags"})
    Optional<Post> findByIdAndStatusAndDeletedAtIsNull(UUID id, PostStatus status);
}
