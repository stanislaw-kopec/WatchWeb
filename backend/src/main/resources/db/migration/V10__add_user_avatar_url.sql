ALTER TABLE app_users
    ADD COLUMN avatar_url VARCHAR(500);

ALTER TABLE app_users
    DROP CONSTRAINT chk_app_users_role;

ALTER TABLE app_users
    ADD CONSTRAINT chk_app_users_role CHECK (role IN ('ROLE_USER', 'ROLE_MODERATOR', 'ROLE_JOURNALIST', 'ROLE_ADMIN'));
