package com.watchweb.app.domain.comment.repository;

import com.watchweb.app.domain.comment.entity.WatchComment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WatchCommentRepository extends JpaRepository<WatchComment, UUID> {

    @EntityGraph(attributePaths = {"author", "parent"})
    List<WatchComment> findByWatchIdOrderByCreatedAtAsc(UUID watchId);

    @EntityGraph(attributePaths = {"author", "parent", "watch"})
    Optional<WatchComment> findByIdAndWatchId(UUID id, UUID watchId);
}
