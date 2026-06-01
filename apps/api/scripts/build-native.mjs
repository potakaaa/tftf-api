import { spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { readFileSync, existsSync } from "node:fs"

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const nativeDir = resolve(scriptsDir, "../native")
const buildDir = resolve(nativeDir, "build")

// Load apps/api/.env if present and merge into process.env so CMake can
// read values like TFTF_CXX_STANDARD. This allows per-developer overrides
// without committing local changes to CMake files.
const envFile = resolve(scriptsDir, "../.env")
if (existsSync(envFile)) {
  try {
    const raw = readFileSync(envFile, "utf8")
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim()
      if (!trimmed || trimmed.startsWith("#")) continue
      const eq = trimmed.indexOf("=")
      if (eq === -1) continue
      const key = trimmed.slice(0, eq).trim()
      const val = trimmed.slice(eq + 1).trim()
      if (key) process.env[key] = val
    }
  } catch (err) {
    console.warn(`Could not read ${envFile}: ${err.message}`)
  }
}

function run(args) {
  const result = spawnSync("cmake", args, {
    cwd: nativeDir,
    stdio: "inherit",
    shell: process.platform === "win32",
  })

  if (result.error) {
    console.error(`Unable to run CMake: ${result.error.message}`)
    process.exit(1)
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1)
  }
}

run(["-S", nativeDir, "-B", buildDir])
run(["--build", buildDir, "--config", "Release", "--target", "tftf_runner"])
