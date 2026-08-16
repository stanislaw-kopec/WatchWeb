CREATE TABLE app_users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL,
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_app_users_username UNIQUE (username),
    CONSTRAINT uk_app_users_email UNIQUE (email),
    CONSTRAINT chk_app_users_role CHECK (role IN ('ROLE_USER', 'ROLE_JOURNALIST', 'ROLE_ADMIN'))
);
