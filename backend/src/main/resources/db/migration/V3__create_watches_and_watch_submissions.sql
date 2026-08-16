ALTER TABLE app_users DROP CONSTRAINT chk_app_users_role;

ALTER TABLE app_users
    ADD CONSTRAINT chk_app_users_role
    CHECK (role IN ('ROLE_USER', 'ROLE_MODERATOR', 'ROLE_JOURNALIST', 'ROLE_ADMIN'));

CREATE TABLE watches (
    id UUID PRIMARY KEY,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    reference_code VARCHAR(100),
    brand_normalized VARCHAR(100) NOT NULL,
    model_normalized VARCHAR(150) NOT NULL,
    movement_type VARCHAR(30),
    caliber VARCHAR(100),
    case_diameter_mm NUMERIC(5, 2),
    case_thickness_mm NUMERIC(5, 2),
    lug_to_lug_mm NUMERIC(5, 2),
    strap_width_mm NUMERIC(5, 2),
    water_resistance_m INTEGER,
    crystal_type VARCHAR(100),
    case_material VARCHAR(100),
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT uk_watches_brand_model_normalized UNIQUE (brand_normalized, model_normalized)
);

CREATE TABLE watch_submissions (
    id UUID PRIMARY KEY,
    submitted_by_id UUID NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(150) NOT NULL,
    reference_code VARCHAR(100),
    brand_normalized VARCHAR(100) NOT NULL,
    model_normalized VARCHAR(150) NOT NULL,
    movement_type VARCHAR(30),
    caliber VARCHAR(100),
    case_diameter_mm NUMERIC(5, 2),
    case_thickness_mm NUMERIC(5, 2),
    lug_to_lug_mm NUMERIC(5, 2),
    strap_width_mm NUMERIC(5, 2),
    water_resistance_m INTEGER,
    crystal_type VARCHAR(100),
    case_material VARCHAR(100),
    status VARCHAR(30) NOT NULL,
    rejection_reason VARCHAR(500),
    created_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    updated_at TIMESTAMP(6) WITH TIME ZONE NOT NULL,
    CONSTRAINT fk_watch_submissions_submitted_by FOREIGN KEY (submitted_by_id) REFERENCES app_users (id),
    CONSTRAINT chk_watch_submissions_status CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED'))
);

CREATE INDEX idx_watch_submissions_submitted_by_id ON watch_submissions (submitted_by_id);
CREATE INDEX idx_watch_submissions_status ON watch_submissions (status);

CREATE UNIQUE INDEX uk_watch_submissions_pending_brand_model_normalized
    ON watch_submissions (brand_normalized, model_normalized)
    WHERE status = 'PENDING';
