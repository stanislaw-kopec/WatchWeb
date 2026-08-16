package com.watchweb.app.domain.watch.event;

import java.util.UUID;

public record WatchSubmissionRejectedEvent(
        UUID submissionId,
        UUID submittedById,
        String brand,
        String model,
        String reason
) {
}
