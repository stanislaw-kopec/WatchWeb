package com.watchweb.app.domain.comment.repository;

import com.watchweb.app.domain.comment.entity.PostComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface PostCommentRepository extends JpaRepository<PostComment, UUID> {

    @EntityGraph(attributePaths = {"author", "parent"})
    List<PostComment> findByPostIdOrderByCreatedAtAsc(UUID postId);

    @EntityGraph(attributePaths = {"author", "parent", "post"})
    Optional<PostComment> findByIdAndPostId(UUID id, UUID postId);
}
