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
