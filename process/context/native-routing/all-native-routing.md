# Native Routing Context

Last updated: 2026-06-01

Read this after `process/context/all-context.md` for native runner, graph
dataset, locality expansion, or route-service integration work.

## Scope

This group covers:

- vendored C++17 route-runtime build and execution
- graph dataset provenance and serialized format boundary
- FastAPI subprocess integration
- multi-locality expansion direction

It does not cover:

- feature-specific implementation plans
- general web playground layout
- research-only baseline algorithms that remain in the sibling TFTFGraph repo

## Runtime Flow

```text
GeoJSON route polylines
  -> ../TFTFGraph/graph_export.cpp
  -> serialized data/graph.json
  -> vendored apps/api/native/data/graph.json
  -> apps/api/native/bin/tftf_runner
  -> apps/api/app/services/route_service.py
  -> GET /api/routes
```

The API repository vendors the production subset required at runtime. It does
not require `../TFTFGraph` to run.

## Dataset Provenance

The sibling `../TFTFGraph` research repository contains:

- source GeoJSON under `data/geojson/`
- `graph_export.cpp`, which transforms route polylines into
  `data/graph.json`
- benchmark and baseline comparison code
- the upstream runner implementation

At setup scan time, `apps/api/native/data/graph.json` and
`../TFTFGraph/data/graph.json` were byte-for-byte identical with SHA-256:

```text
0486297a273e42c782e2485352834f92be36b677aaff14b2119af080d48e80ab
```

Do not assume the vendored graph updates automatically. Treat dataset refreshes
as intentional changes and verify provenance.

## Native Runner Contract

The vendored runner:

- builds with CMake and C++17
- loads `data/graph.json` relative to its runtime directory
- reads one JSON request per stdin line
- writes JSON response data to stdout

The Python adapter sends:

```json
{
  "start": { "lat": 8.50881, "lon": 124.64827 },
  "end": { "lat": 8.51133, "lon": 124.62429 }
}
```

The adapter validates native output with Pydantic before converting it into the
public response schema.

## Locality Expansion Direction

The current bundled graph is for Cagayan de Oro. Future Philippine localities
should reuse the graph dataset format when possible.

Recommended implementation direction:

1. Store datasets under server-owned locality slugs such as
   `cagayan-de-oro`.
2. Add a server-side registry from slug to compatible dataset location and
   metadata.
3. Keep `cagayan-de-oro` as the backward-compatible default.
4. Let API clients select a known slug when multi-locality support is added.
5. Reject unknown slugs and never accept arbitrary client filesystem paths.
6. Decide whether a long-lived runner process or per-request runner invocation
   is appropriate before optimizing dataset switching.

This is a documented product direction, not an implemented API contract.

## Commands

```bash
pnpm native:build
pnpm --dir apps/api test
```

Build output:

```text
macOS/Linux: apps/api/native/bin/tftf_runner
Windows:     apps/api/native/bin/tftf_runner.exe
```

## Source Paths

- `apps/api/native/`
- `apps/api/scripts/build-native.mjs`
- `apps/api/app/services/route_service.py`
- `apps/api/app/schemas/route.py`
- `apps/api/app/core/config.py`
- `../TFTFGraph/graph_export.cpp`
- `../TFTFGraph/data/geojson/`

## Update Triggers

Update this group when:

- the native request or response schema changes
- graph export or vendoring workflow changes
- locality selection is implemented
- runner process lifecycle changes
- native build commands or output paths change

