package com.watchweb.app.domain.post.event;

import java.util.UUID;

public record PostRejectedEvent(
        UUID postId,
        UUID authorId,
        String title,
        String reason
) {
}
