# AGENTS.md

## Project

WatchWeb Frontend - React application for watch enthusiasts.

The frontend connects to the WatchWeb backend API and should support:

* community posts,
* industry articles,
* watch catalog browsing,
* reviews and ratings,
* comments,
* user profiles,
* moderation/admin workflows.

## Tech Stack

Use this stack as the default direction for new frontend work:

* React with TypeScript
* Vite
* React Router for routing
* TanStack Query for server state and API caching
* React Hook Form + Zod for complex forms and validation
* Tailwind CSS for styling
* shadcn/ui for reusable, accessible UI components
* lucide-react for icons

Do not add large UI frameworks such as Bootstrap, MUI, Ant Design, or Chakra UI unless there is a concrete reason and the tradeoff is discussed first.

Bootstrap is acceptable for quick prototypes, but the preferred direction for this project is Tailwind CSS + shadcn/ui because it gives more control over visual design, keeps components easy to customize, and is widely used in modern React projects.

## Main Goals

The frontend should be:

* modular,
* easy to learn from,
* easy to style and restyle,
* strongly typed,
* consistent with the backend API,
* good enough to show in a portfolio/CV,
* built with patterns that scale beyond a toy project.

Prefer clear, explicit code over clever abstractions.

## Architecture

Use a feature-oriented structure. Avoid putting all components, hooks, or services into one global folder.

Preferred structure:

```text
src/
  app/
    providers/
    routes/
    App.tsx
  pages/
  features/
  entities/
  shared/
    api/
    config/
    hooks/
    lib/
    styles/
    ui/
  assets/
```

### Folder Responsibilities

`app/`

Application shell, global providers, router setup, layout composition, and app-level configuration.

`pages/`

Route-level screens. Pages should compose features and widgets, not contain most business logic.

`features/`

User actions and workflows, for example login, create post, submit watch, approve submission, edit profile.

`entities/`

Domain-oriented UI and logic for backend resources, for example user, watch, post, article, review, comment, notification.

`shared/`

Reusable code that is not tied to a single business feature. This includes base UI components, API client, helpers, generic hooks, constants, and styling utilities.

`assets/`

Static assets imported by the app.

## Dependency Rules

Keep imports flowing in one direction:

```text
app -> pages -> features -> entities -> shared
```

Allowed:

* `pages` may import from `features`, `entities`, and `shared`.
* `features` may import from `entities` and `shared`.
* `entities` may import from `shared`.
* `shared` must not import from `app`, `pages`, `features`, or `entities`.

Avoid direct imports between unrelated features. If two features need the same helper or component, move that piece to `shared/`.

## API Integration

The frontend should call the backend through relative `/api/...` paths.

In Docker Compose, Nginx proxies `/api/...` from the frontend container to the backend service. Do not hardcode `http://localhost:8081` inside application code unless it is isolated in one environment config file.

Use one API client abstraction under:

```text
src/shared/api/
```

Recommended files:

```text
src/shared/api/httpClient.ts
src/shared/api/apiError.ts
src/shared/api/authTokenStorage.ts
```

Use typed request and response DTOs. Keep DTOs close to the API/domain they describe. If OpenAPI code generation is added later, generated code should live in a clearly marked folder, for example:

```text
src/shared/api/generated/
```

Do not scatter raw `fetch()` calls across components. Components should use feature/entity hooks such as:

```text
useWatches()
useWatchDetails(id)
useLogin()
useCreatePost()
```

## State Management

Use the smallest state tool that solves the problem:

* local component state for local UI state,
* React Hook Form for form state,
* TanStack Query for server state,
* React Context for small global app concerns such as auth/session or theme,
* Zustand only if there is real global client-side state that does not belong to the server.

Do not duplicate server data in global client stores when TanStack Query can own it.

## Styling

Prefer Tailwind utility classes and reusable shadcn/ui-style components.

Use shared base components under:

```text
src/shared/ui/
```

Examples:

```text
Button
Input
Textarea
Select
Dialog
DropdownMenu
Card
Badge
Avatar
Tabs
Pagination
```

Keep design tokens easy to adjust:

* colors,
* spacing,
* border radius,
* typography,
* shadows,
* focus states.

Avoid one-off CSS when a reusable component or token would be better. However, do not over-abstract small components too early.

## UI Design Direction

The application is a community/catalog product, not a marketing landing page.

Prefer:

* clean layouts,
* strong readability,
* useful density,
* good forms,
* clear navigation,
* polished empty/loading/error states,
* accessible controls,
* responsive behavior from the start.

Avoid:

* decorative layouts that make core workflows harder,
* huge landing-page hero sections as the main app experience,
* excessive gradients,
* UI elements that look like unrelated templates,
* styling that is hard to customize later.

## Components

Keep components focused.

Good component categories:

* page components,
* feature components,
* entity components,
* shared UI primitives,
* layout components.

Avoid components that know too much about unrelated domains.

Prefer composition over large prop-heavy components. If a component gets too many boolean props, split it or use child components.

## Forms

For important forms, use:

* React Hook Form,
* Zod schemas,
* typed submit handlers,
* backend-compatible validation messages where practical.

Form examples:

* login,
* register,
* create/edit post,
* create/edit article,
* submit watch,
* add review,
* edit profile,
* moderation rejection reason.

## Auth

The backend uses JWT access tokens and refresh tokens.

Keep auth logic centralized. Do not manually manage tokens in many components.

Recommended structure:

```text
src/features/auth/
src/shared/api/authTokenStorage.ts
```

Protected routes should be handled through route guards/layouts, not repeated checks on every page.

## Error, Loading, and Empty States

Every API-driven screen should handle:

* loading state,
* empty state,
* error state,
* success state.

Do not leave raw error objects visible to users. Convert them into readable messages.

## Accessibility

Use semantic HTML first.

Make sure:

* buttons are real `<button>` elements,
* form inputs have labels,
* dialogs trap focus,
* keyboard navigation works,
* visible focus states exist,
* colors have enough contrast.

Prefer accessible primitives from shadcn/ui and Radix-based components.

## Testing

When meaningful UI logic is added, prefer focused tests.

Recommended future tools:

* Vitest,
* React Testing Library,
* MSW for API mocking,
* Playwright for key end-to-end flows.

Do not add broad tests for generated boilerplate. Add tests where they protect real behavior.

## Docker

Docker Compose is the main way to run the full application.

The frontend production container should:

* build the Vite app,
* serve static files through Nginx,
* proxy `/api/...` to the backend service,
* support browser refresh on client-side routes.

Do not put development-only assumptions into the production Docker image.

## Working Rules

Before changing frontend code:

1. Inspect the existing feature structure.
2. Reuse existing components and hooks where possible.
3. Keep changes close to the feature being edited.
4. Do not introduce new libraries without a clear reason.
5. Keep API paths and DTOs consistent with the backend.
6. Run relevant checks before finishing.

Default checks:

```powershell
npm run lint
npm run build
```

For full app verification:

```powershell
docker compose up -d --build
```

## Important

This file is a living guide. If the frontend grows in a different but intentional direction, update this file so it stays useful.

The goal is not to follow patterns blindly. The goal is to keep the codebase understandable, modular, and pleasant to work with.
