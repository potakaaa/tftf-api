# TFTF Edge API

Self-contained monorepo for TFTF Edge API, a jeepney route calculation service
for Cagayan de Oro. The FastAPI backend includes its production C++ route
runtime under `apps/api/native`; no external TFTFGraph checkout is required.

## Requirements

- Node.js 20 or newer
- pnpm 10
- Python 3.11 or newer
- CMake
- A C++17 compiler:
  - macOS: Xcode Command Line Tools
  - Linux: GCC or Clang
  - Windows: Visual Studio Build Tools with C++ support

## First-time Setup

Install JavaScript dependencies:

```bash
pnpm install
```

Set up the Python API virtual environment.

macOS and Linux:

```bash
cd apps/api
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -e ".[dev]"
cd ../..
```

Windows PowerShell:

```powershell
cd apps/api
py -3 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -e ".[dev]"
cd ../..
```

Or use the repo-managed bootstrap command from the root:

```bash
pnpm --dir apps/api setup
```

Build the OS-specific native route runner:

```bash
pnpm native:build
```

Compiled native files are generated locally and intentionally ignored by Git.

## Verification

Run the same checks that GitHub Actions uses:

```bash
pnpm check
```

## Development

Start the FastAPI backend and TanStack Start web app together:

```bash
pnpm dev
```

Turbo shows `api#dev` and `web#dev` as separate long-running tasks. Each app
prints request logs in its task output.

Default URLs:

- API: `http://127.0.0.1:8000`
- OpenAPI docs: `http://127.0.0.1:8000/docs`
- Web app: `http://localhost:3000`

## Deployment

### Frontend on Netlify

The repository root includes [netlify.toml](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/netlify.toml), and the web app now uses Netlify's TanStack Start Vite plugin in [apps/web/vite.config.ts](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/apps/web/vite.config.ts).

In Netlify:

- Connect the repository at the repo root.
- Let Netlify use `netlify.toml` for build settings.
- Set `VITE_API_BASE_URL` to your Render backend URL, such as `https://tftf-edge-api.onrender.com`.

### Backend on Render

The repository root includes [render.yaml](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/render.yaml), and the API Docker image is defined in [apps/api/Dockerfile](/Volumes/Extreme_SSD/Projects/Tanstack%20Start/tftf-api/apps/api/Dockerfile).

In Render:

- Create the service from the repo's `render.yaml` Blueprint, or create a Docker-based web service that points to `apps/api/Dockerfile`.
- Set `TFTF_CORS_ORIGINS` to a JSON array containing your Netlify site URL, for example `["https://your-site.netlify.app"]`.
- Use `/health` as the health check path.

## Repository Layout

```text
apps/
  api/       # FastAPI backend and vendored C++ route runtime
  web/       # TanStack Start web app
packages/
  shared/    # Shared contracts and configuration when needed
  ui/        # Shared web UI components
```

See [apps/api/README.md](apps/api/README.md) for API commands and native runner
details.
