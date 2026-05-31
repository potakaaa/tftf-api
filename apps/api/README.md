# TFTF Edge API Backend

FastAPI backend for TFTF route calculation. Route results are mocked while the
C++ algorithm integration is prepared.

## Requirements

- Python 3.11 or newer

## Setup

From `apps/api`, create and activate a virtual environment, then install the
application with development dependencies:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -e ".[dev]"
```

Optionally copy `.env.example` to `.env` to override local settings.

## Run

From `apps/api`:

```bash
uvicorn app.main:app --reload --no-access-log
```

The API is available at `http://127.0.0.1:8000`. Interactive OpenAPI
documentation is available at `http://127.0.0.1:8000/docs`.

## Endpoints

Health check:

```bash
curl http://127.0.0.1:8000/health
```

Mocked route calculation:

```bash
curl "http://127.0.0.1:8000/api/routes?fromLat=8.50881&fromLong=124.64827&fromName=Bonbon&toLat=8.51133&toLong=124.62429&toName=Westbound%20Bulua%20Terminal&transMeter=100.5&hour=10"
```

## Test

From `apps/api`:

```bash
python3 -m pytest
```

## C++ Algorithm Integration

Replace the mocked implementation in `app/services/route_service.py`. The
service is the integration point for invoking the future C++ executable or
binding and converting its result into the API response schema.

## Monorepo Development

After completing the API setup once, start both the API and web app from the
repository root:

```bash
pnpm dev
```

Turbo displays each long-running task in its terminal UI. Select `api#dev` or
`web#dev` to inspect its logs.
