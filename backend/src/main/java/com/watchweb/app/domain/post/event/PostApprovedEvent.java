package com.watchweb.app.domain.post.event;

import java.util.UUID;

public record PostApprovedEvent(
        UUID postId,
        UUID authorId,
        String title
) {
}
