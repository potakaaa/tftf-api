# tftf-api - All Context

Last updated: 2026-06-01

This is the root context entrypoint for TFTF Edge. Read it before substantial
research, planning, review, or implementation work, then load only the smallest
relevant context group.

## Project Purpose

TFTF Edge is a developer-facing jeepney route calculation API with a web
playground. It currently serves a bundled Cagayan de Oro route graph, but the
product direction is broader: support other Philippine localities when their
jeepney routes can be represented in the same dataset format.

Treat Cagayan de Oro as the first dataset, not as a permanent architectural
boundary. Avoid hard-coding city-specific assumptions into reusable API,
runtime, or UI code.

## Context Routing

| File | Read when |
|---|---|
| `process/context/all-context.md` | Any substantial task |
| `process/context/tests/all-tests.md` | Testing, verification, or test debugging |
| `process/context/planning/all-planning.md` | Plan creation or plan-shape calibration |
| `process/context/native-routing/all-native-routing.md` | Native runner, graph datasets, locality expansion, or route-service integration |
| `process/context/uxui/all-uxui.md` | Web playground UI, shared components, or durable design conventions |

## Task Routing

| Task | Load next |
|---|---|
| API route behavior or public response contract | `process/context/native-routing/all-native-routing.md` |
| C++ build, runner failures, or dataset changes | `process/context/native-routing/all-native-routing.md` |
| Locality expansion | `process/context/native-routing/all-native-routing.md` |
| Tests or verification | `process/context/tests/all-tests.md` |
| Browser-based UI verification | `process/context/tests/browser-automation.md` |
| Web playground UI or shared component work | `process/context/uxui/all-uxui.md` |
| New implementation plan | `process/context/planning/all-planning.md` |

## Current Features

| Feature | Folder | Scope |
|---|---|---|
| Route calculation | `process/features/route-calculation/` | Developer-facing route API, native graph runner, bundled dataset, and web playground |

## Repository Structure

```text
tftf-api/
  apps/
    api/                       # FastAPI wrapper and vendored C++ runtime
      app/                     # Python API, schemas, config, and services
      native/                  # C++17 runner plus bundled graph dataset
      scripts/                 # Cross-platform Python and CMake launchers
      tests/                   # pytest API and service tests
    web/                       # TanStack Start route API playground
  packages/
    shared/                    # Reserved shared-contract package area
    ui/                        # Shared React components and Tailwind theme
  process/
    context/                   # Durable repository knowledge
    development-protocols/     # Shared RIPER-5 workflow rules
    features/                  # Feature-scoped plans, reports, and references
    general-plans/             # Cross-cutting plans, reports, and references
```

## Technology Stack

- **Monorepo:** pnpm `10.33.4` workspaces with Turborepo `^2.9.15`
- **Runtime:** Node.js `>=20`; local scan used Node.js `v22.17.1`
- **API:** Python `>=3.11`, FastAPI `>=0.115,<1.0`, Uvicorn
- **API configuration:** `pydantic-settings >=2.0,<3.0`
- **Native runtime:** C++17 with CMake; local scan used CMake `4.3.2`
- **Web:** TanStack Start, TanStack Router, React `^19.2.6`, Vite `^8`
- **UI:** Tailwind CSS v4, shadcn, Radix UI, Instrument Sans
- **Tests:** pytest `>=8.0,<9.0` with HTTPX ASGI transport
- **Database:** none
- **Authentication:** none

## Architecture

The public route API is a Python adapter around a vendored native graph runner:

```text
GET /api/routes
  -> FastAPI query parsing
  -> RouteRequest
  -> subprocess invocation of native/bin/tftf_runner
  -> JSON stdin/stdout exchange
  -> Pydantic validation
  -> public RouteResponse aliases
```

The web app is an API playground for developers. It checks `/health`, submits
route queries, and displays the adapted response. It is not the source of route
calculation logic.

## Key Patterns

- Use `pnpm`, not `npm`.
- API environment variables use the `TFTF_` prefix.
- The API runner path is server-controlled through `TFTF_RUNNER_DIR`.
- The route service validates runner presence, applies a timeout, parses the
  last JSON object written to stdout, and converts native errors to
  `RouteServiceError`.
- The FastAPI route converts route-service failures to HTTP `502`.
- The public response intentionally retains legacy serialized aliases such as
  `From`, `Routes`, and `Lattitude`. Treat changes as public API contract work.
- `apps/api/native/` is self-contained. Production and local API development do
  not require the sibling `../TFTFGraph` checkout.
- The web package imports shared UI through `@workspace/ui`.

## Locality Expansion Decision

When multi-locality support is implemented, prefer a server-side dataset
registry keyed by stable locality slugs such as `cagayan-de-oro`.

- Keep `cagayan-de-oro` as the backward-compatible default.
- Allow a client to select a known locality through the public API contract.
- Resolve locality slugs to dataset files on the server.
- Never accept arbitrary client-provided filesystem paths.
- Keep deployment or environment configuration for registry defaults and
  operational overrides, not as the only locality-selection mechanism.

This is a documented direction, not an implemented feature.

## Environment and Configuration

API settings live in `apps/api/app/core/config.py`. Reference defaults are in
`apps/api/.env.example`.

| Variable | Purpose |
|---|---|
| `TFTF_APP_NAME` | FastAPI application title |
| `TFTF_CORS_ORIGINS` | Explicit allowed browser origins |
| `TFTF_CORS_ORIGIN_REGEX` | Local-development origin matching |
| `TFTF_LOG_LEVEL` | Python log level |
| `TFTF_RUNNER_DIR` | Compatible native runtime directory override |
| `TFTF_RUNNER_TIMEOUT_SECONDS` | Native subprocess timeout |
| `VITE_API_BASE_URL` | Web playground API base URL |

## Important Commands

```bash
pnpm install
pnpm native:build
pnpm dev
pnpm --dir apps/api test
pnpm --dir apps/web build
pnpm typecheck
pnpm lint
```

## Update Triggers

Refresh this file when:

- a new app, package, feature folder, or context group is added
- public route API aliases or endpoints change
- locality selection is implemented
- the graph dataset contract changes
- test runners, build tools, or environment variables change

## Context Group Lifecycle

Context groups are durable knowledge domains, not feature folders.

- Add or promote a group when a topic has three or more durable docs, one doc
  grows beyond roughly 800 lines with separable topics, or agents repeatedly
  need one stable slice of repository knowledge.
- Use `all-{group}.md` as each group's entrypoint.
- Update this root router whenever a group is added, renamed, or removed.
- Run the `vc-audit-context` validators after context organization changes.

## Open Questions and Outstanding Work

- Multi-locality dataset selection is documented but not implemented.
- The API does not yet expose a locality slug.
- The dataset refresh and vendoring process is manual.
- Web UI automation and a real native-runner smoke test have not been added.

## Scan Metadata

- **Scanned:** 2026-06-01
- **Repo HEAD at scan time:** `ec9d4914b31f2984ee4776e74641293826134594`
- **Working tree:** dirty before setup; existing user changes were preserved
