# AGENTS.md

## Project

WatchWeb Backend - backend aplikacji dla pasjonatow zegarkow.

Aplikacja laczy:

* portal spolecznosciowy,
* blog branzowy,
* katalog zegarkow,
* system recenzji i ocen.

## Tech Stack

* Java 25 as the target language and runtime
* Spring Boot 4.1.x
* Spring Security
* JWT + Refresh Tokens
* Spring Data JPA
* PostgreSQL
* Flyway
* OpenAPI 3 / Swagger UI with springdoc-openapi
* JUnit 5
* Testcontainers
* Local file storage in development
* MinIO/S3 in production

Document and implement new code with Java 25 as the target baseline.

## Architecture

Use **package-by-feature**, not a traditional layer-based structure.

Business modules live under:

`domain/<feature>/`

Typical feature structure:

```text
<feature>/
├── controller/
├── service/
├── repository/
├── entity/
└── dto/
```

Global technical concerns belong outside `domain/`:

* `config/` - global configuration
* `security/` - authentication and authorization
* `exception/` - global exception handling
* `infrastructure/` - technical infrastructure such as file storage

Do not move feature-specific business logic into global packages.

## DTOs

Use Java records for request/response DTOs where appropriate.

* Validate incoming requests with Jakarta Validation / `@Valid`.
* Keep API DTOs separate from JPA entities.
* Do not expose JPA entities directly from controllers.
* Use explicit mapping methods such as `fromEntity()` where appropriate.
* Use OpenAPI `@Schema` annotations on request/response DTOs when they make the generated documentation clearer.

## OpenAPI / Swagger

Document public API endpoints with OpenAPI annotations.

* Add global OpenAPI configuration under `config/`.
* Use `@Tag` on public controllers.
* Use `@Operation` on public endpoints.
* Use `@ApiResponses` / `@ApiResponse` for important success and error responses.
* Describe JWT-protected endpoints with a `bearerAuth` security scheme once security is implemented.
* Keep documentation consistent with DTO validation and actual authorization rules.

## Error Handling

Use a global `@RestControllerAdvice`.

API errors should have a consistent response structure.

Do not add ad-hoc exception handling in individual controllers when the error belongs to the global error-handling mechanism.

## Security

Authentication uses:

* JWT access tokens
* Refresh tokens
* BCrypt password hashing

Token lifetime:

* Access token: 15 minutes
* Refresh token: 7 days

Use role-based authorization:

* `ROLE_USER`
* `ROLE_JOURNALIST`
* `ROLE_ADMIN`

Use Spring Security mechanisms such as `@PreAuthorize` where appropriate.

Never weaken authorization rules just to make an endpoint easier to implement.

## Roles

### ROLE_USER

Can:

* manage their profile,
* create watch-related posts,
* add reviews,
* comment.

New user posts require moderation and start as `PENDING`.

### ROLE_JOURNALIST

Has USER permissions and can:

* create industry articles,
* publish articles without moderation.

### ROLE_ADMIN

Can:

* moderate posts,
* approve/reject posts,
* manage users and content.

## Posts & Moderation

Post lifecycle:

```text
PENDING -> APPROVED
PENDING -> REJECTED
REJECTED -> PENDING when edited
```

Rejected posts contain `rejectionReason`.

When a rejected post is edited, it returns to `PENDING`.

Do not bypass moderation for regular users.

## Watch Catalog

Watch data includes:

* brand,
* model,
* reference code.

Technical details are represented by `WatchDetails` as an embedded object.

Supported filtering includes:

* brand,
* movement type,
* diameter range,
* minimum water resistance.

Use JPA Specifications for dynamic filtering.

Use pagination for catalog queries.

## Reviews

Reviews contain:

* rating from 1 to 10,
* text review.

Maintain:

* `averageRating`
* `reviewsCount`

When review data changes, these values must remain consistent.

## Comments

Comments use a self-referencing tree structure.

Rules:

* maximum depth: 3 levels,
* use `parent_id` for nesting,
* deleted comments use soft delete,
* deleting a comment must not break the discussion tree.

Avoid N+1 query problems when loading comment trees.

Use JOIN FETCH and DTO projections where appropriate.

## Hashtags

Hashtags must be normalized:

* lowercase,
* remove unsupported/special characters.

Hashtag names must be unique.

Handle concurrent creation safely and preserve the database `UNIQUE(name)` constraint.

## File Storage

Files are used for:

* profile avatars,
* post images,
* article header images.

Validation:

* maximum size: 5 MB,
* allowed types: JPG, PNG, WEBP.

The database stores file URLs/references, not the binary file itself.

Use the `StorageService` abstraction so that local storage and S3/MinIO implementations can be switched without changing business logic.

## Account Deletion

Account deletion should preserve data integrity and historical content.

Prefer anonymization rather than blindly deleting records that are required by existing relationships or statistics.

## Notifications

Use Spring application events for post moderation notifications.

Example:

```text
PostApprovedEvent
PostRejectedEvent
```

Listeners should handle notification delivery without coupling notification logic directly to the post service.

## Design Principles

Follow these principles:

* SOLID
* SRP
* DRY
* YAGNI
* separation of concerns
* explicit business logic
* prefer simple solutions over unnecessary abstractions

Use design patterns only when they solve a real problem.

Current intentional patterns include:

* Strategy - file storage
* Specification - dynamic watch filtering
* Factory methods - DTO creation
* Builder - complex entity construction where justified
* Observer / Spring events - notifications

Do not introduce additional design patterns without a concrete reason.

## Database

PostgreSQL is the primary database.

Use Flyway for schema migrations.

Do not modify the database schema manually when a Flyway migration should be used.

Preserve existing migrations. Add a new migration instead of rewriting an already-applied migration.

Respect database constraints such as:

* foreign keys,
* unique constraints,
* NOT NULL constraints.

## Testing

Use:

* JUnit 5 for unit tests,
* Testcontainers for integration tests.

When changing business logic, add or update relevant tests.

For database-dependent behavior, prefer integration tests with Testcontainers.

## Performance

Be aware of:

* N+1 queries,
* unnecessary entity loading,
* pagination,
* DTO projections,
* JOIN FETCH where appropriate.

Do not optimize speculatively, but do not introduce obvious N+1 or unbounded queries.

## Working Rules

Before changing code:

1. Inspect the existing implementation.
2. Follow the current project structure.
3. Reuse existing abstractions where possible.
4. Do not introduce a new architectural approach without a reason.

When implementing a feature:

1. Understand the existing domain model.
2. Check related entities, repositories, services and DTOs.
3. Implement the smallest coherent change.
4. Add/update tests.
5. Run relevant tests.
6. Fix regressions before finishing.

Do not rewrite unrelated code.

Do not make broad refactors unless explicitly requested.

## Important

The existing codebase is the source of truth for implementation details.

These instructions describe architectural intent and project conventions. If the existing implementation differs, inspect the code and determine whether the difference is intentional before changing it.

When uncertain about a business rule, do not invent behavior. Ask for clarification or clearly state the assumption before implementing it.
