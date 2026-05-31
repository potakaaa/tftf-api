# Route Calculation

## Scope

Developer-facing jeepney route calculation for TFTF Edge. This feature covers
the FastAPI route endpoint, the vendored C++ graph runner, the bundled Cagayan
de Oro dataset, and the TanStack Start playground used to exercise the API.

Cagayan de Oro is the initial locality. Future work should preserve a path to
serving additional Philippine localities through compatible graph datasets.

## Key Source Files

- `apps/api/app/routes/routes.py` -- public `GET /api/routes` endpoint
- `apps/api/app/services/route_service.py` -- native subprocess adapter
- `apps/api/app/schemas/route.py` -- native and public response models
- `apps/api/native/` -- self-contained C++ runtime and bundled graph dataset
- `apps/api/scripts/build-native.mjs` -- cross-platform native build launcher
- `apps/web/src/routes/index.tsx` -- developer playground

## Related Context

- `process/context/native-routing/all-native-routing.md`
- `process/context/tests/all-tests.md`

## Current Status

Status: in-progress

The Cagayan de Oro route API, vendored native runner, basic tests, and web
playground exist. Multi-locality dataset selection is documented as a future
direction and has not been implemented.

## Folder Contents

```text
process/features/route-calculation/
  active/       -- in-progress plans for this feature
  completed/    -- archived completed plans
  backlog/      -- deferred or future plans
  reports/      -- feature-specific operational reports
  references/   -- feature-specific research and reference docs
```

