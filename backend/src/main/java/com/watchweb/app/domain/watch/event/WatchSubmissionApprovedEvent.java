package com.watchweb.app.domain.watch.event;

import java.util.UUID;

public record WatchSubmissionApprovedEvent(
        UUID submissionId,
        UUID submittedById,
        UUID watchId,
        String brand,
        String model
) {
}
