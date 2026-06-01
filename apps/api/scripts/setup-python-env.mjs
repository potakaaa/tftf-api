import { existsSync } from "node:fs"
import { resolve } from "node:path"
import { spawnSync } from "node:child_process"

const venvPython = resolve(
  process.platform === "win32" ? ".venv/Scripts/python.exe" : ".venv/bin/python",
)

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
    ...options,
  })

  if (result.error) {
    throw result.error
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

function resolveBootstrapCommand() {
  const candidates =
    process.platform === "win32"
      ? [
          ["py", ["-3"]],
          ["python", []],
        ]
      : [
          ["python3", []],
          ["python", []],
        ]

  for (const [command, args] of candidates) {
    const result = spawnSync(command, [...args, "--version"], {
      stdio: "ignore",
      shell: process.platform === "win32",
    })

    if (!result.error && result.status === 0) {
      return [command, args]
    }
  }

  console.error("Unable to find a Python 3 launcher for apps/api setup.")
  process.exit(1)
}

if (!existsSync(venvPython)) {
  const [command, args] = resolveBootstrapCommand()
  run(command, [...args, "-m", "venv", ".venv"])
}

run(venvPython, ["-m", "pip", "install", "--upgrade", "pip"])
run(venvPython, ["-m", "pip", "install", "-e", ".[dev]"])
