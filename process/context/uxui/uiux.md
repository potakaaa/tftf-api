# UI and UX Conventions

Last updated: 2026-06-01

## Product Surface

The current web app is a developer-facing API playground, not a commuter
application. It should make route requests, response data, API health, and
OpenAPI access easy to inspect.

## Stack and Sources

- `apps/web/src/routes/__root.tsx` -- document shell, metadata, initial theme
- `apps/web/src/routes/index.tsx` -- playground UI and request flow
- `packages/ui/src/components/button.tsx` -- shared button variants
- `packages/ui/src/styles/globals.css` -- Tailwind v4 theme and light/dark tokens

## Conventions

- Import shared UI through `@workspace/ui`.
- Reuse tokenized colors from `packages/ui/src/styles/globals.css`.
- Preserve the light and dark theme behavior using the `tftf-theme`
  local-storage key.
- Keep API-facing copy suitable for developers integrating the route service.
- Avoid encoding Cagayan de Oro as the only possible locality in reusable UI
  structures. It is the initial dataset.
- Keep responsive layouts usable from the existing `320px` minimum width.

## Verification

Read `process/context/tests/browser-automation.md` for manual and automated
browser verification guidance.

## Update Triggers

Update this file when theme tokens, shared components, UI audience, responsive
expectations, or playground workflows change.

