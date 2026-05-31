# tftf-api - All Tests

Last updated: 2026-06-01

Read this after `process/context/all-context.md` when testing, verifying, or
debugging changes.

## Scope

This group covers current test runners, commands, known setup requirements, and
test gaps.

## Quick Routing

| Need | Read next |
|---|---|
| Browser verification or automation tool selection | `process/context/tests/browser-automation.md` |

## Quick Decision Guide

### Use pytest for API and route-service changes

- API tests live in `apps/api/tests/`.
- Tests run through the app-local virtual environment launcher.
- Route-service tests monkeypatch `subprocess.run`; they do not require a real
  native executable.

### Use build and typecheck commands for web and UI changes

- No automated web component or browser tests exist yet.
- Use the web build and workspace typecheck as the current baseline.
- Perform browser verification when UI behavior changes.

### Use the native build for runtime integration changes

- Run `pnpm native:build` when changing vendored C++ sources, CMake config, or
  the runner integration.
- Add a real runner smoke check when native behavior changes.

## Commands

| Scope | Runner | Command | Notes |
|---|---|---|---|
| API | pytest | `pnpm --dir apps/api test` | Uses `apps/api/.venv` |
| API health only | pytest | `pnpm --dir apps/api test -- tests/test_health.py` | ASGI transport, no server required |
| Route service only | pytest | `pnpm --dir apps/api test -- tests/test_route_service.py` | Native subprocess is stubbed |
| Native runner build | CMake | `pnpm native:build` | Produces an ignored OS-specific binary |
| Web production build | Vite | `pnpm --dir apps/web build` | Current web verification baseline |
| Workspace typecheck | Turbo | `pnpm typecheck` | Runs package typecheck scripts |
| Workspace lint | Turbo | `pnpm lint` | Runs package lint scripts |

## Current Test Files

| File | Coverage |
|---|---|
| `apps/api/tests/test_health.py` | `/health` response and local CORS regex |
| `apps/api/tests/test_route_service.py` | Native response adaptation, missing runner error, Windows executable naming |

## Debugging Quick Reference

- If API commands fail immediately, create `apps/api/.venv` and install
  `apps/api` with the `dev` extra.
- If route execution reports a missing runner, run `pnpm native:build`.
- Generated native files under `apps/api/native/build/` and
  `apps/api/native/bin/` are local-only and intentionally ignored.
- `TFTF_RUNNER_DIR` overrides the compatible native runtime directory.
- The API accepts native log lines before the response because it parses the
  last valid JSON object written to stdout.

## Known Gaps

- No direct HTTP test covers `GET /api/routes`.
- No real native-runner integration smoke test exists.
- No automated web tests exist.
- No CI workflow is present in `.github/`.
- Multi-locality behavior is not implemented or tested yet.

## Update Triggers

Update this file when test files, runner commands, CI, virtual-environment
requirements, or verification expectations change.

