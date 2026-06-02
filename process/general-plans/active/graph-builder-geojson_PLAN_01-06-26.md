# Graph Builder GeoJSON Intake + NDJSON Cleanup Plan

**Date:** 01-06-26
**Complexity:** Simple
**Status:** ⏳ PLANNED

## Overview

Update the native graph builder to accept GeoJSON LineString feature collections, skip non-LineString features silently, preserve the serialized graph JSON output behavior at `output_path`, and ensure any load/save logs are emitted to stderr so stdout remains clean NDJSON progress events.

## Quick Links

- [Goals and Success Metrics](#goals-and-success-metrics)
- [Phase Completion Rules](#phase-completion-rules)
- [Execution Brief](#execution-brief)
- [Scope](#scope)
- [Assumptions and Constraints](#assumptions-and-constraints)
- [Functional Requirements](#functional-requirements)
- [Non-Functional Requirements](#non-functional-requirements)
- [Acceptance Criteria](#acceptance-criteria)
- [Implementation Checklist](#implementation-checklist)
- [Risks and Mitigations](#risks-and-mitigations)
- [Integration Notes](#integration-notes)
- [Touchpoints](#touchpoints)
- [Public Contracts](#public-contracts)
- [Blast Radius](#blast-radius)
- [Verification Evidence](#verification-evidence)
- [Resume and Execution Handoff](#resume-and-execution-handoff)
- [Cursor + RIPER-5 Guidance](#cursor--riper-5-guidance)

## Goals and Success Metrics

**Goals**
- Graph builder accepts GeoJSON FeatureCollection inputs containing LineString routes and produces the same serialized graph JSON format at `output_path`.
- Non-LineString features are ignored without emitting NDJSON errors or logs.
- stdout remains NDJSON-only (progress/completed/error events), while load/save logs are moved to stderr.

**Success Metrics**
- Running the builder with `allRoutes.geojson` yields a `completed` event and writes a valid graph JSON file.
- stdout contains only JSON event lines; any load/save messages are visible only on stderr.
- Existing request fields (`graph_path`, `output_path`, `transfer_range`) behave as before.

## Phase Completion Rules

A phase is NOT complete until:

1. **Integration Test** - Works with other system pieces
2. **Manual Test** - User can perform the action
3. **Data Verification** - Database/state changes confirmed
4. **Error Handling** - Failure cases handled gracefully
5. **User Confirmation** - User says "it works"

Status meanings:
- ⏳ PLANNED - Not started
- 🔨 CODE DONE - Written but not E2E tested
- 🧪 TESTING - Currently being tested
- ✅ VERIFIED - Tested AND confirmed working
- 🚧 BLOCKED - Has issues

After each phase, document:
- [ ] What was tested manually
- [ ] Data verified in DB (show query + result)
- [ ] Errors encountered and fixed
- [ ] User confirmation received

## Execution Brief

**IMPORTANT:** This is a SIMPLE (one-session) plan - implement continuously without approval gates. The phases below are logical groupings for flow clarity, not stop points.

### Phase 1: Input Detection + GeoJSON Parsing
**What happens:** Detect whether `graph_path` points to GeoJSON, parse the feature collection, and construct an in-memory `TFTFGraph` from LineString features.
**Test:** Load `allRoutes.geojson` and confirm a non-zero route count in the completion event.
**Verify:** Output file exists and contains a `routes` array with entries.
**Done when:** Builder runs end-to-end using GeoJSON input without NDJSON errors.

### Phase 2: NDJSON Cleanup for Load/Save Logs
**What happens:** Redirect `std::cout` output from `loadGraphFromDisk` and `saveGraphToDisk` to stderr while keeping NDJSON events on stdout.
**Test:** Run builder and confirm stdout has only JSON event lines.
**Verify:** `Graph loaded`/`Graph saved` messages appear on stderr only.
**Done when:** stdout NDJSON is clean and stderr captures load/save logs.

### Phase 3: Transfers + Serialized Output
**What happens:** Reuse transfer generation and serialize the updated graph to `output_path`.
**Test:** Confirm `completed` event includes route and edge counts.
**Verify:** Open output JSON and confirm route edges were added.
**Done when:** Output graph JSON is written at `output_path` and event counts match the file.

### Expected Outcome
- GeoJSON LineString inputs produce a serialized graph JSON output at `output_path`.
- Non-LineString features are skipped silently.
- NDJSON stdout contains only progress/completed/error events.

## Scope

**In-Scope**
- Update `apps/api/native/src/tftf_graph_builder.cpp` only.
- Detect and parse GeoJSON FeatureCollection inputs.
- Skip non-LineString features silently.
- Redirect load/save logs to stderr without touching NDJSON event output.

**Out-of-Scope**
- Changes to other C++ sources or schema definitions.
- API schema changes or FastAPI logic updates.
- New automated tests beyond existing native build checks.

## Assumptions and Constraints

**Assumptions**
- GeoJSON inputs are a FeatureCollection with `features[].geometry.coordinates` as `[lon, lat, (alt)]` arrays.
- `properties.name` exists for route naming; if missing, a fallback route name is acceptable.
- Route IDs can be assigned deterministically by the builder when missing in GeoJSON.

**Constraints**
- Scope is limited to `tftf_graph_builder.cpp`.
- The builder must continue writing serialized graph JSON to `output_path`.
- Non-LineString features must not emit NDJSON errors or logs.

## Functional Requirements

1. **GeoJSON Detection**
   - If the parsed input JSON is a FeatureCollection with a `features` array, treat it as GeoJSON.
   - Otherwise, load serialized graph JSON using the existing `loadGraphFromDisk` function.

2. **GeoJSON Parsing**
   - For each feature:
     - If `geometry.type` is not `LineString`, skip the feature with no stdout or stderr output.
     - If `geometry.coordinates` is missing or invalid, skip the feature and emit a stderr warning (not NDJSON).
   - Build `Coordinate` values from `[lon, lat, ...]` pairs.
   - Require at least two valid coordinates to create a route.
   - Route naming rules:
     - Use `properties.name` when present and string.
     - Otherwise, use `Route {id}`.
   - Route ID rules:
     - Use `properties.route_id` when present and integer.
     - Otherwise, assign incremental IDs based on accepted LineString order starting at 0.
   - Loop detection:
     - If `properties.is_loop` is boolean, use it.
     - Otherwise, treat a route as looped when the first and last coordinates match.

3. **Transfer Generation**
   - After building or loading the graph, call `clearTransfers()` before generating transfers.
   - Use `createTransfersFromCoordinates(transfer_range, callback)` as today.

4. **NDJSON Event Stream**
   - stdout remains NDJSON events emitted via `writeEvent` only.
   - `progress` and `completed` events preserve existing payload shapes.

5. **NDJSON Cleanup for Logs**
   - Redirect `std::cout` output from `loadGraphFromDisk` and `saveGraphToDisk` to stderr.
   - Ensure redirection is scoped only to those calls so progress events still go to stdout.

6. **Output Path**
   - Always serialize the resulting graph to `output_path` (defaulting to `graph_path` when omitted).

## Non-Functional Requirements

- **Reliability:** If GeoJSON parsing fails, emit a single `error` event and exit with non-zero status.
- **Observability:** Any warnings (invalid coordinates, skipped empty LineString) go to stderr only.
- **Performance:** Parsing and transfer creation remains single-pass and streaming to avoid additional memory overhead.

## Acceptance Criteria

1. Running the builder with `graph_path` set to `allRoutes.geojson` writes a serialized graph JSON file at `output_path`.
2. stdout contains only NDJSON events (`progress`, `completed`, `error`) with no plain text logs.
3. Non-LineString features produce no NDJSON errors or stdout logs.
4. The final `completed` event contains `graph_path`, `route_count`, and `edge_count` matching the output file.
5. Existing graph JSON inputs still work without regression.

## Implementation Checklist

1. Review `tftf_graph_builder.cpp` and identify the current load/transfer/save flow and stdout usage.
2. Add a GeoJSON detection step that reads the input file as JSON and branches on FeatureCollection vs serialized graph JSON.
3. Implement GeoJSON-to-graph construction logic (route IDs, names, loops, coordinate parsing) directly in `tftf_graph_builder.cpp`.
4. Enforce silent skipping for non-LineString features and stderr-only warnings for invalid/empty LineStrings.
5. Add a scoped `std::cout` redirection helper to send load/save logs to stderr without affecting NDJSON events.
6. Call `clearTransfers()` before generating transfers for both GeoJSON and graph JSON inputs.
7. Preserve existing `progress` callback behavior and final `completed` event payload.
8. Serialize the resulting graph to `output_path` using existing `saveGraphToDisk`.
9. Run `pnpm native:build` to ensure native compilation succeeds.
10. Manually execute the graph builder with `allRoutes.geojson` and confirm stdout NDJSON and stderr logs behave as specified.

## Risks and Mitigations

- **Risk:** GeoJSON inputs have unexpected property names or coordinate formats.
  - **Mitigation:** Keep parsing minimal and resilient; warn on stderr for invalid coordinates while continuing.
- **Risk:** Redirecting `std::cout` could accidentally capture NDJSON events.
  - **Mitigation:** Scope redirection only around `loadGraphFromDisk` and `saveGraphToDisk` calls.

## Integration Notes

- The graph builder is invoked by `app.services.graph_service.stream_graph_build` and streams NDJSON to API clients; stdout must remain JSON-only.
- No API schema changes are required, but the native binary must be rebuilt for changes to apply.

## Touchpoints

- `apps/api/native/src/tftf_graph_builder.cpp`

## Public Contracts

- Graph builder NDJSON event stream: `progress`, `completed`, `error` event shapes.
- Request payload fields: `graph_path`, `output_path`, `transfer_range`.

## Blast Radius

- Native graph builder behavior for GeoJSON inputs and stdout/stderr output streams.
- Downstream API consumers reading NDJSON from stdout.

## Verification Evidence

- `pnpm native:build` succeeds.
- Manual run: `tftf_graph_builder` with GeoJSON input outputs only NDJSON on stdout.
- Output file contains a `routes` array with non-zero routes and edges.

## Resume and Execution Handoff

- Implement changes only in `apps/api/native/src/tftf_graph_builder.cpp`.
- Rebuild native binaries with `pnpm native:build` before manual verification.
- Validate stdout NDJSON cleanliness by piping stdout to `jq` and verifying stderr logs separately.

## Cursor + RIPER-5 Guidance

- Cursor Plan mode: import the Implementation Checklist verbatim.
- RIPER-5: Plan approved; request EXECUTE mode for implementation.
- If scope expands beyond this file, stop and re-plan as COMPLEX.
