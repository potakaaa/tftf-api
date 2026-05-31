# Browser Automation

Last updated: 2026-06-01

Read this after `process/context/tests/all-tests.md` when web behavior requires
browser verification.

## Current Surface

The TanStack Start web app is a developer playground at
`http://localhost:3000`. It submits route requests to the FastAPI service at
`http://127.0.0.1:8000` by default and links to the OpenAPI docs.

There is no automated browser suite yet.

## Verification Guide

- Use direct build and typecheck commands first for static verification.
- Start both apps with `pnpm dev` for full playground verification.
- Verify `/health`, route calculation, form validation, error presentation,
  dark-mode persistence, and the OpenAPI docs link when related UI changes.
- Use the browser automation skill for repeatable local interaction checks.
- Add Playwright or another committed browser suite only when the project needs
  durable automated coverage.

## Source Paths

- `apps/web/src/routes/__root.tsx`
- `apps/web/src/routes/index.tsx`
- `apps/web/vite.config.ts`
- `packages/ui/src/styles/globals.css`

## Update Triggers

Update this file when browser test tooling, dev URLs, route playground flows, or
manual verification expectations change.

