import { spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { resolve } from "node:path"

const pythonPath = resolve(
  process.platform === "win32"
    ? ".venv/Scripts/python.exe"
    : ".venv/bin/python",
)

if (!existsSync(pythonPath)) {
  console.error(
    "API virtual environment is missing. Create apps/api/.venv before running this command.",
  )
  process.exit(1)
}

const child = spawn(pythonPath, process.argv.slice(2), {
  stdio: "inherit",
})

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal))
}

child.on("error", (error) => {
  console.error(`Unable to start Python: ${error.message}`)
  process.exit(1)
})

child.on("exit", (code) => {
  process.exit(code ?? 1)
})
