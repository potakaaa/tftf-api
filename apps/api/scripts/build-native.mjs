import { spawnSync } from "node:child_process"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const scriptsDir = dirname(fileURLToPath(import.meta.url))
const nativeDir = resolve(scriptsDir, "../native")
const buildDir = resolve(nativeDir, "build")

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
run(["--build", buildDir, "--config", "Release", "--target", "tftf_runner", "tftf_graph_builder"])
