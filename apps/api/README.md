# TFTF Edge API Backend

FastAPI backend for TFTF route calculation. The API invokes the vendored C++
runtime in `native/` and adapts its output into the public route response.

## Requirements

- Python 3.11 or newer
- CMake
- A C++17 compiler
- Node.js and pnpm for the cross-platform helper scripts

## Python Setup

From `apps/api`, create a virtual environment and install development
dependencies.

macOS and Linux:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
```

Windows PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
```

Or from the repository root:

```bash
pnpm --dir apps/api setup
```

Optionally copy `.env.example` to `.env` to override local settings.

## Native Route Runner

Build the OS-specific native executable from the repository root:

```bash
pnpm native:build
```

Build outputs:

```text
macOS/Linux: apps/api/native/bin/tftf_runner
Windows:     apps/api/native/bin/tftf_runner.exe
```

The executable and CMake build directory are ignored by Git. Each machine
builds its own binary. No external TFTFGraph repository is required.

## Run

Start the API from the repository root:

```bash
pnpm --dir apps/api dev
```

The API is available at `http://127.0.0.1:8000`. Interactive OpenAPI
documentation is available at `http://127.0.0.1:8000/docs`.

To start both API and web:

```bash
pnpm dev
```

## Test

From the repository root:

```bash
pnpm --dir apps/api test
```

To run the full repository CI baseline locally:

```bash
pnpm check
```

## Endpoints

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Route calculation:

```bash
curl "http://127.0.0.1:8000/api/routes?fromLat=8.50881&fromLong=124.64827&fromName=Bonbon&toLat=8.51133&toLong=124.62429&toName=Westbound%20Bulua%20Terminal&transMeter=100.5&hour=10"
```

## Configuration

Settings are loaded from environment variables prefixed with `TFTF_`. See
`.env.example` for defaults.

`TFTF_RUNNER_DIR` normally does not need to be changed. It is available only
for intentionally overriding the compatible native runtime directory.

## Native Integration

`app/services/route_service.py` invokes the native runner through stdin/stdout.
The runner receives origin and destination coordinates as JSON and returns
route segments for conversion into the public API response schema.

## Render Deployment

Render deployment is configured with [render.yaml](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/render.yaml) and [apps/api/Dockerfile](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/apps/api/Dockerfile).

- Runtime: Docker
- Health check: `/health`
- Required environment variable: `TFTF_CORS_ORIGINS`
- Example value: `["https://your-site.netlify.app"]`
