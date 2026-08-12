CREATE TABLE notifications (
    id UUID PRIMARY KEY,
    recipient_id UUID NOT NULL REFERENCES app_users(id),
    type VARCHAR(50) NOT NULL,
    message VARCHAR(500) NOT NULL,
    target_id UUID,
    read_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL
);

CREATE INDEX idx_notifications_recipient_created_at
    ON notifications(recipient_id, created_at DESC);

CREATE INDEX idx_notifications_recipient_read_at
    ON notifications(recipient_id, read_at);
