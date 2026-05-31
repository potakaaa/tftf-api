# TFTF Edge API

Clean monorepo for the next version of TFTF Edge API, a jeepney route
calculation service for Cagayan de Oro.

## Apps

- `apps/api`: FastAPI backend. See [apps/api/README.md](apps/api/README.md).
- `apps/web`: TanStack Start web app. This will host API documentation later.

## Packages

- `packages/ui`: Shared web UI components.
- `packages/shared`: Placeholder for shared types and configuration when needed.

## Web Development

Install JavaScript dependencies and start the existing TanStack Start app:

```bash
pnpm install
pnpm --dir apps/web dev
```

## Full Development Environment

Set up the Python API once using [apps/api/README.md](apps/api/README.md), then
start the API and web app together:

```bash
pnpm dev
```

Turbo shows `api#dev` and `web#dev` as separate long-running tasks. Each app
prints request logs in its task output.
