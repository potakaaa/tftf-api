# TFTF Native Runtime

Production-only C++ route runtime vendored into the FastAPI app. This folder is
self-contained and does not depend on an external TFTFGraph repository.

## Requirements

- CMake
- A C++17 compiler:
  - macOS: Xcode Command Line Tools
  - Linux: GCC or Clang
  - Windows: Visual Studio Build Tools with C++ support

## Build

From the repository root:

```bash
pnpm native:build
```

The cross-platform build script runs CMake and produces:

```text
macOS/Linux: apps/api/native/bin/tftf_runner
Windows:     apps/api/native/bin/tftf_runner.exe
```

Generated files under `build/` and `bin/` are ignored. Do not commit compiled
binaries.

## Runtime Files

```text
native/
  CMakeLists.txt
  data/
    graph.json
  src/
    tftf_runner.cpp
    json.hpp
    TFTFGraph/
```

The runner reads `data/graph.json`, accepts one JSON request per stdin line,
and writes one JSON response per stdout line.
